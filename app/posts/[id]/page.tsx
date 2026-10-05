import { PrismaClient } from "../../generated/prisma/client";
import { notFound } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { getYoutubeVideoId } from "@/lib/youtube";
import PostActions from "./PostActions";
import CommentForm from "./CommentForm";
import CommentActions from "./CommentActions";
import PostReactions from "./PostReactions";
import CommentReactions from "./CommentReactions";

const prisma = new PrismaClient();

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const isAdmin = session?.user.role === "ADMIN";

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: true,
      reactions: true,
      comments: {
        include: { author: true, reactions: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!post) {
    notFound();
  }

  if (!post.published && !isAdmin) {
    notFound();
  }

  const youtubeVideoId = post.youtubeUrl ? getYoutubeVideoId(post.youtubeUrl) : null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {!post.published && (
        <p className="mb-4 inline-block border border-accent px-3 py-1 text-sm text-accent">
          Rascunho — visível só para você, admin
        </p>
      )}

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-[200px_1fr]">
        <div className="relative aspect-square w-full overflow-hidden border border-border">
          <Image
            src={
              post.coverImageUrl && post.coverImageUrl.startsWith("http")
                ? post.coverImageUrl
                : "/album-placeholder.png"
            }
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <h1 className="font-display text-3xl leading-tight tracking-wide">
              {post.title}
            </h1>
            <p className="mt-1 text-muted">
              {post.artist} ({post.year})
            </p>
            <div className="mt-3 flex items-center gap-3 text-sm">
              <span className="text-muted">{post.genre}</span>
              <span className="border border-accent px-2 py-0.5 text-accent">
                {post.rating}/10
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <PostReactions postId={post.id} reactions={post.reactions} />
            <PostActions postId={post.id} />
          </div>
        </div>
      </div>

      <section className="mb-8 border-t border-border pt-6">
        <h2 className="mb-2 font-display text-lg tracking-wide">Resenha</h2>
        <p className="leading-relaxed text-foreground">{post.review}</p>
      </section>

      {post.trivia && (
        <section className="mb-8 border-t border-border pt-6">
          <h2 className="mb-2 font-display text-lg tracking-wide">Curiosidades</h2>
          <p className="leading-relaxed text-foreground">{post.trivia}</p>
        </section>
      )}

      {post.youtubeUrl && (
        <section className="mb-8 border-t border-border pt-6">
          <h2 className="mb-3 font-display text-lg tracking-wide">Ouça/assista</h2>
          {youtubeVideoId ? (
            <div className="aspect-video w-full">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : (
            <a
              href={post.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:opacity-80 transition-opacity"
            >
              {post.youtubeUrl}
            </a>
          )}
        </section>
      )}

      <p className="mb-8 border-t border-border pt-6 text-sm text-muted">
        Postado por: {post.author.name}
      </p>

      <section className="border-t border-border pt-6">
        <h2 className="mb-4 font-display text-lg tracking-wide">Comentários</h2>
        <CommentForm postId={post.id} />

        {post.comments.length === 0 && (
          <p className="mt-4 text-sm text-muted">Nenhum comentário ainda.</p>
        )}

        <ul className="mt-6 flex flex-col gap-4">
          {post.comments.map((comment) => (
            <li key={comment.id} className="border border-border p-4">
              <div className="flex items-center gap-2 text-sm">
                <strong>{comment.author.name}</strong>
                <span className="text-muted">
                  {comment.createdAt.toLocaleDateString("pt-BR")}
                </span>
              </div>
              <p className="mt-2 leading-relaxed">{comment.content}</p>
              <div className="mt-3 flex items-center justify-between">
                <CommentReactions commentId={comment.id} reactions={comment.reactions} />
                <CommentActions commentId={comment.id} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}