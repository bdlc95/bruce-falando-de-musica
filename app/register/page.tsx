"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    const res = await fetch("/api/register", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Erro ao cadastrar.");
      setLoading(false);
      return;
    }

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- reload completo necessário para a Navbar reler a sessão com a foto de perfil recém-adicionada
    window.location.href = "/";
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="mb-8 text-2xl">Criar conta</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-muted">Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border border-border bg-surface px-3 py-2 text-foreground outline-none focus:border-accent"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-muted">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-border bg-surface px-3 py-2 text-foreground outline-none focus:border-accent"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-muted">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="border border-border bg-surface px-3 py-2 text-foreground outline-none focus:border-accent"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-muted">Foto de perfil (opcional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
            className="text-sm text-muted file:mr-3 file:border file:border-border file:bg-surface file:px-3 file:py-1.5 file:text-foreground file:hover:border-accent"
          />
        </div>
        {error && <p className="text-sm text-accent">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-accent px-4 py-2 font-medium text-background hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Criando..." : "Cadastrar"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Já tem conta?{" "}
        <Link href="/login" className="text-accent hover:opacity-80 transition-opacity">
          Entrar
        </Link>
      </p>
    </div>
  );
}