"use client";
import Image from "next/image";
import { useState, useRef } from "react";

export default function Game2() {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      audioBlobRef.current = audioBlob;
      setAudioUrl(URL.createObjectURL(audioBlob));
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const handleSubmit = async () => {
    if (!audioBlobRef.current) {
      alert("No audio to submit!");
      return;
    }

    // Gửi audio sang backend (ví dụ FastAPI hoặc Node)
    const formData = new FormData();
    formData.append("file", audioBlobRef.current, "recording.webm");

    try {
      const res = await fetch("http://localhost:8000/api/speaking", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      alert(`Kết quả: ${result.score}`);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed!");
    }
  };

  return (
    <div className="min-h-screen bg-green-200 text-center p-6">
      <h1 className="text-2xl font-bold">Speaking</h1>
      <p className="mt-4">Question: Introduce yourself</p>

      <div className="mt-4">
        {!recording ? (
          <button
            onClick={startRecording}
            className="bg-blue-500 text-white px-6 py-2 rounded-full"
          >
            🎤 Start
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-red-500 text-white px-6 py-2 rounded-full"
          >
            ⏹ Stop
          </button>
        )}
      </div>

      {audioUrl && <audio controls src={audioUrl} className="mt-4" />}

      <button
        onClick={handleSubmit}
        className="bg-red-500 text-white px-6 py-2 rounded-full mt-6"
      >
        Submit
      </button>
    </div>
  );
}
