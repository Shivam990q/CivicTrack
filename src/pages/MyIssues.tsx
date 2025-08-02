import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { Header } from "@/components/Header";
import { IssueCard, Issue } from "@/components/IssueCard";
import potholeImage from "@/assets/pothole-sample.jpg";
import streetlightImage from "@/assets/streetlight-sample.jpg";

// Mock user issues - would come from API in real app
const mockUserIssues: Issue[] = [
  {
    id: '1',
    title: 'Streetlight not working',
    description: 'Street light not working since last 2 days',
    category: 'Lighting',
    status: 'progress',
    location: 'C.G road, Ahmedabad',
    reportedBy: 'You',
    reportedAt: 'Jan 02, 2025',
    image: streetlightImage,
  },
  {
    id: '2',
    title: 'Pothole on main road',
    description: 'The main road in c.g road ahmedabad, is riddled with potholes',
    category: 'Roads',
    status: 'reported',
    location: 'C.G road, Ahmedabad, Gujarat',
    reportedBy: 'You',
    reportedAt: 'Jan 01, 2025',
    image: potholeImage,
  }
];

export default function MyIssues() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('civictrack_user');
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      setIsAdmin(userObj.isAdmin || false);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const getFilteredIssues = () => {
    switch (activeTab) {
      case 'reported':
        return mockUserIssues.filter(issue => issue.status === 'reported');
      case 'progress':
        return mockUserIssues.filter(issue => issue.status === 'progress');
      case 'resolved':
        return mockUserIssues.filter(issue => issue.status === 'resolved');
      default:
        return mockUserIssues;
    }
  };

  const handleIssueClick = (issue: Issue) => {
    navigate(`/issue/${issue.id}`, { state: { issue } });
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
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Issues</h1>
            <p className="text-muted-foreground">Track and manage your reported issues</p>
          </div>
          <Button 
            onClick={() => navigate('/report')} 
            className="flex items-center gap-2"
            variant="civic"
          >
            <Plus className="w-4 h-4" />
            Report New Issue
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Issues</TabsTrigger>
            <TabsTrigger value="reported">Reported</TabsTrigger>
            <TabsTrigger value="progress">In Progress</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {getFilteredIssues().length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredIssues().map((issue) => (
                  <IssueCard 
                    key={issue.id} 
                    issue={issue} 
                    onClick={() => handleIssueClick(issue)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No issues found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {activeTab === 'all' 
                    ? "You haven't reported any issues yet" 
                    : `No ${activeTab} issues found`
                  }
                </p>
                <Button 
                  onClick={() => navigate('/report')}
                  variant="civic"
                >
                  Report Your First Issue
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}