"use client";
import { useState, useEffect } from "react";

export default function Game4() {
  const [text, setText] = useState("");
  const [question, setQuestion] = useState("");
  const [questionId, setQuestionId] = useState("");
  const [score, setScore] = useState<number | null>(null);

  // Lấy câu hỏi từ backend khi load trang
  useEffect(() => {
    const fetchQuestion = async () => {
      const res = await fetch("/api/writing");
      const data = await res.json();
      // Backend trả về: { questionId: "q1", question: "Write about your favorite hobby" }
      setQuestion(data.question);
      setQuestionId(data.questionId);
    };
    fetchQuestion();
  }, []);

  // Submit câu trả lời để chấm điểm
  const handleSubmit = async () => {
    if (!text.trim()) {
      alert("Bạn cần viết câu trả lời trước!");
      return;
    }

    const res = await fetch("/api/submitWriting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, answer: text }),
    });

    const data = await res.json();
    // Backend trả về: { score: 8 }
    setScore(data.score);
  };

  return (
    <div className="min-h-screen bg-purple-200 text-center p-6">
      <h1 className="text-2xl font-bold">Writing</h1>
      
      {/* Hiển thị câu hỏi backend gửi về */}
      <p className="mt-4">Question: {question || "Loading..."}</p>

      <textarea
        className="w-full h-40 mt-4 p-2 border rounded"
        placeholder="User paragraph..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        className="bg-red-500 text-white px-6 py-2 rounded-full mt-6"
      >
        Submit
      </button>

      {score !== null && (
        <p className="mt-4 text-lg font-semibold">Your score: {score}/10</p>
      )}
    </div>
  );
}
