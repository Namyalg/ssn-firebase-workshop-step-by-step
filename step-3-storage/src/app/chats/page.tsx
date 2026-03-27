"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

interface Conversation {
  id: string;
  question: string;
  description: string;
  imageUrl?: string;
  authorAnonId: string;
  authorUID: string;
  createdAt: Timestamp;
}

export default function ChatsPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Fetch conversations on load
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    const q = query(
      collection(db, "conversations"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    const convos: Conversation[] = [];
    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      convos.push({
        id: docSnapshot.id,
        question: data.question || "",
        description: data.description || "",
        imageUrl: data.imageUrl,
        authorAnonId: data.authorAnonId || "",
        authorUID: data.authorUID || "",
        createdAt: data.createdAt,
      });
    });
    setConversations(convos);
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCreateConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !userProfile) return;

    setIsSubmitting(true);
    try {
      let imageUrl = "";

      // Upload image if selected
      if (selectedImage) {
        const imageRef = ref(
          storage,
          `conversations/${Date.now()}_${selectedImage.name}`
        );
        await uploadBytes(imageRef, selectedImage);
        imageUrl = await getDownloadURL(imageRef);
      }

      const docRef = await addDoc(collection(db, "conversations"), {
        question: newQuestion.trim(),
        description: newDescription.trim(),
        imageUrl,
        authorAnonId: userProfile.anonymousId,
        authorUID: user?.uid,
        createdAt: serverTimestamp(),
      });

      // Add to local state immediately
      setConversations((prev) => [
        {
          id: docRef.id,
          question: newQuestion.trim(),
          description: newDescription.trim(),
          imageUrl,
          authorAnonId: userProfile.anonymousId,
          authorUID: user?.uid || "",
          createdAt: Timestamp.now(),
        },
        ...prev,
      ]);

      setNewQuestion("");
      setNewDescription("");
      setSelectedImage(null);
      setImagePreview(null);
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating conversation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (timestamp: Timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleString();
  };

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
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Conversations</h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 border-2 border-black bg-black text-white hover:bg-white hover:text-black transition-colors duration-200"
          >
            + Ask a Question
          </button>
        </div>

        {showCreateForm && (
          <div className="border-2 border-black p-6 mb-8">
            <form onSubmit={handleCreateConversation}>
              <label className="block text-lg font-bold mb-2">Question</label>
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="What would you like to ask?"
                className="w-full border-2 border-black p-4 text-lg focus:outline-none mb-4"
                autoFocus
              />

              <label className="block text-lg font-bold mb-2">Description</label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Add more details to your question..."
                className="w-full border-2 border-black p-4 text-lg resize-none focus:outline-none mb-4"
                rows={3}
              />

              <label className="block text-lg font-bold mb-2">Image (optional)</label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              {!imagePreview ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-black p-6 text-center hover:bg-gray-50 transition-colors mb-4"
                >
                  Click to upload an image
                </button>
              ) : (
                <div className="relative mb-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-48 border-2 border-black"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-black text-white px-3 py-1 text-sm hover:bg-white hover:text-black border-2 border-black transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}

              <p className="text-sm italic mb-4 text-gray-600">
                In the next step, you&apos;ll be able to upvote questions in real-time.
              </p>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !newQuestion.trim()}
                  className="px-6 py-3 border-2 border-black bg-black text-white hover:bg-white hover:text-black transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Posting..." : "Post Question"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewQuestion("");
                    setNewDescription("");
                    removeImage();
                  }}
                  className="px-6 py-3 border-2 border-black bg-white text-black hover:bg-black hover:text-white transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {conversations.length === 0 ? (
          <div className="border-2 border-black p-8 text-center">
            <p className="text-lg italic">
              No conversations yet. Be the first to ask a question!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((convo) => (
              <div key={convo.id} className="border-2 border-black p-6 hover:bg-gray-50 transition-colors">
                <p className="text-xl font-bold mb-2">{convo.question}</p>
                {convo.description && (
                  <p className="text-lg mb-4">{convo.description}</p>
                )}
                {convo.imageUrl && (
                  <img
                    src={convo.imageUrl}
                    alt="Question attachment"
                    className="max-h-64 border-2 border-black mb-4"
                  />
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold">{convo.authorAnonId}</span>
                  <span className="italic">{formatTime(convo.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
