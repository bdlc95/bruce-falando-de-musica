"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-display text-xl tracking-wide text-accent hover:opacity-80 transition-opacity"
        >
          BRUCE FALANDO DE MÚSICA
        </Link>

        <div className="flex items-center gap-3 text-sm">
          {session?.user.role === "ADMIN" && (
            <Link
              href="/posts/new"
              className="bg-accent px-4 py-2 font-medium text-background hover:opacity-90 transition-opacity"
            >
              + Nova postagem
            </Link>
          )}

          {status === "loading" && null}

          {status === "unauthenticated" && (
            <Link
              href="/login"
              className="border border-accent px-4 py-2 text-accent hover:bg-accent hover:text-background transition-colors"
            >
              Login
            </Link>
          )}

          {status === "authenticated" && (
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="flex items-center gap-2 text-muted hover:text-foreground transition-colors"
              >
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name ?? "Foto de perfil"}
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-border text-xs font-medium text-foreground">
                    {session.user.name?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                )}
                <span>Olá, {session.user.name}</span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="border border-accent px-4 py-2 text-accent hover:bg-accent hover:text-background transition-colors"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}