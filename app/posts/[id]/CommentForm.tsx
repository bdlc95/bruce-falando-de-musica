"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function CommentForm({ postId }: { postId: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (status === "loading") {
    return null;
  }

  if (!session) {
    return (
      <p className="border border-[#333333] bg-[#1c1c1c] px-4 py-3 text-sm text-[#8c8c8c]">
        Faça login para comentar.
      </p>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, postId }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Erro ao comentar.");
      setLoading(false);
      return;
    }

    setContent("");
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escreva um comentário..."
        required
        rows={4}
        className="w-full resize-y border border-[#333333] bg-[#1c1c1c] px-4 py-3 text-[#e4e1dc] placeholder:text-[#8c8c8c] transition-colors focus:border-[#c41e2e] focus:outline-none"
      />
      {error && <p className="text-sm text-[#c41e2e]">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="cursor-pointer self-start bg-[#c41e2e] px-5 py-2 text-sm uppercase tracking-wider text-[#e4e1dc] transition-colors hover:bg-[#a31824] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Enviando..." : "Comentar"}
      </button>
    </form>
  );
}