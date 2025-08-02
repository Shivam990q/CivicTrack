import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Shield, User, Building2, Loader2, Eye, EyeOff, ArrowRight, Sparkles, CheckCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { authAPI } from "@/lib/api";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loginType, setLoginType] = useState<'user' | 'admin'>('user');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [validation, setValidation] = useState({
    username: { valid: false, message: '' },
    password: { valid: false, message: '' }
  });

  // Animated entrance effect
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Real-time validation
  useEffect(() => {
    validateUsername(formData.username);
  }, [formData.username]);

  useEffect(() => {
    validatePassword(formData.password);
  }, [formData.password]);

  const validateUsername = (username: string) => {
    if (!username) {
      setValidation(prev => ({ ...prev, username: { valid: false, message: '' } }));
    } else if (username.length < 2) {
      setValidation(prev => ({ ...prev, username: { valid: false, message: 'Username must be at least 2 characters' } }));
    } else {
      setValidation(prev => ({ ...prev, username: { valid: true, message: 'Username looks good!' } }));
    }
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setValidation(prev => ({ ...prev, password: { valid: false, message: '' } }));
    } else if (password.length < 3) {
      setValidation(prev => ({ ...prev, password: { valid: false, message: 'Password must be at least 3 characters' } }));
    } else {
      setValidation(prev => ({ ...prev, password: { valid: true, message: 'Password looks good!' } }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please enter both username and password",
        variant: "destructive"
      });
      return;
    }

    if (!validation.username.valid || !validation.password.valid) {
      toast({
        title: "Validation Error",
        description: "Please fix the validation errors before submitting",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await authAPI.login({
        username: formData.username,
        password: formData.password,
      });

      // Store user data with token
      localStorage.setItem('civictrack_user', JSON.stringify({
        ...response.user,
        token: response.token,
        isLoggedIn: true,
        isAdmin: response.user.is_staff || loginType === 'admin',
        role: response.user.is_staff ? 'admin' : 'user'
      }));

      toast({
        title: "Login Successful",
        description: `Welcome back, ${response.user.username}!`,
      });
      
      // Navigate based on user role
      if (response.user.is_staff || loginType === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleQuickLogin = (type: 'user' | 'admin') => {
    const credentials = type === 'admin' 
      ? { username: 'admin', password: 'admin123' }
      : { username: 'user', password: 'user123' };
    
    setFormData(credentials);
    setLoginType(type);
  };

  const isFormValid = validation.username.valid && validation.password.valid;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className={`shadow-2xl border-0 bg-white/80 backdrop-blur-sm transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <CardHeader className="text-center pb-6">
              <div className="relative">
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
                  <Shield className="w-8 h-8 text-blue-600" />
                  CivicTrack Login
                </CardTitle>
              </div>
              <p className="text-muted-foreground mt-2">Choose your login type</p>
            </CardHeader>
            <CardContent>
              <Tabs value={loginType} onValueChange={(value) => setLoginType(value as 'user' | 'admin')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
                  <TabsTrigger 
                    value="user" 
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300"
                  >
                    <User className="w-4 h-4" />
                    User
                  </TabsTrigger>
                  <TabsTrigger 
                    value="admin" 
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300"
                  >
                    <Building2 className="w-4 h-4" />
                    Admin
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="user" className="space-y-6 mt-6">
                  <div className="text-center mb-6">
                    <div className="relative">
                      <Users className="w-16 h-16 text-blue-600 mx-auto mb-3" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full"></div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">User Login</h3>
                    <p className="text-sm text-muted-foreground">Report issues and track community problems</p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-sm font-medium flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Username
                      </Label>
                      <div className="relative">
                        <Input
                          id="username"
                          name="username"
                          type="text"
                          value={formData.username}
                          onChange={handleInputChange}
                          placeholder="Enter your username"
                          className={`transition-all duration-300 ${
                            validation.username.valid 
                              ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                              : validation.username.message 
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                          }`}
                          required
                        />
                        {validation.username.valid && (
                          <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                        )}
                      </div>
                      {validation.username.message && (
                        <p className={`text-xs ${validation.username.valid ? 'text-green-600' : 'text-red-600'} animate-in slide-in-from-top-1`}>
                          {validation.username.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Enter your password"
                          className={`transition-all duration-300 ${
                            validation.password.valid 
                              ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                              : validation.password.message 
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                          }`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                        {validation.password.valid && (
                          <CheckCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                        )}
                      </div>
                      {validation.password.message && (
                        <p className={`text-xs ${validation.password.valid ? 'text-green-600' : 'text-red-600'} animate-in slide-in-from-top-1`}>
                          {validation.password.message}
                        </p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
                      disabled={loading || !isFormValid}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Logging in...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          Login as User
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      )}
                    </Button>
                  </form>

                  <div className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickLogin('user')}
                      className="w-full border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                    >
                      Quick Login (user/user123)
                    </Button>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Don't have an account?{' '}
                      <Button
                        variant="link"
                        className="p-0 h-auto text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                        onClick={() => navigate('/register')}
                      >
                        Register here
                      </Button>
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="admin" className="space-y-6 mt-6">
                  <div className="text-center mb-6">
                    <div className="relative">
                      <Building2 className="w-16 h-16 text-orange-500 mx-auto mb-3" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"></div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Admin Login</h3>
                    <p className="text-sm text-muted-foreground">Manage issues, users, and community analytics</p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="admin-username" className="text-sm font-medium flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Admin Username
                      </Label>
                      <div className="relative">
                        <Input
                          id="admin-username"
                          name="username"
                          type="text"
                          value={formData.username}
                          onChange={handleInputChange}
                          placeholder="Enter admin username"
                          className={`transition-all duration-300 ${
                            validation.username.valid 
                              ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                              : validation.username.message 
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'
                          }`}
                          required
                        />
                        {validation.username.valid && (
                          <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                        )}
                      </div>
                      {validation.username.message && (
                        <p className={`text-xs ${validation.username.valid ? 'text-green-600' : 'text-red-600'} animate-in slide-in-from-top-1`}>
                          {validation.username.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="admin-password" className="text-sm font-medium flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Admin Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="admin-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Enter admin password"
                          className={`transition-all duration-300 ${
                            validation.password.valid 
                              ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                              : validation.password.message 
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'
                          }`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                        {validation.password.valid && (
                          <CheckCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                        )}
                      </div>
                      {validation.password.message && (
                        <p className={`text-xs ${validation.password.valid ? 'text-green-600' : 'text-red-600'} animate-in slide-in-from-top-1`}>
                          {validation.password.message}
                        </p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
                      disabled={loading || !isFormValid}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Logging in...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          Login as Admin
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      )}
                    </Button>
                  </form>

                  <div className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickLogin('admin')}
                      className="w-full border-2 border-dashed border-orange-300 hover:border-orange-500 hover:bg-orange-50 transition-all duration-300"
                    >
                      Quick Login (admin/admin123)
                    </Button>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-xs text-orange-700 font-medium">
                      <strong>🔐 Admin Access:</strong> Full control over issues, users, and system analytics
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}