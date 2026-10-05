import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import { PrismaClient } from "../../generated/prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { error: "Você precisa estar logado." },
      { status: 401 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json(
      { error: "Nenhum arquivo enviado." },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "bruce-falando-de-musica/avatars" }, (error, result) => {
        if (error || !result) {
          reject(error);
          return;
        }
        resolve(result as { secure_url: string });
      })
      .end(buffer);
  });

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { image: result.secure_url },
  });

  return NextResponse.json({ url: user.image });
}