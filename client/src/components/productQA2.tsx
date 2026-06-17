import React, { useEffect, useState } from "react";
import { GET, POST } from "../api/api_utility";

interface QA {
  _id: string;
  question: string;
  answer?: string;
  helpfulCount: number;
  askedBy?: { name: string };
  answeredBy?: { name: string };
}

const ProductQA: React.FC<{ productId: string }> = ({ productId }) => {
  const [qas, setQAs] = useState<QA[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [hasMore, setHasMore] = useState(true);

  // ✅ FETCH
  const fetchQAs = async (reset = false) => {
    const res = await GET(`/api/v1/product-qa?productId=${productId}&page=${reset ? 1 : page}&search=${search}`);

    if (res.success) {
      if (reset) {
        setQAs(res.data);
      } else {
        setQAs((prev) => [...prev, ...res.data]);
      }

      setHasMore(qas.length + res.data.length < res.total);
    }
  };

  useEffect(() => {
    if (productId) {
      setPage(1);
      fetchQAs(true);
    }
  }, [productId, search]);

  useEffect(() => {
    if (page > 1) fetchQAs();
  }, [page]);

  // ✅ ASK
  const handleAsk = async () => {
    if (!newQuestion.trim()) return;

    const data = await POST(`/api/v1/product-qa/ask`,{ productId, question: newQuestion });
    if (data.success) {
      setQAs((prev) => [data.data, ...prev]);
      setNewQuestion("");
    }
  };

  // ✅ HELPFUL
  const handleHelpful = async (qaId: string) => {
    const data = await POST( `/api/v1/product-qa/helpful`,{ qaId });

    if (data.success) {
      setQAs((prev) =>
        prev.map((q) => (q._id === qaId ? data.data : q))
      );
    }
  };

  return (
    <div className="p-6 bg-gray-50 max-w-5xl">
      <h2 className="text-xl font-semibold mb-4">Questions & Answers</h2>

      {/* 🔍 SEARCH */}
      <input
        placeholder="Search questions..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border mb-4 rounded"
      />

      {/* LIST */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {qas.map((qa) => (
          <div key={qa._id} className="bg-white p-4 border rounded">
            <div className="font-semibold">
              Q: {qa.question}
            </div>

            <div className="text-xs text-gray-500">
              {qa.askedBy?.name || "User"}
            </div>

            {qa.answer ? (
              <>
                <div className="mt-2 bg-gray-100 p-2 rounded">
                  A: {qa.answer}
                </div>

                <div className="text-xs text-gray-500">
                  by {qa.answeredBy?.name || "Seller"}
                </div>

                <button
                  onClick={() => handleHelpful(qa._id)}
                  className="text-sm text-blue-600 mt-2"
                >
                  👍 Helpful ({qa.helpfulCount})
                </button>
              </>
            ) : (
              <div className="text-gray-400 mt-2">
                No answer yet
              </div>
            )}
          </div>
        ))}
      </div>

      {/* LOAD MORE */}
      {hasMore && (
        <button
          onClick={() => setPage((p) => p + 1)}
          className="mt-4 bg-gray-200 px-4 py-2 rounded"
        >
          Load More
        </button>
      )}

      {/* ASK */}
      <div className="mt-6">
        <textarea
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Ask your question..."
          className="w-full p-2 border rounded mb-2"
        />

        <button
          onClick={handleAsk}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Ask Question
        </button>
      </div>
    </div>
  );
};

export default ProductQA;








const initialQAs: QA[] = [
  {
    id: 1,
    question: "Does this product come in red color?",
    answer:
      "Yes, it is available in red color and other colors as well for variety.",
  },
  {
    id: 2,
    question: "Is there a warranty?",
    answer: "Yes, 1-year warranty is provided covering manufacturing defects.",
  },
  {
    id: 3,
    question: "What is the delivery time?",
    answer: "Delivery usually takes 5-7 business days depending on your location.",
  },
  {
    id: 4,
    question: "Is cash on delivery available?",
    answer: "Yes, cash on delivery is available in selected locations.",
  },
  {
    id: 5,
    question: "Does this product require assembly?",
    answer: "",
  },
];