import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { error: "Você precisa estar logado." },
      { status: 401 }
    );
  }

  const [postReactions, comments] = await Promise.all([
    prisma.postReaction.findMany({
      where: { userId: session.user.id },
      include: { post: true },
      orderBy: { id: "desc" },
    }),
    prisma.comment.findMany({
      where: { authorId: session.user.id },
      include: { post: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({ postReactions, comments });
}