import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight, MapPin, Clock, User, Filter, Grid, Map, Edit } from "lucide-react";
import { Header } from "@/components/Header";
import { IssueCard, Issue } from "@/components/IssueCard";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useToast } from "@/hooks/use-toast";
import { issuesAPI, categoriesAPI, Issue as APIIssue, Category } from "@/lib/api";
import { getImageForCategory } from "@/lib/imageMapping";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Mock data that matches the wireframe exactly
const mockIssues: Issue[] = [
  {
    id: '1',
    title: 'Streetlight not working',
    description: 'street light not working since last 2 days',
    category: 'Streetlight',
    status: 'progress',
    location: 'gota bridge, ahmedabad, gujarat',
    reportedBy: 'Anonymous',
    reportedAt: 'Aug 19',
    image: '/broken street furniture.png',
    distance: '2.8 km',
    coordinates: { lat: 23.0225, lng: 72.5714 }
  },
  {
    id: '2',
    title: 'Pothole on main road',
    description: 'The main road in c.g road, ahmedabad, is riddled with potholes, making it dangerous and difficult to travel on.',
    category: 'Road',
    status: 'reported',
    location: 'C.G road, ahmedabad, gujarat',
    reportedBy: 'Anonymous',
    reportedAt: 'Jun 02',
    image: '/Pothole on main road.png',
    distance: '1.1 km',
    coordinates: { lat: 23.0255, lng: 72.5754 }
  },
  {
    id: '3',
    title: 'Garbage not collected',
    description: 'Garbage is not collected since week it\'s smell bad and very difficult to leave here.',
    category: 'Garbage Collection',
    status: 'reported',
    location: 'IT society, ahmedabad, gujarat',
    reportedBy: 'Anonymous',
    reportedAt: 'Jun 25',
    image: '/hole.png',
    distance: '1.1 km',
    coordinates: { lat: 23.0205, lng: 72.5674 }
  },
  {
    id: '4',
    title: 'Road marking faded',
    description: 'Road markings have completely faded making it difficult for drivers to follow traffic rules.',
    category: 'Road',
    status: 'progress',
    location: 'Satellite area, ahmedabad, gujarat',
    reportedBy: 'Anonymous',
    reportedAt: 'Aug 15',
    image: '/Road marking faded.png',
    distance: '3.2 km',
    coordinates: { lat: 23.0245, lng: 72.5734 }
  },
  {
    id: '5',
    title: 'Missing manhole cover',
    description: 'Manhole cover is missing creating a dangerous situation for pedestrians and vehicles.',
    category: 'Public Safety',
    status: 'reported',
    location: 'Vastrapur, ahmedabad, gujarat',
    reportedBy: 'Anonymous',
    reportedAt: 'Jul 10',
    image: '/missing manhole cover.png',
    distance: '2.5 km',
    coordinates: { lat: 23.0265, lng: 72.5774 }
  },
  {
    id: '6',
    title: 'Illegal parking',
    description: 'Vehicles are parked illegally blocking the main road and causing traffic congestion.',
    category: 'Traffic Signal',
    status: 'reported',
    location: 'Navrangpura, ahmedabad, gujarat',
    reportedBy: 'Anonymous',
    reportedAt: 'Aug 05',
    image: '/high traffic.png',
    distance: '1.8 km',
    coordinates: { lat: 23.0185, lng: 72.5654 }
  },
  {
    id: '7',
    title: 'Broken street furniture',
    description: 'Street furniture like benches and bins are broken and need immediate repair.',
    category: 'Obstructions',
    status: 'progress',
    location: 'Law Garden, ahmedabad, gujarat',
    reportedBy: 'Anonymous',
    reportedAt: 'Jul 20',
    image: '/illegal parking.png',
    distance: '2.1 km',
    coordinates: { lat: 23.0200, lng: 72.5700 }
  },
  {
    id: '8',
    title: 'Street vendor obstruction',
    description: 'Street vendors are blocking pedestrian walkways and creating obstructions.',
    category: 'Obstructions',
    status: 'reported',
    location: 'Manek Chowk, ahmedabad, gujarat',
    reportedBy: 'Anonymous',
    reportedAt: 'Aug 12',
    image: '/Street vendor obstruction.png',
    distance: '3.5 km',
    coordinates: { lat: 23.0220, lng: 72.5720 }
  },
  {
    id: '9',
    title: 'Water supply issue',
    description: 'Water supply has been disrupted in the area for the past week.',
    category: 'Water Supply',
    status: 'reported',
    location: 'Bodakdev, ahmedabad, gujarat',
    reportedBy: 'Anonymous',
    reportedAt: 'Aug 08',
    image: '/flood.png',
    distance: '4.2 km',
    coordinates: { lat: 23.0240, lng: 72.5740 }
  },
  {
    id: '10',
    title: 'Drainage problem',
    description: 'Drainage system is blocked causing water logging during rains.',
    category: 'Drainage',
    status: 'progress',
    location: 'Paldi, ahmedabad, gujarat',
    reportedBy: 'Anonymous',
    reportedAt: 'Jul 28',
    image: '/placeholder.svg',
    distance: '3.8 km',
    coordinates: { lat: 23.0260, lng: 72.5760 }
  },
  {
    id: '11',
    title: 'Traffic signal malfunction',
    description: 'Traffic signal is not working properly causing traffic chaos.',
    category: 'Traffic Signal',
    status: 'reported',
    location: 'Ellis Bridge, ahmedabad, gujarat',
    reportedBy: 'Anonymous',
    reportedAt: 'Aug 10',
    image: '/flood.png',
    distance: '2.9 km',
    coordinates: { lat: 23.0280, lng: 72.5780 }
  },
  {
    id: '12',
    title: 'Street light pole damaged',
    description: 'Street light pole is damaged and needs immediate repair.',
    category: 'Streetlight',
    status: 'reported',
    location: 'Gujarat High Court, ahmedabad, gujarat',
    reportedBy: 'Anonymous',
    reportedAt: 'Aug 14',
    image: '/broken street furniture.png',
    distance: '1.5 km',
    coordinates: { lat: 23.0300, lng: 72.5800 }
  },
  {
    id: '13',
    title: 'Parking violation',
    description: 'Vehicles parked in no-parking zone causing obstruction.',
    category: 'Parking',
    status: 'reported',
    location: 'Satellite area, ahmedabad, gujarat',
    reportedBy: 'Anonymous',
    reportedAt: 'Aug 16',
    image: '/parking.png',
    distance: '2.3 km',
    coordinates: { lat: 23.0240, lng: 72.5740 }
  },
  {
    id: '14',
    title: 'Traffic rules violation',
    description: 'Drivers not following traffic rules at intersection.',
    category: 'Traffic Rules',
    status: 'reported',
    location: 'Navrangpura, ahmedabad, gujarat',
    reportedBy: 'Anonymous',
    reportedAt: 'Aug 18',
    image: '/rules break.png',
    distance: '1.7 km',
    coordinates: { lat: 23.0185, lng: 72.5654 }
  }
];

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [distanceFilter, setDistanceFilter] = useState('all');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [manualLatitude, setManualLatitude] = useState('');
  const [manualLongitude, setManualLongitude] = useState('');
  // Dynamic map center - will be set to user's real location
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);

  const { location: gpsLocation, getCurrentLocation } = useGeolocation();

  // Geocoding function to get address from coordinates
  const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'CivicTrack/1.0'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.display_name) {
          return data.display_name;
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    
    // Fallback to coordinates if geocoding fails
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };

  // Convert API issue to frontend issue format
  const convertAPIIssue = (apiIssue: APIIssue): Issue => {
    // Calculate distance if user location is available
    let distance = 'Unknown';
    if (userLocation && apiIssue.latitude && apiIssue.longitude) {
      const lat = Number(apiIssue.latitude);
      const lng = Number(apiIssue.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        // Use distance from API if available, otherwise calculate client-side
        if (apiIssue.distance_km) {
          distance = `${apiIssue.distance_km} km`;
        } else {
          const calculatedDistance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            lat,
            lng
          );
          distance = `${calculatedDistance.toFixed(1)} km`;
        }
      }
    }

    // Use the utility function for image mapping

    return {
      id: apiIssue.id,
      title: apiIssue.title,
      description: apiIssue.description,
      category: typeof apiIssue.category === 'string' ? apiIssue.category : (apiIssue.category as any)?.name,
      status: apiIssue.status,
      location: apiIssue.location,
      reportedBy: apiIssue.reporter_name || apiIssue.reported_by || 'Anonymous',
      reportedAt: new Date(apiIssue.reported_at).toLocaleDateString('en-US', { 
        month: 'short', 
        day: '2-digit' 
      }),
      image: getImageForCategory(apiIssue.category),
      distance: distance,
      coordinates: apiIssue.latitude && apiIssue.longitude ? {
        lat: Number(apiIssue.latitude),
        lng: Number(apiIssue.longitude)
      } : undefined
    };
  };

  // Fetch issues from API
  const fetchIssues = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: '6', // Show 6 issues per page
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (categoryFilter && categoryFilter !== 'all') {
        params.append('category', categoryFilter);
      }
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (distanceFilter && distanceFilter !== 'all' && userLocation) {
        const distance = distanceFilter.replace('km', '');
        params.append('lat', userLocation.lat.toString());
        params.append('lng', userLocation.lng.toString());
        params.append('radius', distance);
      }

      const response = await fetch(`${API_BASE_URL}/issues/?${params}`);
      if (response.ok) {
        const data = await response.json();
        const convertedIssues = data.results.map(convertAPIIssue);
        setIssues(convertedIssues);
        setTotalPages(Math.ceil(data.count / 6)); // Calculate total pages based on 6 per page
      } else {
        console.error('Failed to fetch issues');
        setIssues([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
      setIssues([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const apiCategories = await categoriesAPI.getCategories();
      setCategories(apiCategories);
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
      // Fallback to default categories
      setCategories([
        { id: 1, name: 'Road' },
        { id: 2, name: 'Streetlight' },
        { id: 3, name: 'Garbage Collection' },
        { id: 4, name: 'Water Supply' },
        { id: 5, name: 'Public Safety' },
        { id: 6, name: 'Obstructions' },
      ]);
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('civictrack_user');
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      setIsAdmin(userObj.isAdmin || false);
    }

    // Fetch initial data
    const loadData = async () => {
      try {
        await Promise.all([
          fetchIssues(),
          fetchCategories()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (gpsLocation) {
      setUserLocation({
        lat: gpsLocation.latitude,
        lng: gpsLocation.longitude
      });
    }
  }, [gpsLocation]);

  // Fetch issues when page or filters change
  useEffect(() => {
    fetchIssues();
  }, [currentPage, searchTerm, categoryFilter, statusFilter, distanceFilter]);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const handleIssueClick = (issue: Issue) => {
    navigate(`/issue/${issue.id}`, { state: { issue } });
  };

  const handleGetLocation = async () => {
    try {
      setLocationLoading(true);
      const locationData = await getCurrentLocation();
      
      if (locationData) {
        const address = await getAddressFromCoordinates(locationData.latitude, locationData.longitude);
        setLocationAddress(address);
        const newLocation = { lat: locationData.latitude, lng: locationData.longitude };
        setUserLocation(newLocation);
        setMapCenter(newLocation); // Center map on your real location
        toast({
          title: "Location obtained",
          description: `Your real GPS location detected: ${address}`,
          duration: 5000, // Auto-dismiss after 5 seconds
        });
      }
    } catch (error) {
      console.error('Failed to get location:', error);
      toast({
        title: "Location error",
        description: "Could not get your real GPS location. Please check permissions or enter manually.",
        variant: "destructive",
        duration: 5000, // Auto-dismiss after 5 seconds
      });
      setShowLocationInput(true);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleManualLocationSubmit = async () => {
    const lat = parseFloat(manualLatitude);
    const lng = parseFloat(manualLongitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      toast({
        title: "Invalid coordinates",
        description: "Please enter valid latitude and longitude values",
        variant: "destructive",
        duration: 5000, // Auto-dismiss after 5 seconds
      });
      return;
    }
    
    try {
      setLocationLoading(true);
      // Get address for the coordinates
      const address = await getAddressFromCoordinates(lat, lng);
      setLocationAddress(address);
      const newLocation = { lat, lng };
      setUserLocation(newLocation);
      setMapCenter(newLocation); // Center map on user location
      setShowLocationInput(false);
      setManualLatitude('');
      setManualLongitude('');
      toast({
        title: "Location set",
        description: `Manual location set: ${address}`,
        duration: 5000, // Auto-dismiss after 5 seconds
      });
    } catch (error) {
      toast({
        title: "Geocoding error",
        description: "Could not get address for coordinates",
        variant: "destructive",
        duration: 5000, // Auto-dismiss after 5 seconds
      });
    } finally {
      setLocationLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when searching
    fetchIssues();
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handleClearLocation = () => {
    setUserLocation(null);
    setLocationAddress('');
    setMapCenter(null);
    toast({
      title: "Location cleared",
      description: "Your location has been cleared. Map will show default view.",
      duration: 3000,
    });
  };

  // Map View Component
  const MapView = ({ issues, userLocation }: { issues: Issue[], userLocation: { lat: number; lng: number } | null }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<L.Map | null>(null);
    const [userMarker, setUserMarker] = useState<L.Marker | null>(null);
    const [issueMarkers, setIssueMarkers] = useState<L.Marker[]>([]);

    // Initialize map only once
    useEffect(() => {
      if (mapRef.current && !map) {
        const newMap = L.map(mapRef.current, {
          center: userLocation || mapCenter || { lat: 22.7196, lng: 75.8577 },
          zoom: 13,
          zoomControl: true,
          attributionControl: false,
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(newMap);
        setMap(newMap);
      }
      return () => {
        if (map) {
          map.remove();
        }
      };
    }, [mapRef, map]); // Removed userLocation and mapCenter dependencies

    // Update map center when user location changes (only when map exists)
    useEffect(() => {
      if (map && userLocation) {
        map.setView(userLocation, 15);
      }
    }, [map, userLocation]);

    // Handle user marker updates
    useEffect(() => {
      if (map) {
        // Remove existing user marker
        if (userMarker) {
          map.removeLayer(userMarker);
        }
        
        if (userLocation) {
          const marker = L.marker(userLocation, {
            icon: L.icon({
              iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
              shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              shadowSize: [41, 41],
            }),
          });
          
          // Create detailed user location popup
          const userPopupContent = `
            <div style="min-width: 250px; font-family: Arial, sans-serif;">
              <div style="background: #e3f2fd; padding: 12px; border-radius: 8px 8px 0 0; border-bottom: 1px solid #bbdefb;">
                <h3 style="margin: 0 0 8px 0; color: #1565c0; font-size: 16px; font-weight: 600;">📍 Your Location</h3>
                <p style="margin: 0; color: #1976d2; font-size: 14px; line-height: 1.4;">${locationAddress || 'Address not available'}</p>
              </div>
              
              <div style="padding: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: #495057; font-weight: 500;">Latitude:</span>
                  <span style="color: #212529; font-size: 14px;">${userLocation.lat.toFixed(6)}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: #495057; font-weight: 500;">Longitude:</span>
                  <span style="color: #212529; font-size: 14px;">${userLocation.lng.toFixed(6)}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #495057; font-weight: 500;">Nearby Issues:</span>
                  <span style="color: #212529; font-size: 14px;">${issues.length} found</span>
                </div>
              </div>
              
              <div style="background: #e3f2fd; padding: 8px 12px; border-radius: 0 0 8px 8px; border-top: 1px solid #bbdefb;">
                <button style="background: #1976d2; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; width: 100%;">Location Details</button>
              </div>
            </div>
          `;
          
          marker.addTo(map).bindPopup(userPopupContent, {
            maxWidth: 300,
            className: 'user-location-popup'
          });
          setUserMarker(marker);
        }
      }
    }, [map, userLocation, locationAddress, issues.length]);

    // Handle issue markers updates
    useEffect(() => {
      if (map) {
        // Remove existing issue markers
        issueMarkers.forEach(marker => {
          map.removeLayer(marker);
        });
        
        const newMarkers: L.Marker[] = [];
        
        if (issues.length > 0) {
          issues.forEach((issue, index) => {
            // Create marker for all issues, even if no coordinates (use default location)
            const coordinates = issue.coordinates || { lat: 22.7196, lng: 75.8577 }; // Default to Indore if no coordinates
            
            // Create different colored markers based on category
            const getMarkerColor = (category: string | any) => {
              const categoryName = typeof category === 'string' ? category.toLowerCase() : (category as any)?.name?.toLowerCase() || 'default';
              switch (categoryName) {
                case 'garbage collection':
                  return '#28a745'; // Green
                case 'road':
                  return '#ffc107'; // Yellow
                case 'streetlight':
                  return '#17a2b8'; // Blue
                case 'water supply':
                  return '#007bff'; // Blue
                case 'public safety':
                  return '#dc3545'; // Red
                case 'obstructions':
                  return '#6f42c1'; // Purple
                case 'traffic signal':
                  return '#fd7e14'; // Orange
                case 'drainage':
                  return '#20c997'; // Teal
                default:
                  return '#6c757d'; // Gray
              }
            };
            
            const markerColor = getMarkerColor(issue.category);
            
            // Create custom colored marker
            const customIcon = L.divIcon({
              html: `<div style="background-color: ${markerColor}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px;">${index + 1}</div>`,
              className: 'custom-marker',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            });
            
            const marker = L.marker(coordinates, { icon: customIcon });
            
            // Create detailed popup for each issue
            const popupContent = `
              <div style="min-width: 250px; font-family: Arial, sans-serif;">
                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px 8px 0 0; border-bottom: 1px solid #dee2e6;">
                  <h3 style="margin: 0 0 8px 0; color: #495057; font-size: 16px; font-weight: 600;">${issue.title}</h3>
                  <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.4;">${issue.description}</p>
                </div>
                
                <div style="padding: 12px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="color: #495057; font-weight: 500;">Category:</span>
                    <span style="color: #212529; font-size: 14px;">${issue.category}</span>
                  </div>
                  
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="color: #495057; font-weight: 500;">Status:</span>
                    <span style="color: #212529; font-size: 14px;">${issue.status}</span>
                  </div>
                  
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="color: #495057; font-weight: 500;">Location:</span>
                    <span style="color: #212529; font-size: 14px;">${issue.location}</span>
                  </div>
                  
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: #495057; font-weight: 500;">Distance:</span>
                    <span style="color: #212529; font-size: 14px;">${issue.distance}</span>
                  </div>
                </div>
                
                <div style="background: #f8f9fa; padding: 8px 12px; border-radius: 0 0 8px 8px; border-top: 1px solid #dee2e6;">
                  <a href="/issue/${issue.id}" style="background: #007bff; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; width: 100%; display: block; text-align: center; text-decoration: none;">
                    View Full Details
                  </a>
                </div>
              </div>
            `;
            
            marker.addTo(map).bindPopup(popupContent, {
              maxWidth: 300,
              className: 'custom-popup'
            });
            
            newMarkers.push(marker);
          });
        }
        
        setIssueMarkers(newMarkers);
      }
    }, [map, issues]); // Only depend on map and issues, not issueMarkers

    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden h-full">
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-white rounded-lg shadow-lg p-2">
            <button
              onClick={() => map?.zoomIn()}
              className="block w-8 h-8 bg-white border border-gray-300 rounded-t-md hover:bg-gray-50 flex items-center justify-center"
              title="Zoom In"
            >
              <span className="text-lg font-bold">+</span>
            </button>
            <button
              onClick={() => map?.zoomOut()}
              className="block w-8 h-8 bg-white border border-gray-300 rounded-b-md hover:bg-gray-50 flex items-center justify-center"
              title="Zoom Out"
            >
              <span className="text-lg font-bold">−</span>
            </button>
          </div>
        </div>
        
        {/* Fullscreen Button */}
        <div className="absolute bottom-4 right-4 z-10">
          <button
            onClick={() => {
              if (map) {
                const mapContainer = map.getContainer();
                if (document.fullscreenElement) {
                  document.exitFullscreen();
                } else {
                  mapContainer.requestFullscreen();
                }
              }
            }}
            className="bg-white rounded-lg shadow-lg p-2 hover:bg-gray-50"
            title="Toggle Fullscreen"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        isLoggedIn={!!user} 
        userName={user?.username}
        isAdmin={isAdmin}
      />
      
      <div className="container mx-auto px-4 py-6">
        {/* Title and Info */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Home Page</h1>
          <p className="text-muted-foreground">
            User can also able to see nearby issues without Login
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="reported">Reported</SelectItem>
                <SelectItem value="progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            {/* Distance Filter */}
            <Select value={distanceFilter} onValueChange={setDistanceFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Distance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Distances</SelectItem>
                <SelectItem value="1km">Within 1 km</SelectItem>
                <SelectItem value="3km">Within 3 km</SelectItem>
                <SelectItem value="5km">Within 5 km</SelectItem>
              </SelectContent>
            </Select>

            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Search Button */}
            <Button 
              onClick={handleSearch}
              className="w-full md:w-auto"
            >
              <Search className="w-4 h-4 mr-2" />
              Search Issues
            </Button>
          </div>

          {/* View Mode Toggle and Location */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">View:</span>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4 mr-1" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('map')}
              >
                <Map className="w-4 h-4 mr-1" />
                Map
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGetLocation}
                disabled={locationLoading}
              >
                {locationLoading ? (
                  <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <MapPin className="w-4 h-4 mr-1" />
                )}
                {locationLoading ? 'Getting Location...' : 'Get My Location'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLocationInput(!showLocationInput)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Manual Location
              </Button>
            </div>
          </div>

          {/* Manual Location Input */}
          {showLocationInput && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Enter Manual Location</h3>
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g., 23.0225"
                    value={manualLatitude}
                    onChange={(e) => setManualLatitude(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g., 72.5714"
                    value={manualLongitude}
                    onChange={(e) => setManualLongitude(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleManualLocationSubmit}
                    size="sm"
                    className="w-full md:w-auto"
                    disabled={locationLoading}
                  >
                    {locationLoading ? (
                      <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      'Set Location'
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Example: Ahmedabad coordinates are approximately 23.0225, 72.5714
              </p>
            </div>
          )}

          {/* Location Status */}
          {userLocation && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
              <MapPin className="w-4 h-4" />
              <div className="flex-1">
                <div className="font-medium">Location set:</div>
                <div className="text-xs text-green-700 mt-1">
                  {locationAddress || `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearLocation}
                className="text-red-600 hover:text-red-700"
              >
                Clear
              </Button>
            </div>
          )}
        </div>

        {/* Issues Display */}
        {loading ? (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-t-lg"></div>
                <div className="bg-white p-4 rounded-b-lg border border-gray-200">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : issues.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {issues.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    onClick={() => handleIssueClick(issue)}
                  />
                ))}
              </div>
            ) : (
                              <div className="relative" style={{ height: '600px' }}>
                  {/* Map Legend - Always Visible */}
                  <div className="absolute top-36 left-4 bg-white p-4 rounded-lg shadow-lg border z-50 max-w-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-900">Issue Categories</h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-green-500 mr-3 border-2 border-white shadow-sm"></div>
                      <span className="text-gray-700">Garbage Collection</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-yellow-500 mr-3 border-2 border-white shadow-sm"></div>
                      <span className="text-gray-700">Road Issues</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-blue-500 mr-3 border-2 border-white shadow-sm"></div>
                      <span className="text-gray-700">Streetlight</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-red-500 mr-3 border-2 border-white shadow-sm"></div>
                      <span className="text-gray-700">Public Safety</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-purple-500 mr-3 border-2 border-white shadow-sm"></div>
                      <span className="text-gray-700">Obstructions</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-orange-500 mr-3 border-2 border-white shadow-sm"></div>
                      <span className="text-gray-700">Traffic Signal</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-teal-500 mr-3 border-2 border-white shadow-sm"></div>
                      <span className="text-gray-700">Drainage</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-gray-500 mr-3 border-2 border-white shadow-sm"></div>
                      <span className="text-gray-700">Other</span>
                    </div>
                  </div>
                </div>
                
                <MapView issues={issues} userLocation={userLocation} />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No issues found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
            {user && (
              <Button 
                onClick={() => navigate('/report')}
                variant="default"
              >
                Report First Issue
              </Button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex justify-center items-center mt-8 space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex space-x-1">
              {generatePageNumbers().map((page, index) => (
                <Button 
                  key={index}
                  variant={page === currentPage ? "default" : "outline"} 
                  size="sm"
                  className="w-8 h-8"
                  disabled={page === '...'}
                  onClick={() => typeof page === 'number' && handlePageChange(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
