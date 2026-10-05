"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CommentActions({ commentId }: { commentId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  async function handleDelete() {
    const confirmed = confirm("Tem certeza que deseja deletar este comentário?");
    if (!confirmed) return;

    setDeleting(true);

    const res = await fetch(`/api/comments/${commentId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.refresh();
    } else {
      alert("Erro ao deletar comentário.");
      setDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="cursor-pointer text-xs uppercase tracking-wider text-[#8c8c8c] transition-colors hover:text-[#c41e2e] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {deleting ? "Deletando..." : "Deletar"}
    </button>
  );
}