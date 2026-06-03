import { useEffect, useState } from "react";
import { GET, DELETE, PUT } from "../../../api/api_utility";

type Blog = {
    _id: string;
    title: string;
    category: string;
    createdAt: string;
};

const AdminBlogs = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [selected, setSelected] = useState<any>(null);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");

    // 🔥 FETCH BLOGS
    const fetchBlogs = async () => {
        const res = await GET("/api/v1/blogs", {
            params: { page, search, category },
        });
        setBlogs(res.data.blogs);
        setTotalPages(res.data.pages);
    };

    useEffect(() => {
        fetchBlogs();
    }, [page, search, category]);

    // 🔥 DELETE
    const handleDelete = async (id: string) => {
        if (!confirm("Delete this blog?")) return;

        await DELETE(`/api/blogs/${id}`);
        fetchBlogs();
    };

    // 🔥 UPDATE
    const handleUpdate = async () => {
        await PUT(`/api/blogs/${selected._id}`, selected);
        setSelected(null);
        fetchBlogs();
    };

    return (
        <div className="p-6">
            {/* HEADER */}
            <h2 className="text-2xl font-bold mb-4">Manage Blogs</h2>

            {/* SEARCH + FILTER */}
            <div className="flex flex-wrap gap-3 mb-4">
                <input
                    placeholder="Search blogs..."
                    className="border px-3 py-2 rounded w-64"
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
                    className="border px-3 py-2 rounded"
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="">All Categories</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Beauty">Beauty</option>
                    <option value="Groceries">Groceries</option>
                </select>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
                <table className="w-full border rounded-lg overflow-hidden shadow">
                    <thead className="bg-gray-100 text-left">
                        <tr>
                            <th className="p-3">Title</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Created</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {blogs.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center p-4">
                                    No blogs found
                                </td>
                            </tr>
                        ) : (
                            blogs.map((blog) => (
                                <tr key={blog._id} className="border-t hover:bg-gray-50">
                                    <td className="p-3 font-medium">{blog.title}</td>
                                    <td className="p-3">{blog.category}</td>
                                    <td className="p-3">
                                        {new Date(blog.createdAt).toLocaleDateString()}
                                    </td>

                                    <td className="p-3 text-center space-x-2">
                                        <button
                                            onClick={() => setSelected(blog)}
                                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => handleDelete(blog._id)}
                                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}
            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    className="px-3 py-1 border rounded"
                >
                    Prev
                </button>

                <span>
                    Page {page} of {totalPages}
                </span>

                <button
                    onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
                    className="px-3 py-1 border rounded"
                >
                    Next
                </button>
            </div>

            {/* EDIT MODAL */}
            {selected && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 w-[500px] rounded-lg shadow-lg">
                        <h3 className="text-xl font-semibold mb-4">Edit Blog</h3>

                        <input
                            value={selected.title}
                            onChange={(e) =>
                                setSelected({ ...selected, title: e.target.value })
                            }
                            className="border w-full p-2 mb-3 rounded"
                        />

                        <input
                            value={selected.category}
                            onChange={(e) =>
                                setSelected({ ...selected, category: e.target.value })
                            }
                            className="border w-full p-2 mb-3 rounded"
                        />

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setSelected(null)}
                                className="px-3 py-1 border rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleUpdate}
                                className="bg-blue-500 text-white px-4 py-1 rounded"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBlogs;