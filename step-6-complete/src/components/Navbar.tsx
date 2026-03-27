"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const { userProfile, logout } = useAuth();

  return (
    <nav className="border-b-2 border-black">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Psst.</h1>

        {userProfile && (
          <div className="flex items-center gap-4">
            <span className="text-lg">{userProfile.anonymousId}</span>
            <button
              onClick={logout}
              className="px-4 py-2 border-2 border-black text-sm hover:bg-black hover:text-white transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
