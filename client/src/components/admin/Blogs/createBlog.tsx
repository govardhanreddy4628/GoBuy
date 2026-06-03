import { useState } from "react";
import { POST } from "../../../api/api_utility"; // ✅ USE YOUR API UTILITY
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const CreateBlog = () => {
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    content: "",
  });

  const [image, setImage] = useState<File | null>(null);

  // 🔥 👉 ADD YOUR FUNCTION HERE (inside component)
  const handleSubmit = async () => {
    try {
      const formData = new FormData();

      Object.entries(form).forEach(([k, v]) =>
        formData.append(k, v as string)
      );

      if (image) formData.append("image", image);

      await POST("/api/blogs", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Blog created!");

      // ✅ reset form (optional but recommended)
      setForm({
        title: "",
        category: "",
        description: "",
        content: "",
      });
      setImage(null);

    } catch (err) {
      console.error(err);
      alert("Error creating blog");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create Blog</h2>

      <input
        placeholder="Title"
        value={form.title}
        onChange={(e) =>
          setForm({ ...form, title: e.target.value })
        }
        className="border p-2 w-full mb-2"
      />

      <input
        placeholder="Category"
        value={form.category}
        onChange={(e) =>
          setForm({ ...form, category: e.target.value })
        }
        className="border p-2 w-full mb-2"
      />

      <input
        placeholder="Description"
        value={form.description}
        onChange={(e) =>
          setForm({ ...form, description: e.target.value })
        }
        className="border p-2 w-full mb-2"
      />

      <ReactQuill
        value={form.content}
        onChange={(value) =>
          setForm({ ...form, content: value })
        }
        className="mb-3"
      />

      <input
        type="file"
        onChange={(e) =>
          setImage(e.target.files?.[0] || null)
        }
        className="mb-3"
      />

      <button
        onClick={handleSubmit} // 🔥 THIS IS WHERE IT IS USED
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Publish
      </button>
    </div>
  );
};

export default CreateBlog;