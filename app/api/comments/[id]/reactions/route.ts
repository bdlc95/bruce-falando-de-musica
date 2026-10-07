import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { error: "Você precisa estar logado para reagir." },
      { status: 401 }
    );
  }

  const { type } = await request.json();

  if (type !== "LIKE" && type !== "DISLIKE") {
    return NextResponse.json(
      { error: "Tipo de reação inválido." },
      { status: 400 }
    );
  }

  const existing = await prisma.commentReaction.findUnique({
    where: {
      userId_commentId: {
        userId: session.user.id,
        commentId: id,
      },
    },
  });

  if (existing && existing.type === type) {
    await prisma.commentReaction.delete({ where: { id: existing.id } });
    return NextResponse.json({ status: "removed" });
  }

  const reaction = await prisma.commentReaction.upsert({
    where: {
      userId_commentId: {
        userId: session.user.id,
        commentId: id,
      },
    },
    update: { type },
    create: {
      type,
      userId: session.user.id,
      commentId: id,
    },
  });

  return NextResponse.json(reaction);
}