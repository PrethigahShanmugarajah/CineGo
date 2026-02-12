// CineGo / Client / src / components / SignUpPage / SignUpPage.jsx
import { useState } from "react";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Calendar,
  Clapperboard,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  Theater,
  Ticket,
  User,
} from "lucide-react";
import api from "../../api/axios";
import API_ROUTES from "../../api/api_route";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    birthDate: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Fullname is required";
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = "Fullname must be atleast 2 characters";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be atleast 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be atleast 6 characters";
    }

    if (!formData.birthDate) {
      newErrors.birthDate = "Birthdate is required";
    } else {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();

      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      if (age < 16) {
        newErrors.birthDate = "You must be at least 16 years old";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goBack = () => {
    window.history.back();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the form errors.");
      return;
    }

    console.log("Form Data:", {
      ...formData,
      password: "***" + formData.password.slice(-2),
    });
    setIsLoading(true);

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        birthDate: formData.birthDate,
        password: formData.password,
      };

      const response = await api.post(API_ROUTES.USER.USER_REGISTER, payload, {
        headers: { "Content-Type": `application/json` },
      });

      console.log("User Register API Response:", response);

      if (response?.data?.success) {
        toast.success(response?.data?.message);
        console.log("User Register Success:", response?.data?.message);

        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }

        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));

          localStorage.setItem(
            "cinego_auth",
            JSON.stringify({
              isLoggedIn: true,
              email: response.data.user.email,
            }),
          );

          window.dispatchEvent(
            new StorageEvent("storage", {
              key: "cinego_auth",
              newValue: localStorage.getItem("cinego_auth"),
            }),
          );
        }

        navigate("/");
      } else {
        toast.warn(response?.data?.message);
        console.warn("User Register Data Error:", response?.data?.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message);
      console.log("User Register Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-950 via-black to-gray-900 p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-purple-500 rounded-full opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-56 h-56 bg-purple-800 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative mt-10 w-full max-w-2xl z-10">
        <button
          className="absolute -top-10 -left-1 xl:-left-90 lg:-left-40 cursor-pointer flex items-center text-purple-400 hover:text-purple-300 transition-all duration-300 group mb-4"
          onClick={goBack}
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="ml-2 text-sm font-medium font-cinema">Back</span>
        </button>

        <div className="relative bg-gray-900/80 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden border animate-border">
          <div className="relative h-1 bg-linear-to-r from-purple-600 via-purple-500 to-purple-600"></div>
          <div className="px-8 py-8">
            <div className="text-center mb-8">
              <div className="flex justify-center items-center mb-3">
                <Ticket className="text-purple-400 mr-2" size={32} />
                <h2 className="text-3xl font-bold text-white font-cinema">
                  Join Our Cinema
                </h2>
              </div>

              <p className="text-purple-200 text-sm mt-1 font-medium">
                Create your account and start your cinematic journey.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-purple-100 text-sm font-bold mb-2 font-cinema"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-gray-800/50 text-white rounded-lg focus:ring-1 focus:outline-none transition-all duration-200 border ${
                        errors.fullName
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-900 focus:ring-purple-400"
                      } pl-12`}
                      placeholder="Full Name"
                    />

                    <div className="absolute left-4 top-3.5 text-purple-400">
                      <User size={18} />
                    </div>
                  </div>
                  {errors.fullName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="username"
                    className="block text-purple-100 text-sm font-bold mb-2 font-cinema"
                  >
                    User Name <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      id="username"
                      name="username"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-gray-800/50 text-white rounded-lg focus:ring-1 focus:outline-none transition-all duration-200 border ${
                        errors.username
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-900 focus:ring-purple-400"
                      } pl-12`}
                      placeholder="User Name"
                    />

                    <div className="absolute left-4 top-3.5 text-purple-400">
                      <Clapperboard size={18} />
                    </div>
                  </div>
                  {errors.username && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.username}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-purple-100 text-sm font-bold mb-2 font-cinema"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-gray-800/50 text-white rounded-lg focus:ring-1 focus:outline-none transition-all duration-200 border ${
                        errors.email
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-900 focus:ring-purple-400"
                      } pl-12`}
                      placeholder="Email"
                    />

                    <div className="absolute left-4 top-3.5 text-purple-400">
                      <Mail size={18} />
                    </div>
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-purple-100 text-sm font-bold mb-2 font-cinema"
                  >
                    Phone <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-gray-800/50 text-white rounded-lg focus:ring-1 focus:outline-none transition-all duration-200 border ${
                        errors.phone
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-900 focus:ring-purple-400"
                      } pl-12`}
                      placeholder="Phone"
                    />

                    <div className="absolute left-4 top-3.5 text-purple-400">
                      <Phone size={18} />
                    </div>
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="birthDate"
                    className="block text-purple-100 text-sm font-bold mb-2 font-cinema"
                  >
                    Date Of birth <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <input
                      type="date"
                      id="birthDate"
                      name="birthDate"
                      required
                      value={formData.birthDate}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-gray-800/50 text-white rounded-lg focus:ring-1 focus:outline-none transition-all duration-200 border ${
                        errors.birthDate
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-900 focus:ring-purple-400"
                      } pl-12`}
                    />

                    <div className="absolute left-4 top-3.5 text-purple-400">
                      <Calendar size={18} />
                    </div>
                  </div>
                  {errors.birthDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.birthDate}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-purple-100 text-sm font-bold mb-2 font-cinema"
                  >
                    Password <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-gray-800/50 text-white rounded-lg focus:ring-1 focus:outline-none transition-all duration-200 border ${
                        errors.password
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-900 focus:ring-purple-400"
                      } pl-12`}
                      placeholder="Password"
                    />

                    <div className="absolute left-4 top-3.5 text-purple-400">
                      <Lock size={18} />
                    </div>

                    <button
                      type="button"
                      className="absolute right-4 top-3.5"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff size={18} className="text-purple-300" />
                      ) : (
                        <Eye size={18} className="text-purple-300" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-linear-to-r from-purple-600 to-purple-700 text-white font-bold py-3 px-4 rounded-full hover:opacity-90 transition-all duration-300 transform cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-500 focus:ring-opacity-50 shadow-lg shadow-purple-900/30 text-base ${
                    isLoading ? "opacity-80 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <ClipLoader size={18} color="#FFFFFF" />
                      <span className="text-sm animate-pulse">
                        Creating Your Account...
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Theater className="mr-2" size={20} />
                      <span className="font-cinema">Create an Account</span>
                    </div>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="text-purple-400 hover:text-purple-300 font-medium transition duration-200 underline hover:no-underline"
                >
                  Sign in to your account?
                </a>{" "}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
