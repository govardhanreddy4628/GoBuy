import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import * as Yup from "yup";
import Loader from "../../ui/Loader";
import { useAuth } from "../../context/authContext";
import api, { setAccessToken } from "../../api/api_utility";
import { useCart } from "../../context/cartContext";

/* ================= Validation schema =================== */
const LoginSchema = Yup.object({
  role: Yup.string()
    .oneOf(["user", "admin"])
    .required("Role is required"),
  email: Yup.string()
    .email("Invalid email")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

/* ==================Demo Credentials================= */
const DEMO_USER = {
  email: "userexplorer@gmail.com",
  password: "123456",
};

const DEMO_ADMIN = {
  email: "adminexplorer@gmail.com",
  password: "123456",
};

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(true);

  const [form, setForm] = useState({
    role: "user",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { mergeCartOnLogin } = useCart();

  /* ================= Validate =================== */
  const validate = async () => {
    try {
      await LoginSchema.validate(form, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      const error = err as Yup.ValidationError;
      const formErrors: Record<string, string> = {};
      error.inner.forEach((e) => {
        if (e.path) formErrors[e.path] = e.message;
      });
      setErrors(formErrors);
      return false;
    }
  };

  /* ================= Handlers ================== */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 🔥 Fill based on role (FIXED)
  const fillDemo = (role: "user" | "admin") => {
    const creds = role === "admin" ? DEMO_ADMIN : DEMO_USER;

    setForm({
      role,
      email: creds.email,
      password: creds.password,
    });

    setShowDemoModal(false);
    toast.success(`${role.toUpperCase()} demo loaded 🚀`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(await validate())) return;
    setIsLoading(true);

    try {
      const res = await api.post("/api/v1/user/login", form);
      const { accessToken, user } = res.data?.data || {};
      if (!accessToken || !user) {
        throw new Error("Invalid login response");
      }

      setAccessToken(accessToken);
      setUser(user);
      await mergeCartOnLogin();

      sessionStorage.removeItem("didLogout");
      toast.success(res.data?.message || "Login successful");

      const role = user.role.toUpperCase();

      navigate(role === "ADMIN" ? "/dashboard" : "/", {
        replace: true,
      });
    } catch (err) {
      const error = err as any;
      const message =
        error?.response?.data?.message ||
        error.message ||
        "Login failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate(`/forgot-password/${form.email || "email"}`);
  };

  if (isLoading) return <Loader />;

  /* ====================== UI ====================== */
  return (
    <>
      {/* ================= DEMO MODAL ================= */}
      {showDemoModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowDemoModal(false)} // ✅ outside click
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-[90%] max-w-md shadow-xl relative text-gray-800 dark:text-gray-100"
            onClick={(e) => e.stopPropagation()} // ✅ prevent close when clicking inside
          >
            {/* ❌ Close button */}
            <button
              onClick={() => setShowDemoModal(false)}
              className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white text-lg"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-2 text-center">
              🚀 Quick Explore
            </h2>

            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              Skip email verification using demo accounts
            </p>

            {/* USER DEMO */}
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm mb-3">
              <p className="font-semibold">👤 User Demo</p>
              <p>Email: {DEMO_USER.email}</p>
              <p>Password: {DEMO_USER.password}</p>
              <button
                onClick={() => fillDemo("user")}
                className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white py-1.5 rounded-md"
              >
                Use User Demo
              </button>
            </div>

            {/* ADMIN DEMO */}
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm mb-3">
              <p className="font-semibold">🛠 Admin Demo</p>
              <p>Email: {DEMO_ADMIN.email}</p>
              <p>Password: {DEMO_ADMIN.password}</p>
              <button
                onClick={() => fillDemo("admin")}
                className="mt-2 w-full bg-black dark:bg-white dark:text-black hover:opacity-90 text-white py-1.5 rounded-md"
              >
                Use Admin Demo
              </button>
            </div>

            <button
              onClick={() => setShowDemoModal(false)}
              className="w-full border border-gray-300 dark:border-gray-700 py-2 rounded-md font-semibold mt-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Login / Signup
            </button>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
              You can also explore products without logging in.
            </p>
          </div>
        </div>
      )}

      {/* ================= LOGIN FORM ================= */}
      <section className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 px-4">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 w-full max-w-md mt-6 border border-gray-200 dark:border-gray-700">

          <h2 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-gray-100">
            Welcome Back 👋
          </h2>

          <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
            Login to your account
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* DEMO BUTTON */}
            <button
              type="button"
              onClick={() => fillDemo(form.role as "user" | "admin")}
              className="w-full border border-dashed border-gray-400 dark:border-gray-600 py-2 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition"
            >
              ⚡ Use {form.role === "admin" ? "Admin" : "User"} Demo
            </button>

            {/* ROLE SWITCH */}
            <div className="relative w-64 mx-auto bg-gray-100 dark:bg-gray-700 rounded-xl flex p-1 shadow-inner">
              <div
                className={`absolute h-10 w-1/2 bg-white dark:bg-gray-900 rounded-lg shadow-md transition-transform duration-300 ${form.role === "user"
                    ? "translate-x-0"
                    : "translate-x-full"
                  }`}
              />

              <button
                type="button"
                onClick={() => setForm({ ...form, role: "user" })}
                className={`flex-1 z-10 py-2.5 font-semibold text-sm transition ${form.role === "user"
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-gray-300"
                  }`}
              >
                User
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, role: "admin" })}
                className={`flex-1 z-10 py-2.5 font-semibold text-sm transition ${form.role === "admin"
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-gray-300"
                  }`}
              >
                Admin
              </button>
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md p-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
                placeholder="Enter email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="flex items-center border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md p-2">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </div>

            {/* FORGOT PASSWORD */}
            <div
              onClick={handleForgotPassword}
              className="text-sm text-red-500 text-right cursor-pointer hover:underline"
            >
              Forgot password?
            </div>

            {/* LOGIN BUTTON */}
            <button
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-semibold disabled:opacity-60 transition"
            >
              Login
            </button>

            {/* SIGNUP */}
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Don’t have an account?{" "}
              <Link
                to="/signup"
                className="text-red-600 font-medium hover:underline"
              >
                Sign up
              </Link>
            </p>

          </form>
        </div>
      </section>
    </>
  );
};

export default Login;