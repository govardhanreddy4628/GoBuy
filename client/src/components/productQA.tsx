import React, { useState } from "react";

interface QA {
  id: number;
  question: string;
  answer?: string;
}

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

const ProductQA: React.FC = () => {
  const [qas, setQAs] = useState<QA[]>(initialQAs);
  const [newQuestion, setNewQuestion] = useState("");

  const handleAddQuestion = () => {
    if (newQuestion.trim() === "") return;

    const newQA: QA = {
      id: qas.length + 1,
      question: newQuestion,
      answer: undefined,
    };

    setQAs([newQA, ...qas]);
    setNewQuestion("");
  };

  return (
    <div className="p-6 max-w-4xl bg-gray-50 dark:bg-gray-900 rounded-lg transition-colors !ml-auto">
      
      {/* Title */}
      <h2 className="text-xl font-semibold mb-4 border-l-4 border-blue-500 pl-3 text-gray-900 dark:text-gray-100">
        Questions & Answers
      </h2>

      {/* Q&A List */}
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        {qas.map((qa) => (
          <div
            key={qa.id}
            className="p-4 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition"
          >
            {/* Question */}
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              {qa.question}
            </div>

            {/* Answer */}
            {qa.answer ? (
              <div className="mt-3 bg-gray-100 dark:bg-gray-700 p-3 rounded-md max-w-full break-words">
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  Answer:{" "}
                </span>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {qa.answer}
                </span>
              </div>
            ) : (
              <div className="text-gray-400 dark:text-gray-500 mt-2 italic">
                No answer yet.
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Ask Question */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <textarea
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Ask a question about this product..."
          className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={3}
        />

        <div className="flex justify-end mt-3">
          <button
            onClick={handleAddQuestion}
            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-md transition shadow"
          >
            Submit Question
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductQA;