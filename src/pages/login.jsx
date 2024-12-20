import React from "react";
import { usePepContext } from '../utilities/context';
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const { user, login } = usePepContext();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await login();
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      // Optionally add error handling UI here
    }
  };

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-white to-blue-100">
      <div className="relative min-h-screen flex flex-col justify-center items-center p-4">
        <div className="max-w-lg w-full py-12 backdrop-blur-sm bg-white/70 rounded-2xl p-8 shadow-sm">
          <div className="flex flex-col text-center gap-2 mb-12">
            <h2 className="text-4xl font-extrabold text-gray-700">
              Welcome to{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">
                PepTalk!
              </span>
            </h2>

            <h3 className="text-l text-gray-500">
              Please login to access your Journal
            </h3>
          </div>

          <div className="space-y-6">
            <button
              onClick={handleLogin}
              className="flex justify-center w-full items-center gap-2 px-4 py-2 sm:py-3 bg-white hover:bg-gray-50 text-gray-600 font-medium rounded-xl shadow-sm border border-gray-200 transition-all hover:shadow-md"
            >
              <GoogleLoginIcon />
              <span className="font-medium">Sign in with Google</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Extracted Google login icon as a separate component for cleaner code
const GoogleLoginIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export default LoginPage;