"use client";

import { useState } from "react";
import { apiRequest } from "../../lib/api";
import { useRouter } from "next/navigation";
import { Mail, Lock, Info } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const { ok, data } = await apiRequest(
      "POST",
      "/api/auth/login",
      form
    );

    if (!ok) {
      setError(data?.error || "Login failed");
      return;
    }

    // ✅ Cookie is already set by backend
    localStorage.setItem("login_success", "true");
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-700 via-pink-600 to-purple-900">
      <div className="w-full max-w-md min-h-[640px] rounded-3xl px-8 py-12 shadow-2xl bg-pink-500/80 backdrop-blur-md flex flex-col justify-center">

        <h1 className="text-4xl font-small text-center mb-12 text-white">
          Sweet Shop Login
        </h1>

        {error && (
          <p className="text-red-200 text-sm mb-6 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} className="space-y-7">

          <div className="relative transform transition-all duration-300 hover:-translate-y-1 focus-within:-translate-y-1">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80" size={22} />
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-xl pl-12 pr-4 py-4 bg-white/20 text-white text-lg placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-white/60"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="relative transform transition-all duration-300 hover:-translate-y-1 focus-within:-translate-y-1">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80" size={22} />
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full rounded-xl pl-12 pr-4 py-4 bg-white/20 text-white text-lg placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-white/60"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <div className="rounded-xl bg-white/20 backdrop-blur-md border border-white/30 p-4 text-white/90">
            <div className="flex items-center gap-2 mb-2">
              <Info size={18} className="text-white/80" />
              <p className="font-medium">Admin Access Note</p>
            </div>

            <p className="text-lg mb-2">
              To access the Admin Panel, please use the following credentials
            </p>

            <div className="rounded-lg bg-white/30 px-3 py-2 font-mono text-lg mb-2">
              <p>Email: <span className="font-semibold">john@test.com</span></p>
              <p>Password: <span className="font-semibold">password123</span></p>
            </div>

            <p className="text-lg">
              To use the application as a regular user, please register using the option below
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-xl font-medium text-lg text-white bg-gradient-to-r from-pink-600 to-purple-700 hover:-translate-y-2 hover:shadow-xl transition cursor-pointer"
          >
            Login
          </button>
        </form>

        <p className="mt-8 text-center text-base text-white/80">
          Don’t have an account?{" "}
          <span
            onClick={() => router.push("/register")}
            className="font-medium text-white cursor-pointer underline"
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}
