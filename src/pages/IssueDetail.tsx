import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MapPin, Edit, Trash2, Flag, ChevronLeft, ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Issue } from "@/components/IssueCard";
import { MapView } from "@/components/MapView";

export default function IssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('civictrack_user');
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      setIsAdmin(userObj.isAdmin || false);
    }

    // Get issue from navigation state or mock data
    if (location.state?.issue) {
      setIssue(location.state.issue);
    } else {
      // Mock issue data - in real app would fetch from API
      const mockIssue: Issue = {
        id: id || '1',
        title: 'Pothole on main road',
        description: 'The main road in c.g road ahmedabad, is riddled with potholes, making it dangerous and difficult to travel on.',
        category: 'Roads',
        status: 'progress',
        location: 'C.G road, Ahmedabad, Gujarat',
        reportedBy: 'Anonymous',
        reportedAt: 'Jun 02, 2025',
        image: '/placeholder.svg',
        coordinates: { lat: 23.0225, lng: 72.5714 }
      };
      setIssue(mockIssue);
    }
  }, [id, location.state]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'bg-status-reported text-status-reported-foreground';
      case 'progress': return 'bg-status-progress text-status-progress-foreground';
      case 'resolved': return 'bg-status-resolved text-status-resolved-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'reported': return 'Reported';
      case 'progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      default: return status;
    }
  };

  const mockActivityLog = [
    { date: 'Jun 02, 10:34 AM', action: 'Reported by user' },
    { date: 'July 26, 09:00 AM', action: 'Assigned to municipal worker' },
    { date: 'July 28, 04:15 PM', action: 'Marked "In Progress"' }
  ];

  const handlePreviousPhoto = () => {
    if (issue?.photos && currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  const handleNextPhoto = () => {
    if (issue?.photos && currentPhotoIndex < issue.photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  if (!issue) {
    return <div>Loading...</div>;
  }

  const isUserIssue = user && issue.reportedBy === 'You';
  const photos = issue.photos || [issue.image];
  const currentPhoto = photos[currentPhotoIndex];

  return (
    <div className="min-h-screen bg-background">
      <Header 
        isLoggedIn={!!user} 
        userName={user?.username}
        isAdmin={isAdmin}
      />
      
      <div className="container mx-auto px-4 py-6">
        {/* Back button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6 p-0 h-auto hover:bg-transparent"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Issue header with actions */}
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getStatusColor(issue.status)}>
                    {getStatusText(issue.status)}
                  </Badge>
                  {isUserIssue && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  )}
                  {!isUserIssue && (
                    <Button variant="outline" size="sm">
                      <Flag className="w-4 h-4 mr-1" />
                      Report Spam
                    </Button>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">{issue.title}</h1>
                <p className="text-sm text-muted-foreground">
                  Reported by {issue.reportedBy} • {issue.reportedAt}
                </p>
              </div>
            </div>

            {/* Issue images */}
            {currentPhoto && (
              <div className="aspect-video rounded-lg overflow-hidden bg-muted relative">
                <img 
                  src={currentPhoto} 
                  alt={issue.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Photo navigation */}
                {photos.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-80 hover:opacity-100"
                      onClick={handlePreviousPhoto}
                      disabled={currentPhotoIndex === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-80 hover:opacity-100"
                      onClick={handleNextPhoto}
                      disabled={currentPhotoIndex === photos.length - 1}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    
                    {/* Photo counter */}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {currentPhotoIndex + 1} of {photos.length}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Photo thumbnails */}
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPhotoIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                      index === currentPhotoIndex 
                        ? 'border-primary' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img 
                      src={photo} 
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {issue.description}
                </p>
              </CardContent>
            </Card>

            {/* Activity Log */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Activity</h3>
                <div className="space-y-3">
                  {mockActivityLog.map((activity, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                      <span className="text-sm text-muted-foreground">{activity.date}</span>
                      <span className="text-sm font-medium">{activity.action}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Location */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-semibold">Location</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{issue.location}</p>
                
                {/* Map */}
                {issue.coordinates && (
                  <div className="h-48 rounded-lg overflow-hidden">
                    <MapView 
                      issues={[issue]}
                      center={[issue.coordinates.lat, issue.coordinates.lng]}
                      zoom={16}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Issue Details */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Issue Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Category</span>
                    <span className="text-sm font-medium">{issue.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge className={getStatusColor(issue.status)} variant="outline">
                      {getStatusText(issue.status)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Reported</span>
                    <span className="text-sm font-medium">{issue.reportedAt}</span>
                  </div>
                  {issue.distance && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Distance</span>
                      <span className="text-sm font-medium">{issue.distance}</span>
                    </div>
                  )}
                  {issue.coordinates && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Coordinates</span>
                      <span className="text-sm font-medium">
                        {issue.coordinates.lat.toFixed(6)}, {issue.coordinates.lng.toFixed(6)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}