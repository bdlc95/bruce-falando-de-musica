import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "../../../../generated/prisma/client";

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

  if (type !== "LIKE" && type !== "DISLIKE" && type !== "REMOVE") {
    return NextResponse.json(
      { error: "Tipo de reação inválido." },
      { status: 400 }
    );
  }

  const existing = await prisma.postReaction.findUnique({
    where: {
      userId_postId: {
        userId: session.user.id,
        postId: id,
      },
    },
  });

  if (type === "REMOVE") {
    if (existing) {
      await prisma.postReaction.delete({ where: { id: existing.id } });
    }
    return NextResponse.json({ status: "removed" });
  }

  if (existing && existing.type === type) {
    await prisma.postReaction.delete({ where: { id: existing.id } });
    return NextResponse.json({ status: "removed" });
  }

  const reaction = await prisma.postReaction.upsert({
    where: {
      userId_postId: {
        userId: session.user.id,
        postId: id,
      },
    },
    update: { type },
    create: {
      type,
      userId: session.user.id,
      postId: id,
    },
  });

  return NextResponse.json(reaction);
}