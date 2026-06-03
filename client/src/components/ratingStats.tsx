import { Divider } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { IoIosStar } from "react-icons/io";
import api from '../api/api_utility';
import toast from 'react-hot-toast';
import { useAuth } from '../context/authContext';

type RatingBarProps = {
  star: number;
  count: number;
  total: number;
  color: string;
};


const RatingBar: React.FC<RatingBarProps> = ({ star, count, total, color }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center text-sm">
      <div className="flex w-11 shrink-0 items-center space-x-1 font-semibold">
        <span className="text-sm text-gray-900">{star}</span>
        <svg
          className="w-4 text-orange-400 fill-orange-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 256 256"
        >
          <path d="M234.29,114.85l-45,38.83L203,211.75a16.4,16.4,0,0,1-24.5,17.82L128,198.49,77.47,229.57A16.4,16.4,0,0,1,53,211.75l13.76-58.07-45-38.83A16.46,16.46,0,0,1,31.08,86l59-4.76,22.76-55.08a16.36,16.36,0,0,1,30.27,0l22.75,55.08,59,4.76a16.46,16.46,0,0,1,9.37,28.86Z" />
        </svg>
      </div>
      <div className="relative h-1 w-52 overflow-hidden rounded-md bg-gray-200 mx-3">
        <div
          className={`absolute h-full rounded-md ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="shrink-0 ps-2 text-gray-700">{count}</div>
    </div>
  );
};

// ⭐⭐ NEW: Controlled StarRating Component
const StarRating = ({
  rating,
  setRating,
}: {
  rating: number;
  setRating: (value: number) => void;
}) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex justify-center items-center h-[50px] w-full gap-1">
      {[...Array(5)].map((_, i) => {
        const active = i < (hover || rating);

        return (
          <IoIosStar
            key={i}
            size={45}
            onClick={() => setRating(i + 1)}
            onMouseEnter={() => setHover(i + 1)}
            onMouseLeave={() => setHover(0)}
            className="cursor-pointer transition-colors duration-200"
            color={active ? "#facc15" : "#d1d5db"} // yellow / gray
          />
        );
      })}
    </div>
  );
};


type RatingStatsProps = {
  average: number;
  totalReviews: number;
  breakdown: { [key: number]: number };
  productId: string;
  //verifiedCount?: number;
};


const RatingStats: React.FC<RatingStatsProps> = ({
  average,
  totalReviews,
  breakdown,
  productId,
  //verifiedCount,
}) => {
  const [userRating, setUserRating] = useState(0);
  const [reviewMessage, setReviewMessage] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const {isAuthenticated} = useAuth()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);

    if (fileArray.length > 3) {
      alert("Maximum 3 images allowed");
      return;
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];

    const validFiles = fileArray.filter((file) =>
      allowedTypes.includes(file.type)
    );

    if (validFiles.length !== fileArray.length) {
      alert("Only PNG, JPEG, WEBP allowed");
      return;
    }

    setImages(validFiles);

    const urls = validFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };


  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedPreviews = previewUrls.filter((_, i) => i !== index);

    URL.revokeObjectURL(previewUrls[index]); // cleanup 

    setImages(updatedImages);
    setPreviewUrls(updatedPreviews);
  };

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleSubmit = async () => {
    if(!isAuthenticated) {
      toast.error("Please login to submit review");
      return;
    }
    if (!userRating) {
      alert("Please select rating");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("productId", productId);
      formData.append("rating", userRating.toString());
      formData.append("comment", reviewMessage);

      images.forEach((file) => {
        formData.append("media", file);
      });

      const res = await api.post("/api/v1/reviews/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!res.ok) { throw new Error("Failed to submit review") }
      alert("Review submitted successfully");

      // Reset
      setImages([]);
      setPreviewUrls([]);
      setReviewMessage("");
      setUserRating(0);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="p-6 max-w-xl">
      <h2 className="text-xl font-semibold text-green-800 border-l-4 border-green-800 pl-2 mb-4">
        Feedback & Rating
      </h2>

      <div className='bg-white rounded-lg shadow-md border-b-2 border-slate-400 p-3'>
        <div className="w-full pb-7 lg:flex lg:flex-wrap">
          {/* LEFT SIDE */}
          <div className="flex shrink-0 flex-col justify-center ps-4 mb-8 border-gray-100 pb-6 lg:w-44 lg:border-e lg:pb-0">
            <div className="pb-2 text-5xl font-bold text-gray-900">
              {average.toFixed(1)} / 5
            </div>

            {/* <p className="text-gray-500">
              <span>{totalReviews} Reviews</span>
              {verifiedCount !== undefined && (
                <span className="text-green-600 text-xs font-semibold ml-2">
                  ✔ {verifiedCount} Verified Buyers
                </span>
              )}
            </p> */}

            <div className="flex mt-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${i < Math.round(average)
                    ? "text-yellow-400"
                    : "text-gray-300"
                    }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.165c.969 0 1.371 1.24.588 1.81l-3.37 2.447a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.538 1.118l-3.37-2.447a1 1 0 00-1.176 0l-3.37 2.447c-.783.57-1.838-.197-1.538-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.069 9.384c-.783-.57-.38-1.81.588-1.81h4.165a1 1 0 00.95-.69l1.286-3.957z" />
                </svg>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-3 py-1 lg:ps-6">
            {[5, 4, 3, 2, 1].map((star) => (
              <RatingBar
                key={star}
                star={star}
                count={breakdown[star] || 0}
                total={totalReviews}
                color={
                  star === 5
                    ? 'bg-orange-400'
                    : star === 4
                      ? 'bg-yellow-400'
                      : star === 3
                        ? 'bg-green-400'
                        : star === 2
                          ? 'bg-red-400'
                          : 'bg-gray-400'
                }
              />
            ))}
          </div>
        </div>

        {/* 🔥 REVIEW FORM */}
        <div className="space-y-4">
          <Divider />
          <h2 className="text-xl font-semibold text-green-800 border-l-4 border-green-800 pl-2 mb-4">
            Give Feedback
          </h2>
          <StarRating rating={userRating} setRating={setUserRating} />
          <textarea
            value={reviewMessage}
            onChange={(e) => setReviewMessage(e.target.value)}
            placeholder="Write a feedback"
            className="w-full p-2 pb-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
          />


          <div className="flex gap-3 mt-2">
            {previewUrls.map((url, i) => (
              <div key={i} className="relative">
                <img
                  src={url}
                  className="w-20 h-20 object-cover rounded"
                  alt="preview"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className='flex justify-between items-center'>
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              multiple
              onChange={handleFileChange}
              className="mt-3"
            />

          </div>

          <button
            onClick={handleSubmit}
            disabled={userRating === 0}
            className={`text-sm font-bold px-4 py-2 rounded w-full text-center
            ${userRating === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-500 hover:bg-gray-900 text-white"
              }`}
          >
            SUBMIT REVIEW
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingStats;