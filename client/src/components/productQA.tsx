import React, { useEffect, useState } from "react";
import { GET, POST } from "../api/api_utility";
import Pagination from "@mui/material/Pagination";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

interface QA {
  _id: string;
  question: string;
  answer?: string;
  helpfulCount: number;
  askedBy?: { name: string };
  answeredBy?: { name: string };
}

interface Props {
  productId: string;
}

const LIMIT = 5;

const ProductQA: React.FC<Props> = ({ productId }) => {
  const [qas, setQAs] = useState<QA[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const totalPages = Math.ceil(total / LIMIT);

  // ✅ FETCH QAs
  const fetchQAs = async () => {
    try {
      const response = await GET(
        `/api/v1/product-qa?productId=${productId}&page=${page}&limit=${LIMIT}&search=${search}`
      );

      if (response?.data?.success) {
        setQAs(response.data.data || []);
        setTotal(response.data.total || 0);
      }
    } catch (err) {
      console.error("Fetch QAs Error:", err);
    }
  };

  // ✅ FETCH ON CHANGE
  useEffect(() => {
    if (productId) fetchQAs();
  }, [productId, page, search]);

  // ✅ ASK QUESTION
  const handleAsk = async () => {
    if (!newQuestion.trim()) return;

    try {
      const response = await POST(`/api/v1/product-qa/ask`, {
        productId,
        question: newQuestion,
      });

      if (response?.data?.success) {
        setQAs((prev) => [response.data.data, ...prev]);
        setNewQuestion("");
      }
    } catch (err) {
      console.error("Ask Question Error:", err);
    }
  };

  // ✅ MARK HELPFUL
  const handleHelpful = async (qaId: string) => {
    try {
      const response = await POST(`/api/v1/product-qa/helpful`, { qaId });

      if (response?.data?.success) {
        setQAs((prev) =>
          prev.map((q) => (q._id === qaId ? response.data.data : q))
        );
      }
    } catch (err) {
      console.error("Helpful Error:", err);
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg transition-colors w-full">
      
      {/* HEADER (ALWAYS VISIBLE) */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold border-l-4 border-blue-500 pl-3 text-gray-900 dark:text-gray-100">
            Questions & Answers
          </h2>

          {qas.length > 0 ? (
            <p className="text-gray-500 ml-5">
              Find answers to commonly asked questions
            </p>
          ) : (
            <p className="text-gray-500 ml-5">
              No questions and answers available
            </p>
          )}
        </div>

        {/* TOGGLE */}
        <div
          className="bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center p-2 cursor-pointer"
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <FaChevronUp /> : <FaChevronDown />}
        </div>
      </div>

      {/* 🔽 COLLAPSIBLE CONTENT */}
      {open && (
        <>
          {/* Q&A LIST */}
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2 mt-4">
            {qas.length > 0 ? (
              qas.map((qa) => (
                <div
                  key={qa._id}
                  className="p-4 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition"
                >
                  {/* Question */}
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {qa.question}
                  </div>

                  {/* Asked By */}
                  {qa.askedBy?.name && (
                    <div className="text-xs text-gray-500 mt-1">
                      Asked by: {qa.askedBy.name}
                    </div>
                  )}

                  {/* Answer */}
                  {qa.answer ? (
                    <div className="mt-3 bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
                      <span className="font-semibold">Answer: </span>
                      <span className="text-sm">{qa.answer}</span>

                      {qa.answeredBy?.name && (
                        <div className="text-xs text-gray-500 mt-1">
                          Answered by: {qa.answeredBy.name}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-400 mt-2 italic">
                      No answer yet.
                    </div>
                  )}

                  {/* Helpful */}
                  <button
                    onClick={() => handleHelpful(qa._id)}
                    className="mt-3 text-sm text-blue-500 hover:underline"
                  >
                    👍 Helpful ({qa.helpfulCount})
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">
                No Q&A available
              </p>
            )}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center mb-4">
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </div>
          )}

          {/* ASK QUESTION */}
          <div className="mt-6">
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Ask your question..."
              className="w-full p-2 border rounded mb-2 dark:bg-gray-800 dark:text-white"
            />

            <button
              onClick={handleAsk}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Ask Question
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductQA;