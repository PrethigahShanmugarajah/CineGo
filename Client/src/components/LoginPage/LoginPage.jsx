// CineGo / Client / src / components / LoginPage / LoginPage.jsx
import { useState } from "react";
import { toast } from "react-toastify";
import { ArrowLeft, Eye, EyeOff, Film, Mail, Popcorn } from "lucide-react";
import "./LoginPage.css";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (!formData.password || formData.password.length < 6) {
      setIsLoading(false);
      toast.error("Password must be atleast of 6 characters long", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      console.warn("Login Blocked");
      console.log(formData);
      return;
    }

    console.log("Login Data:", formData);

    setTimeout(() => {
      setIsLoading(false);
      try {
        const authObj = { isLoggedIn: true, email: formData.email };
        localStorage.setItem("cine_auth", JSON.stringify(authObj));
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", formData.email || "");
        localStorage.setItem("cine_user_email", formData.email || "");
        console.log("Auth saved to localStorage:", authObj);
      } catch (error) {
        console.log("Failed to Login:", error);
        toast.error(error);
      }
      toast.success("Login Successfully!");
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    }, 1500);
  };

  const goBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-950 to-black p-4 relative overflow-hidden">
      <div className="relative w-full max-w-md z-10">
        <div className="mb-4 sm:mb-6 xl:mb-2 md:mb-0">
          <button
            onClick={goBack}
            className="inline-flex xl:-ml-100 md:-ml-30 items-center text-purple-400 hover:text-purple-300 transition-all duration-300 group focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
          >
            <ArrowLeft
              size={20}
              className="mr-2 transform group-hover:-translate-x-1 transition-transform"
            />
            <span className="font-medium text-sm sm:text-base">Back</span>
          </button>
        </div>

        <div className="relative md:mt-10 bg-gray-900/90 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-gray-500 animate-border">
          <div className="px-6 sm:px-8 py-8 sm:py-10">
            <div className="text-center mb-6 sm:mb-8">
              <div className="flex justify-center items-center mb-3 sm:mb-4">
                <Film className="text-purple-500 mr-2" size={28} />

                <h2 className="text-3xl sm:text-4xl font-bold text-white font-cinema leading-tight">
                  CINEGO - LOGIN
                </h2>
              </div>

              <p className="text-purple-200 mt-1 sm:mt-2 font-medium text-sm sm:text-base">
                Sign in to unlock the full CineGo experience and access your
                favorite movies.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4 sm:mb-6">
                <label
                  htmlFor="email"
                  className="block text-purple-100 text-sm font-bold mb-2 font-cinema"
                >
                  Email Address
                </label>

                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/60 text-white rounded-lg focus:outline-none transition-all duration-200 border border-gray-300 placeholder-gray-500"
                    placeholder="Email Address..."
                  />
                  <div className="absolute right-3 top-2.5 sm:top-3">
                    <Mail size={16} className="text-purple-500" />
                  </div>
                </div>
              </div>

              <div className="mb-4 sm:mb-6">
                <label
                  htmlFor="password"
                  className="block text-purple-100 text-sm font-bold mb-2 font-cinema"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/60 text-white rounded-lg focus:outline-none transition-all duration-200 border border-gray-300 placeholder-gray-500"
                    placeholder="Password..."
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 px-2 sm:px-3 flex items-center focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={18} className="text-purple-500" />
                    ) : (
                      <Eye size={18} className="text-purple-500" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-linear-to-r from-purple-700 to-purple-800 text-white font-bold py-2.5 sm:py-3 px-4 rounded-full hover:opacity-90 transition-all cursor-pointer duration-300 transform focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 shadow-lg shadow-purple-900/30 ${
                  isLoading ? "opacity-80 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <span className="font-cinema text-sm sm:text-base">
                      Signing in...
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Popcorn size={18} className="mr-2" />
                    <span className="font-cinema text-sm sm:text-base">
                      Access Your Account
                    </span>
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="text-center mt-6 sm:mt-8">
          <p className="text-gray-500 text-sm sm:text-base">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-purple-400 hover:text-purple-300 font-medium transition duration-200 underline hover:no-underline"
            >
              Create one now
            </a>{" "}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
