"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function PostActions({ postId }: { postId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  async function handleDelete() {
    const confirmed = confirm("Tem certeza que deseja deletar este post?");
    if (!confirmed) return;

    setDeleting(true);

    const res = await fetch(`/api/posts/${postId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.push("/");
    } else {
      alert("Erro ao deletar post.");
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href={`/posts/${postId}/edit`}
        className="border border-[#333333] px-4 py-2 text-sm uppercase tracking-wider text-[#e4e1dc] transition-colors hover:border-[#c41e2e] hover:text-[#c41e2e]"
      >
        Editar
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="cursor-pointer border border-[#c41e2e] px-4 py-2 text-sm uppercase tracking-wider text-[#c41e2e] transition-colors hover:bg-[#c41e2e] hover:text-[#e4e1dc] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {deleting ? "Deletando..." : "Deletar"}
      </button>
    </div>
  );
}