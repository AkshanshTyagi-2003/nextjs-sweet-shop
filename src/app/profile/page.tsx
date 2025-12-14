"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { User, Mail, Shield } from "lucide-react";
import { apiRequest } from "../../lib/api";

type UserType = {
  name: string;
  email: string;
  role: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { ok, data } = await apiRequest("GET", "/api/me");
      if (ok && data) {
        setUser({
          name: data.name,
          email: data.email,
          role: String(data.role).toUpperCase(),
        });
      }
    }
    loadUser();
  }, []);

  if (!user) return null;

  return (
    <div className="flex">
      <Sidebar isAdmin={user.role === "ADMIN"} />

      <main className="flex-1 min-h-screen bg-gradient-to-r from-pink-700 via-pink-600 to-purple-900">
        {/* TOP BAR */}
        <div
          className="
            w-full px-6 py-4 shadow
            flex items-center
            bg-gradient-to-r from-pink-700 via-pink-600 to-purple-900
          "
        >
          <h1 className="text-4xl font-medium text-white font-serif">
            My Profile
          </h1>
        </div>

        {/* CONTENT */}
        <div className="p-10">
          {/* PROFILE ICON — CENTERED */}
          <div className="flex justify-center mb-14">
            <div
              className="
                bg-white/20 backdrop-blur-md
                rounded-2xl shadow-xl
                w-[660px] h-[420px]
                flex items-center justify-center
              "
            >
              <div className="w-60 h-60 rounded-full bg-white/20 flex items-center justify-center">
                <User size={106} className="text-white" />
              </div>
            </div>
          </div>

          {/* INFO BOXES — LEFT ALIGNED, BELOW ICON */}
          <div className="flex">
            <div className="flex flex-col">
              {/* NAME */}
              <div className="mb-8">
                <div className="text-white/70 text-lg mb-2 ml-2">
                  Name
                </div>
                <div
                  className="
                    w-[420px] h-14
                    bg-white/10 backdrop-blur-md
                    rounded-xl
                    flex items-center gap-4 px-5
                  "
                >
                  <User size={22} className="text-white/80" />
                  <p className="text-white text-xl font-medium">
                    {user.name}
                  </p>
                </div>
              </div>

              {/* EMAIL */}
              <div className="mb-8">
                <div className="text-white/70 text-lg mb-2 ml-2">
                  Email
                </div>
                <div
                  className="
                    w-[420px] h-14
                    bg-white/10 backdrop-blur-md
                    rounded-xl
                    flex items-center gap-4 px-5
                  "
                >
                  <Mail size={22} className="text-white/80" />
                  <p className="text-white text-xl">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* ROLE */}
              <div>
                <div className="text-white/70 text-lg mb-2 ml-2">
                  Role
                </div>
                <div
                  className="
                    w-[420px] h-14
                    bg-white/10 backdrop-blur-md
                    rounded-xl
                    flex items-center gap-4 px-5
                  "
                >
                  <Shield size={22} className="text-white/80" />
                  <p className="text-white text-xl tracking-widest">
                    {user.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
