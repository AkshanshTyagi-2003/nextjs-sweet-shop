"use client";

import Link from "next/link";
import { useState } from "react";
import {
  LayoutDashboard,
  LogOut,
  Settings,
  User,
  Moon,
  ClipboardList,
} from "lucide-react";

export default function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const [open, setOpen] = useState(true);

  const toggleDarkMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    const html = document.documentElement;

    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  return (
    <div
      onClick={() => setOpen(!open)}
      className={`${
        open ? "w-72" : "w-24"
      } bg-gray-100 dark:bg-[#0f172a] min-h-screen px-4 py-6
         transition-[width] duration-300 ease-in-out
         flex flex-col justify-between`}
    >
      {/* TOP SECTION */}
      <div>
        {/* Logo */}
        <div className="h-32 flex flex-col mb-6 relative">
          <div className="flex justify-center items-center h-20">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-pink-700 to-purple-900 flex items-center justify-center text-white text-2xl font-semibold shadow-md">
              SS
            </div>
          </div>

          <div className="h-12 flex justify-center items-start">
            <p
              className={`text-2xl font-semibold text-gray-800 dark:text-white
                text-center whitespace-nowrap transition-opacity duration-300 ${
                  open ? "opacity-100" : "opacity-0"
                }`}
            >
              Sweet Shop
            </p>
          </div>
        </div>

        {/* NAV LINKS */}
        <ul className="space-y-2">
          {/* Dashboard */}
          <li>
            <Link
              href="/dashboard"
              onClick={(e) => e.stopPropagation()}
              className="group flex items-center px-4 py-3 rounded-lg
                         hover:bg-black dark:hover:bg-black
                         transition cursor-pointer"
            >
              <div className="w-10 flex justify-center transition-transform duration-300 group-hover:translate-x-1">
                <LayoutDashboard
                  size={30}
                  className="text-gray-800 dark:text-white group-hover:text-white"
                />
              </div>

              <span
                className={`ml-3 text-2xl font-medium text-gray-800 dark:text-white
                  group-hover:text-white
                  whitespace-nowrap transition-all duration-300 group-hover:translate-x-1 ${
                    open
                      ? "opacity-100 max-w-xs"
                      : "opacity-0 max-w-0 overflow-hidden"
                  }`}
              >
                Dashboard
              </span>
            </Link>
          </li>

          {/* Orders (NEW) */}
          <li>
            <Link
              href="/orders"
              onClick={(e) => e.stopPropagation()}
              className="group flex items-center px-4 py-3 rounded-lg
                         hover:bg-black dark:hover:bg-black
                         transition cursor-pointer"
            >
              <div className="w-10 flex justify-center transition-transform duration-300 group-hover:translate-x-1">
                <ClipboardList
                  size={30}
                  className="text-gray-800 dark:text-white group-hover:text-white"
                />
              </div>

              <span
                className={`ml-3 text-2xl font-medium text-gray-800 dark:text-white
                  group-hover:text-white
                  whitespace-nowrap transition-all duration-300 group-hover:translate-x-1 ${
                    open
                      ? "opacity-100 max-w-xs"
                      : "opacity-0 max-w-0 overflow-hidden"
                  }`}
              >
                Orders
              </span>
            </Link>
          </li>

          {/* Profile */}
          <li>
            <Link
              href="/profile"
              onClick={(e) => e.stopPropagation()}
              className="group flex items-center px-4 py-3 rounded-lg
                         hover:bg-black dark:hover:bg-black
                         transition cursor-pointer"
            >
              <div className="w-10 flex justify-center transition-transform duration-300 group-hover:translate-x-1">
                <User
                  size={30}
                  className="text-gray-800 dark:text-white group-hover:text-white"
                />
              </div>

              <span
                className={`ml-3 text-2xl font-medium text-gray-800 dark:text-white
                  group-hover:text-white
                  whitespace-nowrap transition-all duration-300 group-hover:translate-x-1 ${
                    open
                      ? "opacity-100 max-w-xs"
                      : "opacity-0 max-w-0 overflow-hidden"
                  }`}
              >
                Profile
              </span>
            </Link>
          </li>

          {/* Admin */}
          {isAdmin && (
            <li>
              <Link
                href="/admin"
                onClick={(e) => e.stopPropagation()}
                className="group flex items-center px-4 py-3 rounded-lg
                           hover:bg-black dark:hover:bg-black
                           transition cursor-pointer"
              >
                <div className="w-10 flex justify-center transition-transform duration-300 group-hover:translate-x-1">
                  <Settings
                    size={30}
                    className="text-gray-800 dark:text-white group-hover:text-white"
                  />
                </div>

                <span
                  className={`ml-3 text-2xl font-medium text-gray-800 dark:text-white
                    group-hover:text-white
                    whitespace-nowrap transition-all duration-300 group-hover:translate-x-1 ${
                      open
                        ? "opacity-100 max-w-xs"
                        : "opacity-0 max-w-0 overflow-hidden"
                    }`}
                >
                  Admin Panel
                </span>
              </Link>
            </li>
          )}

          {/* Logout */}
          <li>
            <button
              onClick={(e) => {
                e.stopPropagation();
                document.cookie = "token=; Max-Age=0; path=/;";
                localStorage.removeItem("token");
                window.location.href = "/login";
              }}
              className="group w-full flex items-center px-4 py-3 rounded-lg
                         hover:bg-black dark:hover:bg-black
                         transition cursor-pointer"
            >
              <div className="w-10 flex justify-center transition-transform duration-300 group-hover:translate-x-1">
                <LogOut size={30} className="text-red-600" />
              </div>

              <span
                className={`ml-3 text-2xl font-medium text-red-600
                  whitespace-nowrap transition-all duration-300 group-hover:translate-x-1 ${
                    open
                      ? "opacity-100 max-w-xs"
                      : "opacity-0 max-w-0 overflow-hidden"
                  }`}
              >
                Logout
              </span>
            </button>
          </li>
        </ul>
      </div>

      {/* BOTTOM DARK MODE TOGGLE */}
      <div className="pt-6">
        <button
          onClick={toggleDarkMode}
          className="group w-full flex items-center px-4 py-3 rounded-lg
                     hover:bg-black dark:hover:bg-black
                     transition cursor-pointer"
        >
          <div className="w-10 flex justify-center transition-transform duration-300 group-hover:translate-x-1">
            <Moon
              size={28}
              className="text-gray-800 dark:text-white group-hover:text-white"
            />
          </div>

          <span
            className={`ml-3 text-2xl font-medium text-gray-800 dark:text-white
              group-hover:text-white
              whitespace-nowrap transition-all duration-300 group-hover:translate-x-1 ${
                open
                  ? "opacity-100 max-w-xs"
                  : "opacity-0 max-w-0 overflow-hidden"
              }`}
          >
            Dark Mode
          </span>
        </button>
      </div>
    </div>
  );
}
