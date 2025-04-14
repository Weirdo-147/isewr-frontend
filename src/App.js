import React, { useState, useEffect, useContext, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Home from './components/Home';
import DeepFakeDetection from './components/DeepFakeDetection';
import Processing from './components/Processing';
import AIImageDetection from './components/AIImageDetection';
import ImageRecognition from './components/ImageRecognition';
import About from './pages/About';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import Careers from './pages/Careers';
import Documentation from './components/Documentation';
import HelpCenter from './pages/HelpCenter';
import Guides from './pages/Guides';
import API from './pages/API';
import CookiePolicy from './pages/CookiePolicy';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Security from './pages/Security';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Profile from './components/Auth/Profile';
import AuthCallback from './components/AuthCallback';
import Dashboard from './components/Dashboard';
import supabase from './supabase';
import './App.css';
import './darkTheme.css';
import ThemeToggle from './components/ThemeToggle';

// Authentication context
const AuthContext = React.createContext();

export const useAuth = () => {
  return React.useContext(AuthContext);
};

// Theme context
const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the current user session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    getSession();

    // Listen for authentication changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUp: (email, password) => supabase.auth.signUp({ email, password }),
    signOut: () => supabase.auth.signOut(),
    resetPassword: (email) => supabase.auth.resetPasswordForEmail(email),
    signInWithGoogle: () => supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: {
        skipBrowserRedirect: false
      }
    }),
    signInWithGithub: () => supabase.auth.signInWithOAuth({ 
      provider: 'github',
      options: {
        skipBrowserRedirect: false
      }
    })
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Navigation component with active link highlighting
const Navigation = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        // Get profile data from Supabase
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
          return;
        }
        
        if (data) {
          setProfileData(data);
        } else {
          // If no profile data, check OAuth provider data
          const { data: userData } = await supabase.auth.getUser();
          
          // Check for avatar from identities (OAuth providers)
          if (userData?.user?.identities) {
            const identities = userData.user.identities;
            let avatar_url = '';
            
            // Try to get picture from Google
            const googleIdentity = identities.find(identity => identity.provider === 'google');
            if (googleIdentity && googleIdentity.identity_data) {
              avatar_url = googleIdentity.identity_data.avatar_url || googleIdentity.identity_data.picture;
            }
            
            // If not found, try GitHub
            if (!avatar_url) {
              const githubIdentity = identities.find(identity => identity.provider === 'github');
              if (githubIdentity && githubIdentity.identity_data) {
                avatar_url = githubIdentity.identity_data.avatar_url;
              }
            }
            
            if (avatar_url) {
              setProfileData({ avatar_url });
            }
          }
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
      }
    };
    
    fetchProfile();
  }, [user]);
  
  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuOpen && !event.target.closest('.profile-menu-container')) {
        setProfileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuOpen]);
  
  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-white">Lens<span className="text-yellow-300">Lynx</span></span>
            </Link>
          </div>
          <div className="flex space-x-1 items-center">
            <Link
              to="/recognition"
              className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive('/recognition') 
                  ? 'bg-white text-blue-700' 
                  : 'text-white hover:text-white hover:bg-blue-500'
              }`}
            >
              Recognition
            </Link>
            <Link
              to="/deepfake"
              className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive('/deepfake') 
                  ? 'bg-white text-blue-700' 
                  : 'text-white hover:text-white hover:bg-blue-500'
              }`}
            >
              Deep Fake
            </Link>
            <Link
              to="/ai-detection"
              className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive('/ai-detection') 
                  ? 'bg-white text-blue-700' 
                  : 'text-white hover:text-white hover:bg-blue-500'
              }`}
            >
              AI Detection
            </Link>
            <Link
              to="/processing"
              className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive('/processing') 
                  ? 'bg-white text-blue-700' 
                  : 'text-white hover:text-white hover:bg-blue-500'
              }`}
            >
              Processing
            </Link>
            
            {/* Theme Toggle */}
            <div className="mx-2">
              <ThemeToggle />
            </div>
            
            {user ? (
              <div className="relative ml-2 profile-menu-container">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden bg-white/20 hover:bg-white/30 transition-colors focus:outline-none"
                  aria-expanded={profileMenuOpen}
                  aria-haspopup="true"
                >
                  <span className="sr-only">Open user menu</span>
                  {profileData?.avatar_url ? (
                    <img 
                      src={profileData.avatar_url} 
                      alt="Profile" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </button>
                
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.email}
                      </p>
                    </div>
                    
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <svg className="mr-3 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Dashboard
                    </Link>
                    
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <svg className="mr-3 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Account
                    </Link>
                    
                    <div className="border-t border-gray-200"></div>
                    
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        signOut();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <svg className="mr-3 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive('/login') || isActive('/signup')
                    ? 'bg-white text-blue-700' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Sign In/Up
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Footer component with authentication-aware content
const FooterContent = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  
  return (
    <footer className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-800'} text-white`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-400'} tracking-wider uppercase`}>Product</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/recognition" className="text-base text-gray-500 hover:text-gray-300">
                  Recognition
                </Link>
              </li>
              <li>
                <Link to="/deepfake" className="text-base text-gray-500 hover:text-gray-300">
                  Deep Fake
                </Link>
              </li>
              <li>
                <Link to="/ai-detection" className="text-base text-gray-500 hover:text-gray-300">
                  AI Detection
                </Link>
              </li>
              <li>
                <Link to="/processing" className="text-base text-gray-500 hover:text-gray-300">
                  Processing
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-400'} tracking-wider uppercase`}>Company</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/about" className="text-base text-gray-500 hover:text-gray-300">
                  About
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-base text-gray-500 hover:text-gray-300">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-base text-gray-500 hover:text-gray-300">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-400'} tracking-wider uppercase`}>Resources</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/documentation" className="text-base text-gray-500 hover:text-gray-300">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-base text-gray-500 hover:text-gray-300">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/guides" className="text-base text-gray-500 hover:text-gray-300">
                  Guides
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-400'} tracking-wider uppercase`}>Legal</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/privacy" className="text-base text-gray-500 hover:text-gray-300">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-base text-gray-500 hover:text-gray-300">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-base text-gray-500 hover:text-gray-300">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/security" className="text-base text-gray-500 hover:text-gray-300">
                  Security
                </Link>
              </li>
              <li>
                {!user ? (
                  <Link to="/login" className="text-base text-gray-500 hover:text-gray-300">
                    Sign Up/In
                  </Link>
                ) : (
                  <Link to="/profile" className="text-base text-gray-500 hover:text-gray-300">
                    Profile
                  </Link>
                )}
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} LensLynx. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="/privacy" className="text-gray-400 hover:text-white text-sm">Privacy Policy</a>
            <a href="/terms" className="text-gray-400 hover:text-white text-sm">Terms of Service</a>
            <a href="/cookies" className="text-gray-400 hover:text-white text-sm">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

function App() {
  const [theme, setTheme] = useState(() => {
    // Check local storage for saved theme
    const savedTheme = localStorage.getItem('theme');
    // Check system preference if no saved theme
    if (!savedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return savedTheme || 'light';
  });

  // Apply theme to document when it changes
  useEffect(() => {
    document.documentElement.classList.remove('light-theme', 'dark-theme');
    document.documentElement.classList.add(`${theme}-theme`);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <Router>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <div className={`app ${theme === 'dark' ? 'dark' : 'light'}`}>
          <AuthProvider>
            <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>
              <Navigation />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  {/* Auth routes */}
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  
                  {/* Protected routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/recognition" element={
                    <ProtectedRoute>
                      <ImageRecognition />
                    </ProtectedRoute>
                  } />
                  <Route path="/deepfake" element={
                    <ProtectedRoute>
                      <DeepFakeDetection />
                    </ProtectedRoute>
                  } />
                  <Route path="/ai-detection" element={
                    <ProtectedRoute>
                      <AIImageDetection />
                    </ProtectedRoute>
                  } />
                  <Route path="/processing" element={
                    <ProtectedRoute>
                      <Processing />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  
                  {/* Public routes */}
                  <Route path="/about" element={<About />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/careers" element={<Careers />} />
                  <Route path="/documentation" element={<Documentation />} />
                  <Route path="/help" element={<HelpCenter />} />
                  <Route path="/guides" element={<Guides />} />
                  <Route path="/api" element={<API />} />
                  <Route path="/cookies" element={<CookiePolicy />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/security" element={<Security />} />
                </Routes>
              </main>
              <FooterContent />
            </div>
          </AuthProvider>
        </div>
      </ThemeContext.Provider>
    </Router>
  );
}

export default App;
