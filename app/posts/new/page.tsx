"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const labelClass =
  "text-xs uppercase tracking-wider text-[#8c8c8c]";
const inputClass =
  "w-full border border-[#333333] bg-[#1c1c1c] px-4 py-3 text-[#e4e1dc] placeholder:text-[#8c8c8c] transition-colors focus:border-[#c41e2e] focus:outline-none";
const fieldClass = "flex flex-col gap-2";

export default function NewPostPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [year, setYear] = useState("");
  const [genre, setGenre] = useState("");
  const [rating, setRating] = useState("");
  const [review, setReview] = useState("");
  const [trivia, setTrivia] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [published, setPublished] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (status === "loading") {
    return (
      <p className="mx-auto max-w-2xl px-4 py-10 text-sm text-[#8c8c8c]">
        Carregando...
      </p>
    );
  }

  if (!session || session.user.role !== "ADMIN") {
    return (
      <p className="mx-auto max-w-2xl px-4 py-10 text-sm text-[#8c8c8c]">
        Você não tem permissão para acessar esta página.
      </p>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    let coverImageUrl = "";

    if (coverFile) {
      const formData = new FormData();
      formData.append("file", coverFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        setError(uploadData.error || "Erro ao enviar imagem.");
        setLoading(false);
        return;
      }

      coverImageUrl = uploadData.url;
    }

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        artist,
        year,
        genre,
        rating,
        review,
        trivia,
        coverImageUrl,
        youtubeUrl,
        published,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Erro ao criar post.");
      setLoading(false);
      return;
    }

    router.push(`/posts/${data.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-8 border-b border-[#333333] pb-4 text-3xl uppercase tracking-wider text-[#e4e1dc]">
        Nova postagem
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className={fieldClass}>
          <label className={labelClass}>Título do álbum</label>
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className={fieldClass}>
          <label className={labelClass}>Artista/Banda</label>
          <input
            className={inputClass}
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className={fieldClass}>
            <label className={labelClass}>Ano</label>
            <input
              className={inputClass}
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
            />
          </div>
          <div className={fieldClass}>
            <label className={labelClass}>Gênero</label>
            <input
              className={inputClass}
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              required
            />
          </div>
          <div className={fieldClass}>
            <label className={labelClass}>Nota (0 a 10)</label>
            <input
              className={inputClass}
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              required
            />
          </div>
        </div>

        <div className={fieldClass}>
          <label className={labelClass}>Resenha</label>
          <textarea
            className={`${inputClass} resize-y`}
            rows={8}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            required
          />
        </div>
        <div className={fieldClass}>
          <label className={labelClass}>Curiosidades (opcional)</label>
          <textarea
            className={`${inputClass} resize-y`}
            rows={4}
            value={trivia}
            onChange={(e) => setTrivia(e.target.value)}
          />
        </div>
        <div className={fieldClass}>
          <label className={labelClass}>Capa do álbum (opcional)</label>
          <input
            className="w-full border border-[#333333] bg-[#1c1c1c] text-sm text-[#8c8c8c] file:mr-4 file:cursor-pointer file:border-0 file:bg-[#c41e2e] file:px-4 file:py-3 file:text-xs file:uppercase file:tracking-wider file:text-[#e4e1dc] hover:file:bg-[#a31824]"
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
          />
        </div>
        <div className={fieldClass}>
          <label className={labelClass}>Link do YouTube (opcional)</label>
          <input
            className={inputClass}
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
          />
        </div>
        <div>
          <label className="flex cursor-pointer items-center gap-3 text-sm text-[#e4e1dc]">
            <input
              type="checkbox"
              className="h-4 w-4 cursor-pointer accent-[#c41e2e]"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            Publicar imediatamente (visível para todos os usuários)
          </label>
        </div>
        {error && <p className="text-sm text-[#c41e2e]">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer self-start bg-[#c41e2e] px-6 py-3 text-sm uppercase tracking-wider text-[#e4e1dc] transition-colors hover:bg-[#a31824] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Publicando..." : "Publicar"}
        </button>
      </form>
    </div>
  );
}