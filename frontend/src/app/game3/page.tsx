"use client";
import { useState } from "react";

export default function Game3() {
  const [selected, setSelected] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [questionId, setQuestionId] = useState<string>("");

  // Lấy audio + lựa chọn từ backend
  const playAudio = async () => {
    const res = await fetch("/api/listen");
    const data = await res.json();

    // data: { audioBase64: string, options: ["A","B","C"], questionId: "q1" }
    const audioBlob = await fetch(`data:audio/wav;base64,${data.audioBase64}`).then(r => r.blob());
    const url = URL.createObjectURL(audioBlob);
    const audio = new Audio(url);
    audio.play();

    // set lựa chọn và id
    setOptions(data.options);
    setQuestionId(data.questionId);
  };

  // Gửi kết quả user chọn
  const handleSubmit = async () => {
    if (!selected) {
      alert("Bạn phải chọn 1 đáp án!");
      return;
    }
    const res = await fetch("/api/submitListening", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, answer: selected }),
    });
    const result = await res.json();
    alert(`Kết quả: ${result.correct ? "Đúng ✅" : "Sai ❌"}`);
  };

  return (
    <div className="min-h-screen bg-yellow-200 text-center p-6">
      <h1 className="text-2xl font-bold">Listening</h1>
      <p className="mt-4">Listen carefully to the sentence:</p>

      <button
        onClick={playAudio}
        className="bg-red-500 text-white px-6 py-2 rounded-full mt-2"
      >
        Listen
      </button>

      {options.length > 0 && (
        <div className="mt-6">
          <p>Choose your answer:</p>
          {options.map((opt) => (
            <div key={opt}>
              <label>
                <input
                  type="radio"
                  name="answer"
                  value={opt}
                  onChange={(e) => setSelected(e.target.value)}
                />{" "}
                {opt}
              </label>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="bg-red-500 text-white px-6 py-2 rounded-full mt-6"
      >
        Submit
      </button>
    </div>
  );
}
