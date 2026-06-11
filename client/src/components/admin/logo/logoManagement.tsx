import { useEffect, useState } from "react";
import { GET, POST, PUT, DELETE } from "../../../api/api_utility";

const LogoManager = () => {
  const [logos, setLogos] = useState<any[]>([]);
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchLogos = async () => {
    const res = await GET("/api/v1/logos");
    setLogos(res.data.logos || []);
  };

  useEffect(() => {
    fetchLogos();
  }, []);

  // ✅ Upload
  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("image", file);

    setLoading(true);
    await POST("/api/v1/logos", formData);
    setFile(null);
    fetchLogos();
    setLoading(false);
  };

  // ✅ Set Active
  const setActive = async (id: string) => {
    await PUT(`/api/v1/logos/active/${id}`);
    fetchLogos();
  };

  // ✅ Delete
  const removeLogo = async (id: string) => {
    const confirmDelete = window.confirm("Delete this logo?");
    if (!confirmDelete) return;

    await DELETE(`/api/v1/logos/${id}`);
    fetchLogos();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          Logo Management
        </h2>
        <p className="text-gray-500 text-sm">
          Upload, manage and set active logo
        </p>
      </div>

      {/* UPLOAD SECTION */}
      <div className="bg-white border rounded-lg p-5 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <input
            type="file"
            className="border p-2 rounded w-full md:w-auto"
            onChange={(e) => setFile(e.target.files?.[0])}
          />

          <button
            onClick={handleUpload}
            disabled={loading}
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload Logo"}
          </button>
        </div>
      </div>

      {/* LOGO GRID */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {logos.map((logo) => (
          <div
            key={logo._id}
            className="bg-white border rounded-lg shadow-sm hover:shadow-md transition p-4 flex flex-col items-center"
          >
            {/* IMAGE */}
            <div className="h-20 flex items-center justify-center mb-3">
              <img
                src={logo.image}
                alt="logo"
                className="max-h-full object-contain"
              />
            </div>

            {/* ACTIVE BADGE */}
            {logo.isActive && (
              <span className="bg-green-100 text-green-600 text-xs px-3 py-1 rounded-full mb-3">
                Active
              </span>
            )}

            {/* BUTTONS */}
            <div className="flex gap-2 mt-auto">
              <button
                onClick={() => setActive(logo._id)}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
              >
                Set Active
              </button>

              <button
                onClick={() => removeLogo(logo._id)}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EMPTY STATE */}
      {logos.length === 0 && (
        <div className="text-center text-gray-400 mt-10">
          No logos uploaded yet
        </div>
      )}
    </div>
  );
};

export default LogoManager;