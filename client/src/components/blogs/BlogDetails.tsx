import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { GET } from "../../api/api_utility";

type Blog = {
  _id: string;
  title: string;
  content: string;
  image: string;
};

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);

  const fetchBlog = async () => {
    try {
      const res = await GET(`/api/v1/blogs/${id}`);
      setBlog(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (id) fetchBlog();
  }, [id]);

  if (!blog)
    return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <img
        src={blog.image}
        alt={blog.title}
        className="w-full rounded-lg mb-6"
      />

      <h1 className="text-3xl font-bold mb-4 text-gray-800">
        {blog.title}
      </h1>

      {/* ✅ SCROLLABLE CONTENT */}
      <div className="max-h-[400px] overflow-y-auto pr-2 border rounded p-4">
        <div
          className="text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: blog.content || "" }}
        />
      </div>

      <Link
        to="/"
        className="text-blue-600 text-sm mt-4 inline-block hover:underline"
      >
        ← Back to Blog
      </Link>
    </div>
  );
};

export default BlogDetail;