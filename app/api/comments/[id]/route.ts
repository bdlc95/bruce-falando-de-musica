import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "../../../generated/prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { error: "Você precisa estar logado." },
      { status: 401 }
    );
  }

  const comment = await prisma.comment.findUnique({
    where: { id },
  });

  if (!comment) {
    return NextResponse.json(
      { error: "Comentário não encontrado." },
      { status: 404 }
    );
  }

  const isAdmin = session.user.role === "ADMIN";
  const isAuthor = comment.authorId === session.user.id;

  if (!isAdmin && !isAuthor) {
    return NextResponse.json(
      { error: "Você não tem permissão para deletar este comentário." },
      { status: 403 }
    );
  }

  try {
    await prisma.comment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao deletar comentário." },
      { status: 500 }
    );
  }
}