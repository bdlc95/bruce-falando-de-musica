"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Reaction = { type: "LIKE" | "DISLIKE"; userId: string };

export default function PostReactions({
  postId,
  reactions,
}: {
  postId: string;
  reactions: Reaction[];
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const likeCount = reactions.filter((r) => r.type === "LIKE").length;
  const dislikeCount = reactions.filter((r) => r.type === "DISLIKE").length;
  const userReaction = session
    ? reactions.find((r) => r.userId === session.user.id)?.type
    : undefined;

  async function react(type: "LIKE" | "DISLIKE") {
    if (!session || loading) return;
    setLoading(true);

    await fetch(`/api/posts/${postId}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });

    router.refresh();
    setLoading(false);
  }

  if (!session) {
    return (
      <p className="flex items-center gap-4 text-sm text-[#8c8c8c]">
        <span>👍 {likeCount}</span>
        <span>👎 {dislikeCount}</span>
      </p>
    );
  }

  const base =
    "cursor-pointer border px-4 py-2 text-sm tracking-wider transition-colors disabled:cursor-not-allowed disabled:opacity-50";
  const idle =
    "border-[#333333] text-[#e4e1dc] hover:border-[#c41e2e] hover:text-[#c41e2e]";
  const active = "border-[#c41e2e] bg-[#c41e2e] text-[#e4e1dc]";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={() => react("LIKE")}
        disabled={loading}
        className={`${base} ${userReaction === "LIKE" ? active : idle}`}
      >
        👍 {likeCount} {userReaction === "LIKE" ? "(você curtiu)" : ""}
      </button>
      <button
        onClick={() => react("DISLIKE")}
        disabled={loading}
        className={`${base} ${userReaction === "DISLIKE" ? active : idle}`}
      >
        👎 {dislikeCount} {userReaction === "DISLIKE" ? "(você descurtiu)" : ""}
      </button>
    </div>
  );
}