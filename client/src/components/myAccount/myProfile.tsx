import { Button, TextField } from "@mui/material";
import { useAuth } from "../../context/authContext";
import { useEffect, useState } from "react";
import axios from "axios";
import { PUT } from "../../api/api_utility";

const MyProfile = () => {
  const { user, setUser } = useAuth();
  console.log(user)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
  });

  const [loading, setLoading] = useState(false);

  // ✅ Prefill user data
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
  }, [user]);

  // ✅ Handle input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ Save update
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const res = await PUT("/api/v1/user/update-profile", formData);

      if (res.data.success) {
        setUser(res.data.user);
        alert("Profile updated successfully");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Reset
  const handleCancel = () => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
    else{
      setFormData({
        fullName: "",
        email: "",
        phoneNumber: ""
      })
    }
  };

  // ✅ Common dark mode styles for MUI TextField
  const darkTextField = {
    input: {
      color: "#e5e7eb", // gray-200
    },
    label: {
      color: "#9ca3af", // gray-400
    },
    "& .MuiOutlinedInput-root": {
      backgroundColor: "transparent",
      "& fieldset": {
        borderColor: "#6b7280", // gray-500
      },
      "&:hover fieldset": {
        borderColor: "#d1d5db", // gray-300
      },
      "&.Mui-focused fieldset": {
        borderColor: "#ef4444", // red-500
      },
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#ef4444",
    },
  };

  return (
    <div className="text-gray-800 dark:text-gray-100">
      <h1 className="text-xl font-semibold mb-4">My Profile</h1>
      <hr className="my-4 border-gray-300 dark:border-gray-700" />

      <div className="flex flex-col gap-5 mb-6">

        <TextField
          label="Full Name"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          sx={darkTextField}
        />

        <TextField
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          sx={darkTextField}
        />

        <TextField
          label="Phone Number"
          name="phoneNumber"
          type="tel"
          value={formData.phoneNumber}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          sx={darkTextField}
        />

      </div>

      <div className="flex gap-4">
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !user}
          className="!rounded-none !bg-red-500 hover:!bg-red-600 dark:!bg-red-600"
        >
          {loading ? "Saving..." : "Save"}
        </Button>

        <Button
          variant="outlined"
          onClick={handleCancel}
          className="!rounded-none !border-gray-400 dark:!border-gray-600 !text-gray-700 dark:!text-gray-200"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default MyProfile;