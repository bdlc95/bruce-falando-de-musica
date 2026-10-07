import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Apenas administradores podem criar posts." },
      { status: 403 }
    );
  }

  try {
    const { title, artist, year, genre, rating, review, trivia, coverImageUrl, youtubeUrl, published } =
      await request.json();

    if (!title || !artist || !year || !genre || !rating || !review) {
      return NextResponse.json(
        { error: "Preencha todos os campos obrigatórios." },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
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
        authorId: session.user.id,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao criar post." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await auth();
  const isAdmin = session?.user.role === "ADMIN";

  const posts = await prisma.post.findMany({
    where: isAdmin ? {} : { published: true },
    orderBy: { createdAt: "desc" },
    include: { author: true },
  });

  return NextResponse.json(posts);
}