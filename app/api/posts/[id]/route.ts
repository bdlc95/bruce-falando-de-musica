import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
  });

  if (!post) {
    return NextResponse.json({ error: "Post não encontrado." }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Apenas administradores podem editar posts." },
      { status: 403 }
    );
  }

  try {
    const { title, artist, year, genre, rating, review, trivia, coverImageUrl, youtubeUrl, published } =
      await request.json();

    const post = await prisma.post.update({
      where: { id },
      data: {
        title,
        artist,
        year: Number(year),
        genre,
        rating: Number(rating),
        review,
        trivia: trivia || null,
        coverImageUrl: coverImageUrl || null,
        youtubeUrl: youtubeUrl || null,
        published: published ?? false,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao editar post." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Apenas administradores podem deletar posts." },
      { status: 403 }
    );
  }

  try {
    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao deletar post." },
      { status: 500 }
    );
  }
}