import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, User, Circle, Square } from "lucide-react";

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string | { id: number; name: string; description?: string; icon?: string; color?: string; is_active?: boolean };
  status: 'reported' | 'progress' | 'resolved';
  location: string;
  reportedBy: string;
  reportedAt: string;
  image?: string;
  distance?: string;
  coordinates?: { lat: number; lng: number };
  photos?: string[];
}

interface IssueCardProps {
  issue: Issue;
  onClick?: () => void;
}

const statusLabels = {
  reported: 'Reported',
  progress: 'In Progress',
  resolved: 'Resolved'
};

const statusIcons = {
  reported: <Square className="w-3 h-3 text-red-500" />,
  progress: <Circle className="w-3 h-3 text-yellow-500" />,
  resolved: <Circle className="w-3 h-3 text-green-500" />
};

const categoryColors = {
  road: 'bg-orange-100 text-orange-800',
  streetlight: 'bg-yellow-100 text-yellow-800',
  garbagecollection: 'bg-green-100 text-green-800',
  watersupply: 'bg-blue-100 text-blue-800',
  publicsafety: 'bg-red-100 text-red-800',
  obstructions: 'bg-purple-100 text-purple-800',
  trafficsignal: 'bg-indigo-100 text-indigo-800',
  drainage: 'bg-gray-100 text-gray-800',
};

export function IssueCard({ issue, onClick }: IssueCardProps) {
  const getCategoryColor = (category: string | { id: number; name: string; description?: string; icon?: string; color?: string; is_active?: boolean }) => {
    const categoryName = typeof category === 'string' ? category : category.name;
    const normalizedCategory = categoryName.toLowerCase().replace(/\s+/g, '');
    return categoryColors[normalizedCategory as keyof typeof categoryColors] || 'bg-orange-100 text-orange-800';
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-200 rounded-lg overflow-hidden"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="space-y-0">
          {/* Image */}
          {issue.image && (
            <div className="w-full h-32 overflow-hidden bg-muted relative">
              <img 
                src={issue.image} 
                alt={issue.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Header with status and category */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {statusIcons[issue.status]}
                <span className="text-xs font-medium text-gray-600">
                  {statusLabels[issue.status]}
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  {issue.reportedAt}
                </span>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(issue.category)}`}>
                {typeof issue.category === 'string' ? issue.category : issue.category.name}
              </span>
            </div>

            {/* Title and description */}
            <div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                {issue.title}
              </h3>
              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                {issue.description}
              </p>
            </div>

            {/* Footer info */}
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                <span className="line-clamp-1">{issue.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <User className="w-3 h-3" />
                  <span>{issue.reportedBy}</span>
                </div>
                {issue.distance && (
                  <span className="text-xs font-medium text-gray-700">
                    {issue.distance}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}