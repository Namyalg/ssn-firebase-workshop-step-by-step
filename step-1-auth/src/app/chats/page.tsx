"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

export default function ChatsPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <h2 className="text-3xl font-bold mb-8">Welcome, {userProfile.anonymousId}!</h2>

        <div className="border-2 border-black p-8 text-center">
          <p className="text-lg italic">
            Authentication complete! In the next step, we&apos;ll add the ability to post and view questions.
          </p>
        </div>
      </main>
    </div>
  );
}
