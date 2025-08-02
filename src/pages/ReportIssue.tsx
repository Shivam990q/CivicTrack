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
import { getImageForCategory } from "@/lib/imageMapping";
import { issuesAPI, categoriesAPI, type Category } from "@/lib/api";

export default function ReportIssue() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
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

  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);

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

    // Fetch categories from API
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const apiCategories = await categoriesAPI.getCategories();
        setCategories(apiCategories);
      } catch (error: any) {
        console.error('Failed to fetch categories:', error);
        toast({
          title: "Error loading categories",
          description: "Using default categories. Some features may be limited.",
          variant: "destructive"
        });
        // Fallback to default categories
        setCategories([
          { id: 1, name: 'Roads' },
          { id: 2, name: 'Lighting' },
          { id: 3, name: 'Water Supply' },
          { id: 4, name: 'Cleanliness' },
          { id: 5, name: 'Public Safety' },
          { id: 6, name: 'Obstructions' },
        ]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [navigate, toast]);

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
      // Create issue using real API
      const issueData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        location: selectedLocation.address,
        anonymous: formData.anonymous,
        photos: uploadedPhotos.length > 0 ? uploadedPhotos : undefined
      };

      const newIssue = await issuesAPI.createIssue(issueData);

      toast({
        title: "Issue Reported Successfully",
        description: "Your issue has been submitted and will be reviewed by local authorities",
      });

      // Navigate back to home after a short delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error: any) {
      console.error('Error submitting issue:', error);
      toast({
        title: "Submission Failed",
        description: error?.message || "Failed to submit issue. Please try again.",
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
    // Only update if it's a valid category (not loading or disabled options)
    if (value && value !== 'loading' && value !== 'no-categories') {
      setFormData(prev => ({
        ...prev,
        category: value
      }));
    }
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

  const handlePhotosChange = (photos: File[]) => {
    setUploadedPhotos(photos);
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
                      <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select issue category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingCategories ? (
                        <SelectItem value="loading" disabled>
                          Loading categories...
                        </SelectItem>
                      ) : categories.length > 0 ? (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                            {category.description && (
                              <span className="text-xs text-muted-foreground ml-2">
                                ({category.description})
                              </span>
                            )}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-categories" disabled>
                          No categories available
                        </SelectItem>
                      )}
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
                  disabled={submitting || loadingCategories}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting Issue...
                    </>
                  ) : loadingCategories ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
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