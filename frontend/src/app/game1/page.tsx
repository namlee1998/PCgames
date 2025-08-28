"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Game1() {
  const [para, setPara] = useState("");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    // Giả sử backend có endpoint /api/game1
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/game1"); // thay bằng API thật
        const data = await res.json();

        setPara(data.paragraph);
        setQuestion(data.question);
        setOptions(data.options); // ["A", "B", "C", ...]
      } catch (err) {
        console.error("Lỗi fetch:", err);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!selected) {
      alert("Hãy chọn đáp án!");
      return;
    }

    // gửi kết quả về backend để check đúng/sai
    try {
      const res = await fetch("http://localhost:8000/api/game1/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: selected }),
      });
      const result = await res.json();
      alert(result.message); // ví dụ: "Correct!" hoặc "Wrong!"
    } catch (err) {
      console.error("Lỗi submit:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-pink-200 rounded-xl shadow-lg w-full max-w-xl overflow-hidden">
        {/* Ảnh */}
        <div className="relative w-full h-64">
          <Image
            src="/images/read.jpeg"
            alt="Reading Game"
            fill
            className="object-cover"
          />
        </div>

        {/* Nội dung */}
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold">Reading</h1>
          <p className="mt-4">
            The paragraph here
          </p>
          <p className="mt-4 font-medium">Question</p>

          <div className="mt-4 space-y-2">
            {["A", "B", "C"].map((opt) => (
              <label key={opt} className="block">
                <input
                  type="radio"
                  name="answer"
                  value={opt}
                  onChange={(e) => setSelected(e.target.value)}
                  className="mr-2"
                />
                {opt}
              </label>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            className="bg-red-500 text-white px-6 py-2 rounded-full mt-6 hover:bg-red-600"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

