import Link from "next/link";
import { PrismaClient } from "./generated/prisma/client";
import Image from "next/image";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

export default async function Home() {
  const session = await auth();
  const isAdmin = session?.user.role === "ADMIN";

  const posts = await prisma.post.findMany({
    where: isAdmin ? {} : { published: true },
    orderBy: { createdAt: "desc" },
    include: { author: true },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="font-display text-3xl tracking-wide">Resenhas</h1>
        {isAdmin && (
          <Link
            href="/posts/new"
            className="bg-accent px-4 py-2 text-sm font-medium text-background hover:opacity-90 transition-opacity"
          >
            + Nova postagem
          </Link>
        )}
      </div>

      {posts.length === 0 && (
        <p className="text-muted">Nenhuma postagem ainda.</p>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.id} href={`/posts/${post.id}`} className="group">
            <article className="border border-border bg-surface transition-colors group-hover:border-accent">
              <div className="relative aspect-square w-full overflow-hidden border-b border-border">
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
                {!post.published && (
                  <span className="absolute left-2 top-2 border border-accent bg-background px-2 py-0.5 text-xs text-accent">
                    Rascunho
                  </span>
                )}
              </div>
              <div className="p-4">
                <h2 className="font-display text-lg leading-tight tracking-wide">
                  {post.title}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {post.artist} ({post.year})
                </p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted">{post.genre}</span>
                  <span className="border border-accent px-2 py-0.5 text-accent">
                    {post.rating}/10
                  </span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}