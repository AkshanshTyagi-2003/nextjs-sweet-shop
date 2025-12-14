"use client";

import { useState } from "react";
import { apiRequest } from "../../lib/api";
import { saveToken } from "../../lib/auth";
import { useRouter } from "next/navigation";
import { User, Mail, Lock } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const { ok, data } = await apiRequest(
      "POST",
      "/api/auth/register",
      form
    );

    if (!ok) {
      setError(data?.error || "Registration failed");
      return;
    }

    saveToken(data.token);
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-700 via-pink-600 to-purple-900">
      <div className="w-full max-w-md min-h-[680px] rounded-3xl px-8 py-12 shadow-2xl bg-pink-500/80 backdrop-blur-md flex flex-col justify-center">

        <h1 className="text-3xl font-medium text-center mb-14 text-white">
          Sweet Shop Register
        </h1>

        {error && (
          <p className="text-red-200 text-sm mb-6 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleRegister} className="space-y-7">

          {/* Name */}
          <div className="relative transform transition-all duration-300 hover:-translate-y-1 focus-within:-translate-y-1">
            <User
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80"
              size={22}
            />
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full rounded-xl pl-12 pr-4 py-4 bg-white/20 
                         text-white text-lg placeholder-white/80
                         focus:outline-none focus:ring-2 focus:ring-white/60"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              required
            />
          </div>

          {/* Email */}
          <div className="relative transform transition-all duration-300 hover:-translate-y-1 focus-within:-translate-y-1">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80"
              size={22}
            />
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-xl pl-12 pr-4 py-4 bg-white/20 
                         text-white text-lg placeholder-white/80
                         focus:outline-none focus:ring-2 focus:ring-white/60"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
            />
          </div>

          {/* Password */}
          <div className="relative transform transition-all duration-300 hover:-translate-y-1 focus-within:-translate-y-1">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80"
              size={22}
            />
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full rounded-xl pl-12 pr-4 py-4 bg-white/20 
                         text-white text-lg placeholder-white/80
                         focus:outline-none focus:ring-2 focus:ring-white/60"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              required
            />
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="w-full py-4 rounded-xl font-medium text-lg text-white 
                       bg-gradient-to-r from-pink-600 to-purple-700 
                       transform transition-all duration-300 
                       hover:-translate-y-2 hover:shadow-xl 
                       active:translate-y-0 cursor-pointer"
          >
            Register
          </button>
        </form>

        <p className="mt-8 text-center text-base text-white/80">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/login")}
            className="font-medium text-white cursor-pointer underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
