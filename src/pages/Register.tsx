import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UserPlus, CheckCircle, Eye, EyeOff, Mail, Phone, User, Lock, ArrowRight, Sparkles } from "lucide-react";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { authAPI } from "@/lib/api";

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [validation, setValidation] = useState({
    username: { valid: false, message: '' },
    email: { valid: false, message: '' },
    phone: { valid: false, message: '' },
    password: { valid: false, message: '' },
    confirmPassword: { valid: false, message: '' }
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
    validateEmail(formData.email);
  }, [formData.email]);

  useEffect(() => {
    validatePhone(formData.phone);
  }, [formData.phone]);

  useEffect(() => {
    validatePassword(formData.password);
  }, [formData.password]);

  useEffect(() => {
    validateConfirmPassword(formData.confirmPassword, formData.password);
  }, [formData.confirmPassword, formData.password]);

  // Show confirm password field when user starts typing password
  useEffect(() => {
    if (formData.password.length > 0) {
      setShowConfirmPassword(true);
    } else {
      setShowConfirmPassword(false);
      // Clear confirm password when password is cleared
      setFormData(prev => ({ ...prev, confirmPassword: '' }));
    }
  }, [formData.password]);

  const validateUsername = (username: string) => {
    if (!username) {
      setValidation(prev => ({ ...prev, username: { valid: false, message: '' } }));
    } else if (username.length < 3) {
      setValidation(prev => ({ ...prev, username: { valid: false, message: 'Username must be at least 3 characters' } }));
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setValidation(prev => ({ ...prev, username: { valid: false, message: 'Username can only contain letters, numbers, and underscores' } }));
    } else {
      setValidation(prev => ({ ...prev, username: { valid: true, message: 'Username looks good!' } }));
    }
  };

  const validateEmail = (email: string) => {
    if (!email) {
      setValidation(prev => ({ ...prev, email: { valid: false, message: '' } }));
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidation(prev => ({ ...prev, email: { valid: false, message: 'Please enter a valid email address' } }));
    } else {
      setValidation(prev => ({ ...prev, email: { valid: true, message: 'Email format is valid!' } }));
    }
  };

  const validatePhone = (phone: string) => {
    if (!phone) {
      setValidation(prev => ({ ...prev, phone: { valid: false, message: '' } }));
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/\s/g, ''))) {
      setValidation(prev => ({ ...prev, phone: { valid: false, message: 'Please enter a valid phone number' } }));
    } else {
      setValidation(prev => ({ ...prev, phone: { valid: true, message: 'Phone number looks good!' } }));
    }
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setValidation(prev => ({ ...prev, password: { valid: false, message: '' } }));
    } else if (password.length < 6) {
      setValidation(prev => ({ ...prev, password: { valid: false, message: 'Password must be at least 6 characters' } }));
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setValidation(prev => ({ ...prev, password: { valid: false, message: 'Password must contain uppercase, lowercase, and number' } }));
    } else {
      setValidation(prev => ({ ...prev, password: { valid: true, message: 'Strong password!' } }));
    }
  };

  const validateConfirmPassword = (confirmPassword: string, password: string) => {
    if (!confirmPassword) {
      setValidation(prev => ({ ...prev, confirmPassword: { valid: false, message: '' } }));
    } else if (confirmPassword !== password) {
      setValidation(prev => ({ ...prev, confirmPassword: { valid: false, message: 'Passwords do not match' } }));
    } else {
      setValidation(prev => ({ ...prev, confirmPassword: { valid: true, message: 'Passwords match!' } }));
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return Math.min(strength, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.email || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!validation.username.valid || !validation.email.valid || !validation.password.valid) {
      toast({
        title: "Validation Error",
        description: "Please fix the validation errors before submitting",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await authAPI.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        phone: formData.phone || undefined,
      });

      // Store user data with token
      localStorage.setItem('civictrack_user', JSON.stringify({
        ...response.user,
        token: response.token,
        isLoggedIn: true,
        isAdmin: response.user.is_staff || false,
        role: response.user.is_staff ? 'admin' : 'user'
      }));

      toast({
        title: "Registration Successful",
        description: `Welcome to CivicTrack, ${response.user.username}!`,
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account. Please try again.",
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

  const isFormValid = validation.username.valid && validation.email.valid && validation.password.valid && validation.confirmPassword.valid;

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
                  <UserPlus className="w-8 h-8 text-blue-600" />
                  User Registration
                </CardTitle>
              </div>
              <p className="text-muted-foreground mt-2">Create your CivicTrack account</p>
              
              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>Step {currentStep} of 4</span>
                  <span>{Math.round((currentStep / 4) * 100)}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(currentStep / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Field */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4" />
                    User Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Choose a username"
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
                
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className={`transition-all duration-300 ${
                        validation.email.valid 
                          ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                          : validation.email.message 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                      }`}
                      required
                    />
                    {validation.email.valid && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                    )}
                  </div>
                  {validation.email.message && (
                    <p className={`text-xs ${validation.email.valid ? 'text-green-600' : 'text-red-600'} animate-in slide-in-from-top-1`}>
                      {validation.email.message}
                    </p>
                  )}
                </div>
                
                {/* Phone Field */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone
                  </Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      className={`transition-all duration-300 ${
                        validation.phone.valid 
                          ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                          : validation.phone.message 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                      }`}
                    />
                    {validation.phone.valid && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                    )}
                  </div>
                  {validation.phone.message && (
                    <p className={`text-xs ${validation.phone.valid ? 'text-green-600' : 'text-red-600'} animate-in slide-in-from-top-1`}>
                      {validation.phone.message}
                    </p>
                  )}
                </div>
                
                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a password"
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
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Password Strength:</span>
                        <span className={getPasswordStrength(formData.password) > 75 ? 'text-green-600' : getPasswordStrength(formData.password) > 50 ? 'text-yellow-600' : 'text-red-600'}>
                          {getPasswordStrength(formData.password)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            getPasswordStrength(formData.password) > 75 
                              ? 'bg-green-500' 
                              : getPasswordStrength(formData.password) > 50 
                                ? 'bg-yellow-500' 
                                : 'bg-red-500'
                          }`}
                          style={{ width: `${getPasswordStrength(formData.password)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {validation.password.message && (
                    <p className={`text-xs ${validation.password.valid ? 'text-green-600' : 'text-red-600'} animate-in slide-in-from-top-1`}>
                      {validation.password.message}
                    </p>
                  )}
                </div>

                  {/* Confirm Password Field - Only shows when password has content */}
                  {showConfirmPassword && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Confirm your password"
                          className={`transition-all duration-300 ${
                            validation.confirmPassword.valid 
                              ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                              : validation.confirmPassword.message 
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
                      </div>
                       
                      {validation.confirmPassword.message && (
                        <p className={`text-xs ${validation.confirmPassword.valid ? 'text-green-600' : 'text-red-600'} animate-in slide-in-from-top-1`}>
                          {validation.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  )}

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
                  disabled={loading || !isFormValid}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Create Account
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Button
                    variant="link"
                    className="p-0 h-auto text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                    onClick={() => navigate('/login')}
                  >
                    Login here
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}