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
            className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-xl relative"
            onClick={(e) => e.stopPropagation()} // ✅ prevent close when clicking inside
          >
            {/* ❌ Close button */}
            <button
              onClick={() => setShowDemoModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black text-lg"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-2 text-center">
              🚀 Quick Explore
            </h2>

            <p className="text-gray-600 text-center mb-4">
              Skip email verification using demo accounts
            </p>

            {/* USER DEMO */}
            <div className="bg-gray-100 p-3 rounded-lg text-sm mb-3">
              <p className="font-semibold">👤 User Demo</p>
              <p>Email: {DEMO_USER.email}</p>
              <p>Password: {DEMO_USER.password}</p>
              <button
                onClick={() => fillDemo("user")}
                className="mt-2 w-full bg-red-600 text-white py-1.5 rounded-md"
              >
                Use User Demo
              </button>
            </div>

            {/* ADMIN DEMO */}
            <div className="bg-gray-100 p-3 rounded-lg text-sm mb-3">
              <p className="font-semibold">🛠 Admin Demo</p>
              <p>Email: {DEMO_ADMIN.email}</p>
              <p>Password: {DEMO_ADMIN.password}</p>
              <button
                onClick={() => fillDemo("admin")}
                className="mt-2 w-full bg-black text-white py-1.5 rounded-md"
              >
                Use Admin Demo
              </button>
            </div>

            <button
              onClick={() => setShowDemoModal(false)}
              className="w-full border py-2 rounded-md font-semibold mt-2"
            >
              Login / Signup
            </button>

            <p className="text-xs text-center text-gray-500 mt-3">
              You can also explore products without logging in.
            </p>
          </div>
        </div>
      )}

      {/* ================= LOGIN FORM ================= */}
      <section className="flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md mt-6">
          <h2 className="text-2xl font-bold text-center mb-2">
            Welcome Back 👋
          </h2>
          <p className="text-center text-gray-500 mb-6">
            Login to your account
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* QUICK DEMO BUTTON */}
            <button
              type="button"
              onClick={() => fillDemo(form.role as "user" | "admin")}
              className="w-full border border-dashed border-gray-400 py-2 rounded-md text-sm hover:bg-gray-50"
            >
              ⚡ Use {form.role === "admin" ? "Admin" : "User"} Demo
            </button>

            {/* Role switch */}
            <div className="relative w-64 mx-auto bg-gray-100 rounded-xl flex p-1 shadow-inner">
              <div
                className={`absolute h-10 w-1/2 bg-white rounded-lg shadow-md transition-transform ${
                  form.role === "user"
                    ? "translate-x-0"
                    : "translate-x-full"
                }`}
              />
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "user" })}
                className={`flex-1 z-10 py-2.5 font-semibold text-sm ${
                  form.role === "user"
                    ? "text-gray-900"
                    : "text-gray-500"
                }`}
              >
                User
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "admin" })}
                className={`flex-1 z-10 py-2.5 font-semibold text-sm ${
                  form.role === "admin"
                    ? "text-gray-900"
                    : "text-gray-500"
                }`}
              >
                Admin
              </button>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border rounded-md p-2"
                placeholder="Enter email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium">
                Password
              </label>
              <div className="flex items-center border rounded-md p-2">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  className="flex-1 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </div>

            <div
              onClick={handleForgotPassword}
              className="text-sm text-red-500 text-right cursor-pointer"
            >
              Forgot password?
            </div>

            <button
              disabled={isLoading}
              className="w-full bg-red-600 text-white py-2 rounded-md font-semibold disabled:opacity-60"
            >
              Login
            </button>

            <p className="text-center text-sm">
              Don’t have an account?{" "}
              <Link to="/signup" className="text-red-600 font-medium">
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