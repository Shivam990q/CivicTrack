import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Settings, LogOut, Home, FileText, Plus, Building2, Shield, AlertCircle } from "lucide-react";

interface HeaderProps {
  onLoginClick?: () => void;
  isLoggedIn?: boolean;
  userName?: string;
  isAdmin?: boolean;
}

export function Header({ onLoginClick, isLoggedIn = false, userName, isAdmin = false }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === '/';

  const handleLogout = () => {
    localStorage.removeItem('civictrack_user');
    window.location.reload();
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="text-xl font-bold text-blue-600 cursor-pointer flex items-center gap-2" 
            onClick={() => isLoggedIn && isAdmin ? navigate('/admin') : navigate('/')}
          >
            <Shield className="w-6 h-6 text-blue-600" />
            CivicTrack
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                {/* Report Issue Button - Prominent for logged-in users */}
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => navigate('/report')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium hidden md:flex"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Report Issue
                </Button>

                {/* My Issues Button */}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/my-issues')}
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 font-medium hidden md:flex"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  My Issues
                </Button>

                {isAdmin && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/admin')}
                    className="hidden lg:flex"
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                )}
                
                {/* User Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={userName} />
                        <AvatarFallback className="text-xs">
                          {userName?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{userName}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {userName ? `${userName}@example.com` : ''}
                        </p>
                        {isAdmin && (
                          <p className="text-xs text-orange-600 font-medium">Administrator</p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    {/* Report Issue for mobile */}
                    <DropdownMenuItem onClick={() => navigate('/report')} className="md:hidden">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      <span>Report Issue</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/my-issues')}>
                      <FileText className="mr-2 h-4 w-4" />
                      <span>My Issues</span>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Building2 className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                {!isHomePage && (
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/')}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Button>
                )}
                <Button 
                  variant="default" 
                  onClick={() => navigate('/login')}
                  className="rounded-lg"
                >
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}