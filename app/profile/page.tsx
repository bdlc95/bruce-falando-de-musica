"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

type PostReaction = {
  id: string;
  type: "LIKE" | "DISLIKE";
  post: { id: string; title: string; artist: string };
};

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  post: { id: string; title: string };
};

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const [postReactions, setPostReactions] = useState<PostReaction[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;

    async function fetchProfile() {
      const res = await fetch("/api/profile");
      const data = await res.json();
      setPostReactions(data.postReactions);
      setComments(data.comments);
      setLoading(false);
    }
    fetchProfile();
  }, [status]);

  async function handleAvatarUpload() {
    if (!avatarFile) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", avatarFile);

    const res = await fetch("/api/avatar", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    await update({ image: data.url });

    setAvatarFile(null);
    setUploading(false);
  }

  async function handleRemoveReaction(postId: string) {
    await fetch(`/api/posts/${postId}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "REMOVE" }),
    });
    setPostReactions((prev) => prev.filter((r) => r.post.id !== postId));
  }

  async function handleDeleteComment(commentId: string) {
    const confirmed = confirm("Tem certeza que deseja apagar este comentário?");
    if (!confirmed) return;

    await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  if (status === "loading" || loading) {
    return <p className="px-6 py-16 text-muted">Carregando...</p>;
  }

  if (!session) {
    return <p className="px-6 py-16 text-muted">Você precisa estar logado.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="mb-8 text-2xl">Meu perfil</h1>

      <section className="mb-10 flex items-center gap-4 border-b border-border pb-8">
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name ?? "Foto de perfil"}
            width={64}
            height={64}
            className="rounded-full"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-border text-xl font-medium">
            {session.user.name?.charAt(0).toUpperCase() ?? "?"}
          </div>
        )}
        <div>
          <p className="text-lg">{session.user.name}</p>
          <p className="text-sm text-muted">{session.user.email}</p>
        </div>
      </section>

      <section className="mb-10 border-b border-border pb-8">
        <h2 className="mb-3 font-display text-lg">Trocar foto de perfil</h2>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
            className="text-sm text-muted file:mr-3 file:border file:border-border file:bg-surface file:px-3 file:py-1.5 file:text-foreground file:hover:border-accent"
          />
          <button
            onClick={handleAvatarUpload}
            disabled={!avatarFile || uploading}
            className="border border-accent px-4 py-2 text-accent hover:bg-accent hover:text-background transition-colors disabled:opacity-50"
          >
            {uploading ? "Enviando..." : "Salvar"}
          </button>
        </div>
      </section>

      <section className="mb-10 border-b border-border pb-8">
        <h2 className="mb-3 font-display text-lg">Posts que reagi</h2>
        {postReactions.length === 0 && (
          <p className="text-sm text-muted">Você ainda não reagiu a nenhum post.</p>
        )}
        <ul className="flex flex-col gap-3">
          {postReactions.map((reaction) => (
            <li key={reaction.id} className="flex items-center justify-between text-sm">
              <Link
                href={`/posts/${reaction.post.id}`}
                className="hover:text-accent transition-colors"
              >
                {reaction.type === "LIKE" ? "👍" : "👎"} {reaction.post.title} — {reaction.post.artist}
              </Link>
              <button
                onClick={() => handleRemoveReaction(reaction.post.id)}
                className="text-muted hover:text-accent transition-colors"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg">Meus comentários</h2>
        {comments.length === 0 && (
          <p className="text-sm text-muted">Você ainda não comentou em nenhum post.</p>
        )}
        <ul className="flex flex-col gap-4">
          {comments.map((comment) => (
            <li key={comment.id} className="border border-border p-3 text-sm">
              <Link
                href={`/posts/${comment.post.id}`}
                className="mb-1 block text-muted hover:text-accent transition-colors"
              >
                em: {comment.post.title}
              </Link>
              <p className="mb-2">{comment.content}</p>
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="text-accent hover:opacity-80 transition-opacity"
              >
                Apagar
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}