"use client";

import { useEffect, useRef, useState } from "react";
import { Moon, Sun, User, LogOut } from "lucide-react";
import { apiRequest } from "../lib/api";
import { useRouter } from "next/navigation";

type UserType = {
  name: string;
  email: string;
  role: string;
};

export default function Navbar({ search, setSearch }: any) {
  const [dark, setDark] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function fetchUser() {
      const { ok, data } = await apiRequest("GET", "/api/me");
      if (!mounted) return;

      if (ok && data) {
        setUser({
          name: data.name,
          email: data.email,
          role: String(data.role).toUpperCase(),
        });
      } else {
        setUser(null);
      }

      setLoading(false);
    }

    fetchUser();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setOpenProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDarkMode = () => {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDark(false);
    } else {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDark(true);
    }
  };

  return (
    <div className="w-full px-6 py-4 shadow flex justify-between items-center bg-gradient-to-r from-pink-700 via-pink-600 to-purple-900 relative z-20">
      <h1 className="text-4xl font-medium text-white font-serif">
        Dashboard
      </h1>

      <div className="flex items-center gap-4 relative">
        <input
          type="text"
          placeholder="Search sweets..."
          className="px-5 py-2.5 w-72 rounded-2xl bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/60"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          onClick={toggleDarkMode}
          className="w-11 h-11 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition cursor-pointer"
        >
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div ref={profileRef} className="relative">
          <button
            onClick={() => setOpenProfile((p) => !p)}
            className="w-11 h-11 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition cursor-pointer"
          >
            <User size={20} />
          </button>

          {openProfile && (
            <div className="absolute right-0 mt-4 w-72 bg-white/20 backdrop-blur-md rounded-2xl shadow-xl px-6 py-6 z-[999]">
              <div
                className="
                  absolute -top-2 right-6
                  w-0 h-0
                  border-l-[8px] border-l-transparent
                  border-r-[8px] border-r-transparent
                  border-b-[8px] border-b-white/20
                "
              />

              {loading ? (
                <p className="text-white text-center">Loading...</p>
              ) : user ? (
                <div className="flex flex-col items-center text-center text-white space-y-3">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                    <User size={32} />
                  </div>

                  <button
                    onClick={() => {
                      setOpenProfile(false);
                      router.push("/profile");
                    }}
                    className="
                      w-full py-2 rounded-xl
                      bg-white/10
                      hover:bg-white/20
                      transition cursor-pointer
                      text-white text-base font-medium
                    "
                  >
                    View Profile
                  </button>

                  <p className="text-lg font-medium">{user.name}</p>
                  <p className="text-lg">{user.email}</p>
                  <p className="text-lg tracking-widest">{user.role}</p>

                  <div className="w-full pt-4">
                    <button
                      onClick={() => {
                        document.cookie = "token=; Max-Age=0; path=/;";
                        localStorage.removeItem("token");
                        window.location.href = "/login";
                      }}
                      className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-500 text-lg font-medium transition cursor-pointer"
                    >
                      <LogOut size={25} />
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-white text-center">Not logged in</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
