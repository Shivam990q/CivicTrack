from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Category, Issue, IssuePhoto, IssueComment, IssueUpdate,
    IssueAssignment, IssueVote, IssueFlag
)

User = get_user_model()


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model"""
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'icon', 'color', 'is_active']


class IssuePhotoSerializer(serializers.ModelSerializer):
    """Serializer for IssuePhoto model"""
    
    class Meta:
        model = IssuePhoto
        fields = ['id', 'image', 'caption', 'uploaded_at', 'is_primary']


class IssueCommentSerializer(serializers.ModelSerializer):
    """Serializer for IssueComment model"""
    
    user = serializers.StringRelatedField()
    
    class Meta:
        model = IssueComment
        fields = ['id', 'user', 'content', 'created_at', 'updated_at', 'is_public']
        read_only_fields = ['user', 'created_at', 'updated_at']


class IssueUpdateSerializer(serializers.ModelSerializer):
    """Serializer for IssueUpdate model"""
    
    user = serializers.StringRelatedField()
    
    class Meta:
        model = IssueUpdate
        fields = [
            'id', 'user', 'update_type', 'title', 'description',
            'old_value', 'new_value', 'created_at'
        ]
        read_only_fields = ['user', 'created_at']


class IssueVoteSerializer(serializers.ModelSerializer):
    """Serializer for IssueVote model"""
    
    user = serializers.StringRelatedField()
    
    class Meta:
        model = IssueVote
        fields = ['id', 'user', 'vote', 'created_at']
        read_only_fields = ['user', 'created_at']


class IssueFlagSerializer(serializers.ModelSerializer):
    """Serializer for IssueFlag model"""
    
    user = serializers.StringRelatedField()
    resolved_by = serializers.StringRelatedField()
    
    class Meta:
        model = IssueFlag
        fields = [
            'id', 'user', 'reason', 'description', 'created_at',
            'is_resolved', 'resolved_by', 'resolved_at'
        ]
        read_only_fields = ['user', 'created_at', 'resolved_by', 'resolved_at']


class IssueSerializer(serializers.ModelSerializer):
    """Serializer for Issue model"""
    
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    photos = IssuePhotoSerializer(many=True, read_only=True)
    comments = IssueCommentSerializer(many=True, read_only=True)
    votes = IssueVoteSerializer(many=True, read_only=True)
    flag_instances = IssueFlagSerializer(many=True, read_only=True)
    reporter_name = serializers.CharField(read_only=True)
    days_since_reported = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Issue
        fields = [
            'id', 'title', 'description', 'category', 'category_id',
            'status', 'priority', 'location', 'latitude', 'longitude',
            'reported_by', 'is_anonymous', 'reporter_name',
            'reported_at', 'updated_at', 'resolved_at',
            'estimated_resolution_time', 'actual_resolution_time',
            'flags', 'is_hidden', 'moderation_notes',
            'photos', 'comments', 'votes', 'flag_instances', 'days_since_reported'
        ]
        read_only_fields = [
            'id', 'reported_at', 'updated_at', 'resolved_at',
            'actual_resolution_time', 'flags', 'reporter_name',
            'days_since_reported'
        ]


class IssueCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new issues"""
    
    category_id = serializers.IntegerField()
    photos = serializers.ListField(
        child=serializers.ImageField(),
        required=False
    )
    latitude = serializers.FloatField(write_only=True)
    longitude = serializers.FloatField(write_only=True)
    
    class Meta:
        model = Issue
        fields = [
            'title', 'description', 'category_id', 'priority',
            'location', 'latitude', 'longitude', 'is_anonymous',
            'estimated_resolution_time', 'photos'
        ]
    
    def create(self, validated_data):
        photos = validated_data.pop('photos', [])
        latitude = validated_data.pop('latitude')
        longitude = validated_data.pop('longitude')
        category_id = validated_data.pop('category_id')
        
        # Get category
        try:
            category = Category.objects.get(id=category_id)
        except Category.DoesNotExist:
            raise serializers.ValidationError("Invalid category")
        
        # Create issue
        issue = Issue.objects.create(
            category=category,
            latitude=latitude,
            longitude=longitude,
            **validated_data
        )
        
        # Add photos
        for i, photo in enumerate(photos):
            IssuePhoto.objects.create(
                issue=issue,
                image=photo,
                is_primary=(i == 0)  # First photo is primary
            )
        
        return issue


class IssueUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating issues"""
    
    class Meta:
        model = Issue
        fields = [
            'title', 'description', 'status', 'priority',
            'estimated_resolution_time', 'moderation_notes'
        ]


class IssueDetailSerializer(IssueSerializer):
    """Detailed serializer for Issue model with all related data"""
    
    updates = IssueUpdateSerializer(many=True, read_only=True)
    assignments = serializers.SerializerMethodField()
    
    class Meta(IssueSerializer.Meta):
        fields = IssueSerializer.Meta.fields + ['updates', 'assignments']
    
    def get_assignments(self, obj):
        active_assignments = obj.assignments.filter(is_active=True)
        return [
            {
                'id': assignment.id,
                'assigned_to': assignment.assigned_to.username,
                'assigned_by': assignment.assigned_by.username,
                'assigned_at': assignment.assigned_at,
                'due_date': assignment.due_date,
                'notes': assignment.notes
            }
            for assignment in active_assignments
        ]


class IssueListSerializer(serializers.ModelSerializer):
    """Simplified serializer for issue lists"""
    
    category = CategorySerializer(read_only=True)
    primary_photo = serializers.SerializerMethodField()
    reporter_name = serializers.CharField(read_only=True)
    days_since_reported = serializers.IntegerField(read_only=True)
    vote_count = serializers.SerializerMethodField()
    distance_km = serializers.SerializerMethodField()
    
    class Meta:
        model = Issue
        fields = [
            'id', 'title', 'description', 'category', 'status',
            'location', 'latitude', 'longitude', 'reported_by',
            'reported_at', 'updated_at', 'is_anonymous', 'reporter_name',
            'primary_photo', 'days_since_reported', 'vote_count', 'distance_km'
        ]
    
    def get_primary_photo(self, obj):
        primary_photo = obj.photos.filter(is_primary=True).first()
        return primary_photo.image.url if primary_photo else None
    
    def get_vote_count(self, obj):
        return obj.votes.count()
    
    def get_distance_km(self, obj):
        # Return the calculated distance if available
        return getattr(obj, 'distance_km', None)


class AdminIssueSerializer(serializers.ModelSerializer):
    """Admin serializer for Issue model"""
    
    category = CategorySerializer(read_only=True)
    reported_by = serializers.StringRelatedField()
    photos = IssuePhotoSerializer(many=True, read_only=True)
    comments_count = serializers.SerializerMethodField()
    votes_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Issue
        fields = [
            'id', 'title', 'description', 'category', 'status', 'priority',
            'location', 'reported_by', 'is_anonymous', 'reported_at',
            'updated_at', 'resolved_at', 'flags', 'is_hidden',
            'photos', 'comments_count', 'votes_count'
        ]
    
    def get_comments_count(self, obj):
        return obj.comments.filter(is_public=True).count()
    
    def get_votes_count(self, obj):
        upvotes = obj.votes.filter(vote=1).count()
        downvotes = obj.votes.filter(vote=-1).count()
        return upvotes - downvotes


class IssueAssignmentSerializer(serializers.ModelSerializer):
    """Serializer for IssueAssignment model"""
    
    assigned_to = serializers.StringRelatedField()
    assigned_by = serializers.StringRelatedField()
    issue = serializers.StringRelatedField()
    
    class Meta:
        model = IssueAssignment
        fields = [
            'id', 'issue', 'assigned_to', 'assigned_by',
            'assigned_at', 'due_date', 'notes', 'is_active'
        ]
        read_only_fields = ['assigned_by', 'assigned_at']


class CreateCommentSerializer(serializers.ModelSerializer):
    """Serializer for creating comments"""
    
    class Meta:
        model = IssueComment
        fields = ['content', 'is_public']


class CreateVoteSerializer(serializers.ModelSerializer):
    """Serializer for creating votes"""
    
    class Meta:
        model = IssueVote
        fields = ['vote']


class CreateFlagSerializer(serializers.ModelSerializer):
    """Serializer for creating flags"""
    
    class Meta:
        model = IssueFlag
        fields = ['reason', 'description']


class IssueStatsSerializer(serializers.Serializer):
    """Serializer for issue statistics"""
    
    total_issues = serializers.IntegerField()
    reported_issues = serializers.IntegerField()
    in_progress_issues = serializers.IntegerField()
    resolved_issues = serializers.IntegerField()
    urgent_issues = serializers.IntegerField()
    flagged_issues = serializers.IntegerField()
    avg_resolution_time = serializers.FloatField()
    issues_by_category = serializers.DictField()
    issues_by_status = serializers.DictField() 