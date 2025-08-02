from rest_framework import status, generics, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Avg
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    Category, Issue, IssuePhoto, IssueComment, IssueUpdate,
    IssueAssignment, IssueVote, IssueFlag
)
from .serializers import (
    CategorySerializer, IssueSerializer, IssueCreateSerializer,
    IssueUpdateSerializer, IssueDetailSerializer, IssueListSerializer,
    AdminIssueSerializer, IssueCommentSerializer, CreateCommentSerializer,
    CreateVoteSerializer, CreateFlagSerializer, IssueStatsSerializer,
    IssueAssignmentSerializer
)
from django.contrib.auth import get_user_model
import math
User = get_user_model()


def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees)
    """
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    
    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    # Radius of earth in kilometers
    r = 6371
    
    return c * r


class CategoryListView(generics.ListAPIView):
    """List all active categories"""
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    queryset = Category.objects.filter(is_active=True)
    pagination_class = None  # Disable pagination for categories


class IssueListView(generics.ListAPIView):
    """List issues with filtering and search"""
    serializer_class = IssueListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'category']
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['reported_at', 'updated_at', 'priority']
    ordering = ['-reported_at']
    
    def get_queryset(self):
        queryset = Issue.objects.filter(is_hidden=False)
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by category
        category_filter = self.request.query_params.get('category', None)
        if category_filter:
            # Try to find category by name first
            try:
                category = Category.objects.get(name__iexact=category_filter)
                queryset = queryset.filter(category=category)
            except Category.DoesNotExist:
                # If not found by name, try by ID
                queryset = queryset.filter(category_id=category_filter)
        
        # Filter by location (nearby issues) - accurate distance calculation
        lat = self.request.query_params.get('lat', None)
        lng = self.request.query_params.get('lng', None)
        radius = self.request.query_params.get('radius', 10)  # Default 10km
        
        if lat and lng:
            try:
                user_lat = float(lat)
                user_lng = float(lng)
                radius_km = float(radius)
                
                # First, get all issues with coordinates
                issues_with_coords = queryset.filter(
                    latitude__isnull=False,
                    longitude__isnull=False
                )
                
                # Filter issues within the specified radius using Haversine formula
                nearby_issues = []
                for issue in issues_with_coords:
                    distance = haversine_distance(
                        user_lat, user_lng,
                        float(issue.latitude), float(issue.longitude)
                    )
                    if distance <= radius_km:
                        # Add distance to issue for frontend display
                        issue.distance_km = round(distance, 1)
                        nearby_issues.append(issue)
                
                # Return filtered queryset
                issue_ids = [issue.id for issue in nearby_issues]
                queryset = queryset.filter(id__in=issue_ids)
                
            except (ValueError, TypeError):
                pass
        
        return queryset


class IssueCreateView(APIView):
    """Create a new issue"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = IssueCreateSerializer(data=request.data)
        if serializer.is_valid():
            issue = serializer.save(reported_by=request.user)
            
            # Update user profile stats
            try:
                profile = request.user.profile
                profile.increment_reports()
            except:
                pass
            
            # Create initial update
            IssueUpdate.objects.create(
                issue=issue,
                user=request.user,
                update_type='status_change',
                title='Issue Reported',
                description='Issue has been reported and is under review',
                new_value='reported'
            )
            
            return Response(
                IssueSerializer(issue).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class IssueDetailView(generics.RetrieveAPIView):
    """Get detailed issue information"""
    serializer_class = IssueDetailSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Issue.objects.filter(is_hidden=False)


class IssueUpdateView(APIView):
    """Update issue (admin only)"""
    permission_classes = [permissions.IsAdminUser]
    
    def put(self, request, pk):
        issue = get_object_or_404(Issue, pk=pk)
        serializer = IssueUpdateSerializer(issue, data=request.data, partial=True)
        
        if serializer.is_valid():
            old_status = issue.status
            old_priority = issue.priority
            
            issue = serializer.save()
            
            # Create update records for changes
            if old_status != issue.status:
                IssueUpdate.objects.create(
                    issue=issue,
                    user=request.user,
                    update_type='status_change',
                    title=f'Status changed to {issue.get_status_display()}',
                    description=f'Issue status updated from {old_status} to {issue.status}',
                    old_value=old_status,
                    new_value=issue.status
                )
            
            if old_priority != issue.priority:
                IssueUpdate.objects.create(
                    issue=issue,
                    user=request.user,
                    update_type='priority_change',
                    title=f'Priority changed to {issue.get_priority_display()}',
                    description=f'Issue priority updated from {old_priority} to {issue.priority}',
                    old_value=old_priority,
                    new_value=issue.priority
                )
            
            return Response(IssueSerializer(issue).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyIssuesView(generics.ListAPIView):
    """Get issues reported by current user"""
    serializer_class = IssueListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Issue.objects.filter(
            reported_by=self.request.user,
            is_hidden=False
        ).order_by('-reported_at')


class IssueCommentView(APIView):
    """Add comment to issue"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        issue = get_object_or_404(Issue, pk=pk)
        serializer = CreateCommentSerializer(data=request.data)
        
        if serializer.is_valid():
            comment = serializer.save(
                issue=issue,
                user=request.user
            )
            return Response(
                IssueCommentSerializer(comment).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class IssueVoteView(APIView):
    """Vote on issue"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        issue = get_object_or_404(Issue, pk=pk)
        serializer = CreateVoteSerializer(data=request.data)
        
        if serializer.is_valid():
            vote_value = serializer.validated_data['vote']
            
            # Check if user already voted
            existing_vote = IssueVote.objects.filter(
                issue=issue,
                user=request.user
            ).first()
            
            if existing_vote:
                if existing_vote.vote == vote_value:
                    # Remove vote if same vote
                    existing_vote.delete()
                else:
                    # Update vote
                    existing_vote.vote = vote_value
                    existing_vote.save()
            else:
                # Create new vote
                IssueVote.objects.create(
                    issue=issue,
                    user=request.user,
                    vote=vote_value
                )
            
            return Response({'message': 'Vote recorded successfully'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class IssueFlagView(APIView):
    """Flag an issue"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        issue = get_object_or_404(Issue, pk=pk)
        serializer = CreateFlagSerializer(data=request.data)
        
        if serializer.is_valid():
            # Check if user already flagged
            existing_flag = IssueFlag.objects.filter(
                issue=issue,
                user=request.user
            ).first()
            
            if existing_flag:
                return Response(
                    {'error': 'You have already flagged this issue'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            flag = serializer.save(
                issue=issue,
                user=request.user
            )
            
            # Increment issue flag count
            issue.increment_flags()
            
            return Response(
                {'message': 'Issue flagged successfully'},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Admin Views
class AdminIssueListView(generics.ListAPIView):
    """Admin view to list all issues"""
    serializer_class = AdminIssueSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'category', 'is_hidden']
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['reported_at', 'updated_at', 'flags']
    ordering = ['-reported_at']
    
    def get_queryset(self):
        queryset = Issue.objects.all()
        
        # Show hidden issues for admins
        show_hidden = self.request.query_params.get('show_hidden', 'false').lower() == 'true'
        if show_hidden:
            queryset = queryset.filter(is_hidden=True)
        else:
            queryset = queryset.filter(is_hidden=False)
        
        return queryset


class AdminIssueDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin view to manage individual issues"""
    serializer_class = AdminIssueSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Issue.objects.all()
    
    def perform_destroy(self, instance):
        # Soft delete - just hide the issue
        instance.is_hidden = True
        instance.save()


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def toggle_issue_visibility(request, pk):
    """Toggle issue visibility (hide/show)"""
    issue = get_object_or_404(Issue, pk=pk)
    issue.is_hidden = not issue.is_hidden
    issue.save()
    
    return Response({
        'message': f'Issue {"hidden" if issue.is_hidden else "shown"} successfully',
        'is_hidden': issue.is_hidden
    })


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def assign_issue(request, pk):
    """Assign issue to a user"""
    issue = get_object_or_404(Issue, pk=pk)
    assigned_to_id = request.data.get('assigned_to')
    due_date = request.data.get('due_date')
    notes = request.data.get('notes', '')
    
    if not assigned_to_id:
        return Response(
            {'error': 'assigned_to is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        assigned_to = User.objects.get(id=assigned_to_id)
    except User.DoesNotExist:
        return Response(
            {'error': 'Invalid user ID'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Deactivate existing assignments
    IssueAssignment.objects.filter(issue=issue, is_active=True).update(is_active=False)
    
    # Create new assignment
    assignment = IssueAssignment.objects.create(
        issue=issue,
        assigned_to=assigned_to,
        assigned_by=request.user,
        due_date=due_date,
        notes=notes
    )
    
    # Create update record
    IssueUpdate.objects.create(
        issue=issue,
        user=request.user,
        update_type='assignment',
        title=f'Assigned to {assigned_to.username}',
        description=f'Issue assigned to {assigned_to.username}',
        new_value=assigned_to.username
    )
    
    return Response({
        'message': f'Issue assigned to {assigned_to.username}',
        'assignment': IssueAssignmentSerializer(assignment).data
    })


@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def issue_statistics(request):
    """Get issue statistics for admin dashboard"""
    total_issues = Issue.objects.count()
    reported_issues = Issue.objects.filter(status='reported').count()
    in_progress_issues = Issue.objects.filter(status='progress').count()
    resolved_issues = Issue.objects.filter(status='resolved').count()
    urgent_issues = Issue.objects.filter(priority='urgent').count()
    flagged_issues = Issue.objects.filter(flags__gt=0).count()
    
    # Average resolution time
    resolved_issues_with_time = Issue.objects.filter(
        status='resolved',
        actual_resolution_time__isnull=False
    )
    avg_resolution_time = resolved_issues_with_time.aggregate(
        avg_time=Avg('actual_resolution_time')
    )['avg_time'] or 0
    
    # Issues by category
    issues_by_category = {}
    categories = Category.objects.all()
    for category in categories:
        issues_by_category[category.name] = Issue.objects.filter(category=category).count()
    
    # Issues by status
    issues_by_status = {}
    for status_choice in Issue.STATUS_CHOICES:
        issues_by_status[status_choice[1]] = Issue.objects.filter(status=status_choice[0]).count()
    
    stats = {
        'total_issues': total_issues,
        'reported_issues': reported_issues,
        'in_progress_issues': in_progress_issues,
        'resolved_issues': resolved_issues,
        'urgent_issues': urgent_issues,
        'flagged_issues': flagged_issues,
        'avg_resolution_time': round(avg_resolution_time, 1),
        'issues_by_category': issues_by_category,
        'issues_by_status': issues_by_status
    }
    
    serializer = IssueStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def nearby_issues(request):
    """Get issues near user's location"""
    lat = request.query_params.get('lat')
    lng = request.query_params.get('lng')
    radius = request.query_params.get('radius', 5)  # Default 5km
    
    if not lat or not lng:
        return Response(
            {'error': 'Latitude and longitude are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user_lat = float(lat)
        user_lng = float(lng)
        radius_km = float(radius)
        
        # Simple bounding box calculation (approximation for nearby issues)
        # 1 degree latitude ≈ 111 km
        lat_delta = radius_km / 111.0
        lng_delta = radius_km / (111.0 * abs(user_lat) / 90.0) if user_lat != 0 else radius_km / 111.0
        
        nearby_issues = Issue.objects.filter(
            latitude__range=(user_lat - lat_delta, user_lat + lat_delta),
            longitude__range=(user_lng - lng_delta, user_lng + lng_delta),
            latitude__isnull=False,
            longitude__isnull=False
        ).order_by('-reported_at')[:20]  # Limit to 20 recent issues
        
        serializer = IssueListSerializer(nearby_issues, many=True)
        return Response(serializer.data)
    except (ValueError, TypeError):
        return Response(
            {'error': 'Invalid coordinates'},
            status=status.HTTP_400_BAD_REQUEST
        )