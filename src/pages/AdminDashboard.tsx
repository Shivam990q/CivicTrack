import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Users, 
  Flag, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Search,
  Filter,
  Ban,
  Eye,
  EyeOff
} from "lucide-react";
import { Header } from "@/components/Header";
import { Issue } from "@/components/IssueCard";

const mockIssues: Issue[] = [
  {
    id: '1',
    title: 'Streetlight not working',
    description: 'Street light not working since last 2 days',
    category: 'Lighting',
    status: 'progress',
    location: 'C.G road, Ahmedabad',
    reportedBy: 'user123',
    reportedAt: '2.8 km',
    image: '/missing manhole cover.jpg',
    distance: '2.8 km',
    flags: 0
  },
  {
    id: '2',
    title: 'Pothole on main road',
    description: 'The main road in c.g road ahmedabad, is riddled with potholes',
    category: 'Roads',
    status: 'reported',
    location: 'C.G road, Ahmedabad, Gujarat',
    reportedBy: 'user456',
    reportedAt: '1.1 km',
    image: '/Pothole on main road.jpg',
    distance: '1.1 km',
    flags: 3
  },
  {
    id: '3',
    title: 'Garbage not collected',
    description: 'Garbage is not collected since weeks',
    category: 'Cleanliness',
    status: 'resolved',
    location: 'IT society, Ahmedabad, Gujarat',
    reportedBy: 'user789',
    reportedAt: '1.1 km',
    image: '/hole.jpeg',
    distance: '1.1 km',
    flags: 0
  },
  {
    id: '4',
    title: 'Illegal parking',
    description: 'Vehicles parked illegally blocking the main road',
    category: 'Traffic',
    status: 'reported',
    location: 'Navrangpura, Ahmedabad, Gujarat',
    reportedBy: 'user101',
    reportedAt: '1.8 km',
    image: '/illegal parking.jpeg',
    distance: '1.8 km',
    flags: 2
  },
  {
    id: '5',
    title: 'Broken street furniture',
    description: 'Street furniture like benches and bins are broken',
    category: 'Obstructions',
    status: 'progress',
    location: 'Law Garden, Ahmedabad, Gujarat',
    reportedBy: 'user202',
    reportedAt: '2.1 km',
    image: '/broken street furniture.jpeg',
    distance: '2.1 km',
    flags: 1
  },
  {
    id: '6',
    title: 'Street vendor obstruction',
    description: 'Street vendors blocking pedestrian walkways',
    category: 'Obstructions',
    status: 'reported',
    location: 'Manek Chowk, Ahmedabad, Gujarat',
    reportedBy: 'user303',
    reportedAt: '3.5 km',
    image: '/Street vendor obstruction.jpeg',
    distance: '3.5 km',
    flags: 4
  },
  {
    id: '7',
    title: 'Water supply issue',
    description: 'Water supply disrupted in the area',
    category: 'Water Supply',
    status: 'reported',
    location: 'Bodakdev, Ahmedabad, Gujarat',
    reportedBy: 'user404',
    reportedAt: '4.2 km',
    image: '/flood.jpeg',
    distance: '4.2 km',
    flags: 0
  },
  {
    id: '8',
    title: 'Road marking faded',
    description: 'Road markings have completely faded',
    category: 'Roads',
    status: 'progress',
    location: 'Satellite area, Ahmedabad, Gujarat',
    reportedBy: 'user505',
    reportedAt: '3.2 km',
    image: '/Road marking faded.webp',
    distance: '3.2 km',
    flags: 1
  },
  {
    id: '9',
    title: 'Parking violation',
    description: 'Vehicles parked in no-parking zone',
    category: 'Parking',
    status: 'reported',
    location: 'Satellite area, Ahmedabad, Gujarat',
    reportedBy: 'user606',
    reportedAt: '2.3 km',
    image: '/parking.jpeg',
    distance: '2.3 km',
    flags: 2
  },
  {
    id: '10',
    title: 'Traffic rules violation',
    description: 'Drivers not following traffic rules',
    category: 'Traffic Rules',
    status: 'reported',
    location: 'Navrangpura, Ahmedabad, Gujarat',
    reportedBy: 'user707',
    reportedAt: '1.7 km',
    image: '/rules break.jpeg',
    distance: '1.7 km',
    flags: 3
  },
  {
    id: '11',
    title: 'High traffic congestion',
    description: 'Severe traffic congestion during peak hours',
    category: 'Traffic',
    status: 'progress',
    location: 'Ellis Bridge, Ahmedabad, Gujarat',
    reportedBy: 'user808',
    reportedAt: '2.9 km',
    image: '/high traffic.jpeg',
    distance: '2.9 km',
    flags: 1
  },
  {
    id: '12',
    title: 'Missing manhole cover',
    description: 'Manhole cover missing creating dangerous situation',
    category: 'Public Safety',
    status: 'reported',
    location: 'Vastrapur, Ahmedabad, Gujarat',
    reportedBy: 'user909',
    reportedAt: '2.5 km',
    image: '/missing manhole cover.jpg',
    distance: '2.5 km',
    flags: 5
  }
];

const mockUsers = [
  { id: '1', username: 'user123', email: 'user123@example.com', status: 'active', reports: 5, flags: 0 },
  { id: '2', username: 'user456', email: 'user456@example.com', status: 'active', reports: 3, flags: 2 },
  { id: '3', username: 'user789', email: 'user789@example.com', status: 'banned', reports: 12, flags: 8 },
];

const mockAnalytics = {
  totalIssues: 156,
  reported: 45,
  inProgress: 67,
  resolved: 44,
  flaggedIssues: 12,
  totalUsers: 89,
  activeUsers: 76,
  bannedUsers: 13
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [issues, setIssues] = useState<Issue[]>(mockIssues);
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Check if user is logged in and is admin
    const userData = localStorage.getItem('civictrack_user');
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      // In real app, check if user has admin role
      if (!userObj.isAdmin) {
        navigate('/');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleFlagIssue = (issueId: string) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId 
        ? { ...issue, flags: (issue.flags || 0) + 1 }
        : issue
    ));
  };

  const handleHideIssue = (issueId: string) => {
    setIssues(prev => prev.filter(issue => issue.id !== issueId));
  };

  const handleBanUser = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: 'banned' }
        : user
    ));
  };

  const handleUnbanUser = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: 'active' }
        : user
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'bg-status-reported text-status-reported-foreground';
      case 'progress': return 'bg-status-progress text-status-progress-foreground';
      case 'resolved': return 'bg-status-resolved text-status-resolved-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        isLoggedIn={true} 
        userName={user?.username}
        isAdmin={true}
      />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage issues, users, and monitor community activity</p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Issues</p>
                  <p className="text-2xl font-bold">{mockAnalytics.totalIssues}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">{mockAnalytics.activeUsers}</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Flagged Issues</p>
                  <p className="text-2xl font-bold">{mockAnalytics.flaggedIssues}</p>
                </div>
                <Flag className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Banned Users</p>
                  <p className="text-2xl font-bold">{mockAnalytics.bannedUsers}</p>
                </div>
                <Ban className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="issues" className="space-y-6">
          <TabsList>
            <TabsTrigger value="issues">Issues Management</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="issues" className="space-y-6">
            {/* Issues Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search issues..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="reported">Reported</SelectItem>
                  <SelectItem value="progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Issues Table */}
            <Card>
              <CardHeader>
                <CardTitle>Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {issues.map((issue) => (
                    <div key={issue.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{issue.title}</h3>
                          <Badge className={getStatusColor(issue.status)}>
                            {issue.status}
                          </Badge>
                          {issue.flags > 0 && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <Flag className="w-3 h-3" />
                              {issue.flags} flags
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{issue.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          By {issue.reportedBy} • {issue.location}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFlagIssue(issue.id)}
                        >
                          <Flag className="w-4 h-4 mr-1" />
                          Flag
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleHideIssue(issue.id)}
                        >
                          <EyeOff className="w-4 h-4 mr-1" />
                          Hide
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{user.username}</h3>
                          <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                            {user.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {user.reports} reports • {user.flags} flags
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {user.status === 'active' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBanUser(user.id)}
                          >
                            <Ban className="w-4 h-4 mr-1" />
                            Ban
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnbanUser(user.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Unban
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Issue Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>Reported</span>
                      </div>
                      <span className="font-semibold">{mockAnalytics.reported}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span>In Progress</span>
                      </div>
                      <span className="font-semibold">{mockAnalytics.inProgress}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Resolved</span>
                      </div>
                      <span className="font-semibold">{mockAnalytics.resolved}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Total Users</span>
                      <span className="font-semibold">{mockAnalytics.totalUsers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Active Users</span>
                      <span className="font-semibold">{mockAnalytics.activeUsers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Banned Users</span>
                      <span className="font-semibold">{mockAnalytics.bannedUsers}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 