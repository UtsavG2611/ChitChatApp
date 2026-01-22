import { LogOut, MessageSquare, Settings, User, Sun, Moon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-toastify";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const { authUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  
  const handleLogout = async () => {
    try {
      // Call server-side signout endpoint
      await axiosInstance.get("/user/sign-out");
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear user data and redirect to login
      navigate('/login');
      window.location.reload();
    }
  };
  return (
    <>
      <header className="w-full z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-16">
          <div className="flex items-center justify-between h-full">
            {/* LEFT LOGO */}
            <div className="flex items-center gap-8">
              <Link to={"/"} className="flex items-center gap-2.5 hover:opacity-80 transition">
                <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400"/>
                </div>
                <h1 className="text-lg font-bold text-gray-800 dark:text-white">ChitChat</h1>
              </Link>
            </div>

            {/* RIGHT SIDE - USER MENU */}
            {authUser && (
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="hidden sm:flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    {authUser.avatar?.url ? (
                      <img 
                        src={authUser.avatar.url} 
                        alt={authUser.fullName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-blue-600 dark:text-blue-400"/>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{authUser.fullName}</span>
                </div>
                
                <div className="flex items-center gap-1 sm:gap-2">
                  {/* Theme Toggle Button */}
                  <button 
                    onClick={toggleTheme}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                  >
                    {isDark ? (
                      <Sun className="w-4 h-4 text-gray-600 dark:text-gray-300"/>
                    ) : (
                      <Moon className="w-4 h-4 text-gray-600 dark:text-gray-300"/>
                    )}
                  </button>
                  
                  <Link 
                    to="/profile" 
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Profile"
                  >
                    <Settings className="w-4 h-4 text-gray-600 dark:text-gray-300"/>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4 text-gray-600 dark:text-gray-300"/>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
