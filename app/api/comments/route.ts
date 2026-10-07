import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { error: "Você precisa estar logado para comentar." },
      { status: 401 }
    );
  }

  try {
    const { content, postId } = await request.json();

    if (!content || !postId) {
      return NextResponse.json(
        { error: "Comentário não pode estar vazio." },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: session.user.id,
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao criar comentário." },
      { status: 500 }
    );
  }
}