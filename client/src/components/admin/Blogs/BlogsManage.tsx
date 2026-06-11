import { useEffect, useState } from "react";
import { GET, DELETE, PUT, POST } from "../../../api/api_utility";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import Loader from "../../../ui/Loader";

type Blog = {
  _id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  image: string;
  createdAt: string;
};

const AdminBlogs = () => {
  const [allBlogs, setAllBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);

  const [selected, setSelected] = useState<Blog | null>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    content: "",
  });

  const [image, setImage] = useState<File | null>(null);

  // ✅ NEW → preview image (fix edit issue)
  const [previewImage, setPreviewImage] = useState<string>("");

  // debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await GET("/api/v1/blogs");
      setAllBlogs(res.data.blogs);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // FILTER
  useEffect(() => {
    let data = [...allBlogs];

    if (debouncedSearch) {
      data = data.filter((b) =>
        b.title.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    if (category) {
      data = data.filter((b) => b.category === category);
    }

    setFilteredBlogs(data);
    setPage(1);
  }, [debouncedSearch, category, allBlogs]);

  // PAGINATION
  useEffect(() => {
    const start = (page - 1) * limit;
    const end = start + limit;

    setBlogs(filteredBlogs.slice(start, end));
    setTotalPages(Math.ceil(filteredBlogs.length / limit));
  }, [filteredBlogs, page, limit]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this blog?")) return;
    await DELETE(`/api/v1/blogs/${id}`);
    fetchBlogs();
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();

      Object.entries(form).forEach(([k, v]) =>
        formData.append(k, v || "") // ✅ content optional
      );

      if (image) formData.append("image", image);

      if (isEdit && selected) {
        await PUT(`/api/v1/blogs/${selected._id}`, formData);
      } else {
        await POST("/api/v1/blogs", formData);
      }

      setIsModalOpen(false);
      setSelected(null);
      setImage(null);
      setPreviewImage(""); // ✅ reset preview

      setForm({
        title: "",
        category: "",
        description: "",
        content: "",
      });

      fetchBlogs();
    } catch (err) {
      console.error(err);
      alert("Error saving blog");
    }
  };

  // ✅ CATEGORY FROM DATA (dynamic)
  const categories = [...new Set(allBlogs.map((b) => b.category))];

  if (loading) {
    return <Loader/>;
  }

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Manage Blogs</h2>

        <button
          onClick={() => {
            setForm({
              title: "",
              category: "",
              description: "",
              content: "",
            });
            setImage(null);
            setPreviewImage(""); // reset
            setIsEdit(false);
            setIsModalOpen(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          + Create Blog
        </button>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex gap-3 mb-4">
        <input
          placeholder="Search blogs..."
          className="border px-3 py-2 rounded w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border px-3 py-2 rounded focus:outline-none"
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All</option>
          {categories.map((cat, i) => (
            <option key={i} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">Image</th>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Content</th>
              <th className="p-3 text-left">Created</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {blogs.map((b) => (
              <tr key={b._id} className="border-t hover:bg-gray-50 transition">
                <td className="p-3">
                  <img src={b.image} className="w-14 h-14 object-cover rounded" />
                </td>
                <td className="p-3">{b.title}</td>
                <td className="p-3">{b.category}</td>
                <td className="p-3 max-w-xs truncate">{b.description}</td>
                <td
                  className="p-3 max-w-xs truncate"
                  dangerouslySetInnerHTML={{ __html: b.content }}
                />
                <td className="p-3">
                  {new Date(b.createdAt).toLocaleDateString()}
                </td>

                <td className="p-3 text-center">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => {
                        setSelected(b);
                        setForm({
                          title: b.title,
                          category: b.category,
                          description: b.description,
                          content: b.content || "",
                        });
                        setPreviewImage(b.image); // ✅ FIX: show existing image
                        setImage(null);
                        setIsEdit(true);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEdit />
                    </button>

                    <button
                      onClick={() => handleDelete(b._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ PAGINATION ONLY IF DATA EXISTS */}
      {filteredBlogs.length > 0 && (
        <div className="mt-6 flex justify-center items-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
            disabled={page === 1}
          >
            Prev
          </button>

          <span className="font-medium">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 w-[600px] rounded">
            <h3 className="text-xl mb-3">
              {isEdit ? "Edit Blog" : "Create Blog"}
            </h3>

            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              className="border w-full mb-2 p-2"
            />

            <input
              placeholder="Category"
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
              className="border w-full mb-2 p-2"
            />

            <input
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="border w-full mb-2 p-2"
            />

            <label className="block font-medium mt-1 text-gray-400">
              Content (optional)
            </label>

            <ReactQuill
              value={form.content || ""}
              onChange={(val) =>
                setForm({ ...form, content: val })
              }
              className="mb-3"
            />

            {/* ✅ IMAGE PREVIEW */}
            {previewImage && (
              <img
                src={previewImage}
                className="w-24 h-24 object-cover rounded mb-2"
              />
            )}

            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setImage(file);
                  setPreviewImage(URL.createObjectURL(file)); // new preview
                }
              }}
              className="mb-3"
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="bg-blue-500 text-white px-4 py-1"
              >
                {isEdit ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlogs;