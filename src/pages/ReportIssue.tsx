import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, MapPin, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { PhotoUpload } from "@/components/PhotoUpload";
import { LocationPicker } from "@/components/LocationPicker";

export default function ReportIssue() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    anonymous: false
  });

  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('civictrack_user');
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      setIsAdmin(userObj.isAdmin || false);
      
      // Set anonymous default based on user preferences
      setFormData(prev => ({
        ...prev,
        anonymous: userObj.privacy?.anonymousReports || false
      }));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!selectedLocation) {
      toast({
        title: "Location Required",
        description: "Please select a location for the issue",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    
    try {
      // Simulate API call for issue submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create mock issue data
      const newIssue = {
        id: `issue-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        status: 'reported' as const,
        location: selectedLocation.address,
        reportedBy: formData.anonymous ? 'Anonymous' : user.username,
        reportedAt: new Date().toLocaleDateString(),
        image: uploadedPhotos[0] || '/placeholder.svg',
        coordinates: {
          lat: selectedLocation.lat,
          lng: selectedLocation.lng
        },
        photos: uploadedPhotos
      };

      // Store in localStorage for demo purposes
      const existingIssues = JSON.parse(localStorage.getItem('civictrack_issues') || '[]');
      existingIssues.unshift(newIssue);
      localStorage.setItem('civictrack_issues', JSON.stringify(existingIssues));

      toast({
        title: "Issue Reported Successfully",
        description: "Your issue has been submitted and will be reviewed by local authorities",
      });

      // Navigate back to home
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit issue. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      category: value
    }));
  };

  const handleAnonymousChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      anonymous: checked
    }));
  };

  const handleLocationChange = (location: { lat: number; lng: number; address: string }) => {
    setSelectedLocation(location);
  };

  const handlePhotosChange = (photos: any[]) => {
    // In a real app, this would handle the uploaded photo URLs
    setUploadedPhotos(photos.map((_, index) => `https://api.civictrack.com/uploads/photo-${Date.now()}-${index}.jpg`));
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        isLoggedIn={true} 
        userName={user?.username}
        isAdmin={isAdmin}
      />
      
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Camera className="w-6 h-6" />
                Report New Issue
              </CardTitle>
              <p className="text-muted-foreground">
                Help improve your community by reporting local issues
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Photo Upload Section */}
                <PhotoUpload 
                  maxPhotos={5}
                  maxFileSize={10}
                  onPhotosChange={handlePhotosChange}
                />

                {/* Location Picker */}
                <LocationPicker 
                  onLocationChange={handleLocationChange}
                />

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={handleSelectChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Roads">Roads (potholes, obstructions)</SelectItem>
                      <SelectItem value="Lighting">Lighting (broken or flickering lights)</SelectItem>
                      <SelectItem value="Water Supply">Water Supply (leaks, low pressure)</SelectItem>
                      <SelectItem value="Cleanliness">Cleanliness (overflowing bins, garbage)</SelectItem>
                      <SelectItem value="Public Safety">Public Safety (open manholes, exposed wiring)</SelectItem>
                      <SelectItem value="Obstructions">Obstructions (fallen trees, debris)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Issue Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Brief title describing the issue"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Detailed description of the issue..."
                    rows={4}
                    required
                  />
                </div>

                {/* Anonymous Reporting */}
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="anonymous"
                    checked={formData.anonymous}
                    onCheckedChange={handleAnonymousChange}
                  />
                  <Label htmlFor="anonymous" className="text-sm">
                    Report Anonymous
                  </Label>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full" 
                  variant="civic"
                  size="lg"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting Issue...
                    </>
                  ) : (
                    'Submit Issue'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}