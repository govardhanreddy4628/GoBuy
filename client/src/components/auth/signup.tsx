import { useState } from "react";
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import signinGif from "../../assets/signin.gif";

interface SignupResponse {
  success?: boolean;
  error?: boolean;
  message: string;
  intentToken?: string;
}

const SignupSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, "Name must be at least 3 characters")
    .max(15, "Name must be less than 15 characters")
    .required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "Must be 6+ chars").required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const navigate = useNavigate();

  const imageToBase64 = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUploadPic = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await imageToBase64(file);
      setImagePreview(base64);
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (
    values: {
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
    },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      const formData = new FormData();
      formData.append("fullName", values.name);
      formData.append("email", values.email);
      formData.append("password", values.password);
      formData.append("confirmPassword", values.confirmPassword);


      if (selectedFile) formData.append("image", selectedFile);

      const response = await fetch(
        "http://localhost:8080/api/v1/user/register",
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      const result: SignupResponse = await response.json();
      console.log(result)

      if (!response.ok) throw new Error(result.message || "Signup failed");

      localStorage.setItem("intentToken", result.intentToken || "");
      toast.success(result.message);
      navigate("/otpverify");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const googleSignUp = () => {
    const API_BASE =
      import.meta.env.VITE_BACKEND_URL_LOCAL ||
      import.meta.env.VITE_BACKEND_URL_PRODUCTION ||
      "http://localhost:8080";

    window.location.href = `${API_BASE}/api/v1/auth/google`;
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 px-4 py-10">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-700">

        {/* Avatar Upload */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            <img
              src={imagePreview || signinGif}
              alt="avatar"
              className="w-14 h-14 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600 shadow-sm"
            />
            <label className="absolute bottom-0 left-0 w-full text-center bg-black/60 text-white text-xs py-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-b-full">
              Upload Photo
              <input type="file" className="hidden" onChange={handleUploadPic} />
            </label>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-gray-100">
          Create Account
        </h2>

        <Formik
          initialValues={{
            role: "user",
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
          }}
          validationSchema={SignupSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className="space-y-4">

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <Field
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-2 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
                {touched.name && errors.name && (
                  <div className="text-sm text-red-500 mt-1">{errors.name}</div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <Field
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-2 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
                {touched.email && errors.email && (
                  <div className="text-sm text-red-500 mt-1">{errors.email}</div>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div className="flex items-center border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 rounded-md">
                  <Field
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    className="flex-grow bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {touched.password && errors.password && (
                  <div className="text-sm text-red-500 mt-1">
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm Password
                </label>
                <div className="flex items-center border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 rounded-md">
                  <Field
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    className="flex-grow bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {touched.confirmPassword && errors.confirmPassword && (
                  <div className="text-sm text-red-500 mt-1">
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2 rounded-md flex items-center justify-center gap-2 transition-all ${isSubmitting
                    ? "bg-black text-white cursor-wait"
                    : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Sign Up"
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-2 my-4">
                <hr className="flex-grow border-gray-300 dark:border-gray-600" />
                <span className="text-gray-500 dark:text-gray-400 text-sm">OR</span>
                <hr className="flex-grow border-gray-300 dark:border-gray-600" />
              </div>

              {/* Google */}
              <button
                type="button"
                className="flex items-center justify-center gap-3 w-full border border-gray-300 dark:border-gray-600 rounded-md py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-gray-800 dark:text-gray-100"
                onClick={googleSignUp}
              >
                <FcGoogle size={22} />
                <span>Sign up with Google</span>
              </button>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-red-600 font-medium hover:underline"
                >
                  Login
                </Link>
              </p>

            </Form>
          )}
        </Formik>
      </div>
    </section>
  );
}
