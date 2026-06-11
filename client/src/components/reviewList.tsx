import React, { useEffect, useState } from "react";
import { Grid } from "lucide-react";
import { io } from "socket.io-client";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { PUT } from "../api/api_utility";


/* =========================== TYPES =========================== */
interface Review {
  _id: string;
  user: { name: string; avatar?: string };
  rating: number;
  comment: string;
  createdAt: string;
  media?: string[];
  upvotes: number;
  downvotes: number;
  verifiedPurchase?: boolean;
}

// Star Rating
const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex mt-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        viewBox="0 0 24 24"
        fill={i < rating ? "gold" : "none"}
        className={`w-4 h-4 ${i < rating
            ? "text-yellow-400"
            : "text-gray-300 dark:text-gray-600"
          }`}
      >
        <path d="M12 2l3 7h7l-5.5 4.2L18 21l-6-4-6 4 1.5-7.8L2 9h7z" />
      </svg>
    ))}
  </div>
);

// Review Card
const ReviewCard: React.FC<{
  review: Review;
  onVote: (id: string, vote: "up" | "down") => void;
}> = ({ review, onVote }) => {
  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow border dark:border-gray-700 hover:shadow-md transition">

      {/* User Info */}
      <div className="flex items-center gap-3 mb-2">
        <img
          src={review.user.avatar || "/default-avatar.png"}
          alt={review.user.name}
          className="w-12 h-12 rounded-full object-cover border dark:border-gray-600"
        />
        <div>
          <h4 className="font-semibold text-sm flex items-center gap-2 text-gray-900 dark:text-gray-100">
            {review.user.name}
            {review.verifiedPurchase && (
              <span className="text-green-600 dark:text-green-400 text-xs font-semibold">
                ✔ Verified
              </span>
            )}
          </h4>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(review.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Rating */}
      <StarRating rating={review.rating} />

      {/* Comment */}
      <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
        {review.comment}
      </p>

      {/* Images */}
      {review.media && review.media.length > 0 && (
        <div className="flex gap-2 mt-2">
          {review.media.map((img, i) => (
            <img
              key={i}
              src={img}
              className="w-16 h-16 object-cover rounded"
              alt="review"
            />
          ))}
        </div>
      )}

      {/* Like / Dislike */}
      <div className="flex items-center gap-4 mt-2">

        <button
          onClick={() => onVote(review._id, "up")}
          className="flex items-center gap-1 text-green-600 dark:text-green-400 hover:scale-105 transition"
        >
          <ThumbsUp size={18} />
          {review.upvotes}
        </button>

        <button
          onClick={() => onVote(review._id, "down")}
          className="flex items-center gap-1 text-red-600 dark:text-red-400 hover:scale-105 transition"
        >
          <ThumbsDown size={18} />
          {review.downvotes}
        </button>

      </div>
    </div>
  );
};


/* ================MAIN COMPONENT ============== */
const ReviewList: React.FC<{ productId: string }> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [gridView, setGridView] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("latest");
  const [loading, setLoading] = useState(false);

  /* ============== FETCH REVIEWS =============== */
  const fetchReviews = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `http://localhost:8080/api/v1/reviews?productId=${productId}&page=${page}&sortBy=${sort}`
      );

      const data = await res.json();

      setReviews((prev) =>
        page === 1 ? data.reviews : [...prev, ...data.reviews]
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page, sort]);

  useEffect(() => {
    const socket = io("http://localhost:8080");

    socket.emit("join-product", productId);

    socket.on("new-review", (review) => {
      setReviews(prev => [review, ...prev]);
    });

    socket.on("review-vote-update", (data) => {
      setReviews(prev =>
        prev.map(r =>
          r._id === data.reviewId
            ? { ...r, upvotes: data.upvotes, downvotes: data.downvotes }
            : r
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [productId]);

  /* ===========================
     LIKE / DISLIKE
  =========================== */

  // const handleLike = async (id: string) => {
  //   await fetch(`http://localhost:8080/api/v1/reviews/${id}/like`, {
  //     method: "PUT",
  //     credentials: "include",
  //   });

  //   setReviews((prev) =>
  //     prev.map((r) =>
  //       r._id === id ? { ...r, upvotes: r.upvotes + 1 } : r
  //     )
  //   );
  // };

  // const handleDislike = async (id: string) => {
  //   await fetch(`http://localhost:8080/api/v1/reviews/${id}/dislike`, {
  //     method: "PUT",
  //     credentials: "include",
  //   });

  //   setReviews((prev) =>
  //     prev.map((r) =>
  //       r._id === id ? { ...r, downvotes: r.downvotes + 1 } : r
  //     )
  //   );
  // };

  /* ===========================
     UI
  =========================== */
  const handleVote = async (id: string, vote: "up" | "down") => {
    try {
      const res = await PUT(`/api/v1/reviews/${id}/vote`, { vote });

      const data = res.data;

      if (!data.success) return;

      // ✅ Always trust backend
      setReviews((prev) =>
        prev.map((r) =>
          r._id === id
            ? {
              ...r,
              upvotes: data.upvotes,
              downvotes: data.downvotes,
            }
            : r
        )
      );
    } catch (err: any) {
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4 px-6 bg-white dark:bg-gray-900 transition-colors">
     
     <h2 className="text-xl font-semibold text-green-800 dark:text-green-400 border-l-4 border-green-800 dark:border-green-400 pl-2 mb-4">
      Customers say
    </h2>

      {/* Top Controls */}
      <div className="flex justify-between items-center mb-4">

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => {
            setPage(1);
            setSort(e.target.value);
          }}
          className="border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 p-2 rounded focus:outline-none"
        >
          <option value="recent">Recent</option>
          <option value="helpful">Most Helpful</option>
        </select>

        {/* Grid Toggle */}
        <button
          onClick={() => setGridView(!gridView)}
          className="p-2 shadow rounded bg-gray-100 dark:bg-gray-800 hover:scale-105 transition"
        >
          <Grid size={18} className="text-gray-800 dark:text-gray-200" />
        </button>
      </div>

      {/* Reviews */}
      <div
        className={
          gridView
            ? "grid grid-cols-2 gap-4"
            : "grid grid-cols-1 gap-4"
        }
      >
        {reviews.map((review) => (
          <ReviewCard
            key={review._id}
            review={review}
            onVote={handleVote}
          />
        ))}
      </div>

      {/* Load More */}
      <div className="text-center mt-4">
        <button
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:scale-105 transition"
        >
          {loading ? "Loading..." : "Load More"}
        </button>
      </div>
    </div>
  );
};

export default ReviewList;