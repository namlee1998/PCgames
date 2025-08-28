import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const games = [
    { id: 1, name: "Reading" },
    { id: 2, name: "Speaking"},
    { id: 3, name: "Listening" },
    { id: 4, name: "Writing"},
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-10">
      <h1 className="text-4xl font-bold mb-10">PC Minigames</h1>
	  <Image
        src="/images/bamboobook.jpeg"
        alt=" Screenshot"
        width={800}
        height={600}
        className="rounded-xl shadow-lg"
      />
      <div className="grid grid-cols-2 gap-6">
        {games.map((g) => (
          <Link key={g.id} href={`/game${g.id}`}>
            <div className="cursor-pointer hover:scale-105 transition">
              <p className="mt-2 text-center font-semibold">{g.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
