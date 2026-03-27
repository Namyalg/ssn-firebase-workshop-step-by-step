"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, geminiModel } from "@/lib/firebase";

interface Conversation {
  id: string;
  question: string;
  description: string;
  imageUrl?: string;
  authorAnonId: string;
  authorUID: string;
  createdAt: Timestamp;
  upvotes: number;
  upvotedBy: string[];
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
  const [vibeResult, setVibeResult] = useState<string | null>(null);
  const [isVibeLoading, setIsVibeLoading] = useState(false);

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
        upvotes: data.upvotes || 0,
        upvotedBy: data.upvotedBy || [],
      });
    });
    setConversations(convos);
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Real-time listener for upvotes
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "conversations"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setConversations((prev) => {
        const updated = [...prev];
        snapshot.docChanges().forEach((change) => {
          if (change.type === "modified") {
            const index = updated.findIndex((c) => c.id === change.doc.id);
            if (index !== -1) {
              const data = change.doc.data();
              updated[index] = {
                ...updated[index],
                upvotes: data.upvotes || 0,
                upvotedBy: data.upvotedBy || [],
              };
            }
          }
        });
        return updated;
      });
    });

    return () => unsubscribe();
  }, [user]);

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
        upvotes: 0,
        upvotedBy: [],
      });

      setConversations((prev) => [
        {
          id: docRef.id,
          question: newQuestion.trim(),
          description: newDescription.trim(),
          imageUrl,
          authorAnonId: userProfile.anonymousId,
          authorUID: user?.uid || "",
          createdAt: Timestamp.now(),
          upvotes: 0,
          upvotedBy: [],
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

  const handleUpvote = async (convo: Conversation) => {
    if (!user) return;

    const hasUpvoted = convo.upvotedBy?.includes(user.uid);
    const convoRef = doc(db, "conversations", convo.id);

    try {
      if (hasUpvoted) {
        await updateDoc(convoRef, {
          upvotes: convo.upvotes - 1,
          upvotedBy: arrayRemove(user.uid),
        });
      } else {
        await updateDoc(convoRef, {
          upvotes: convo.upvotes + 1,
          upvotedBy: arrayUnion(user.uid),
        });
      }
    } catch (error) {
      console.error("Error updating upvote:", error);
    }
  };

  const formatTime = (timestamp: Timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleString();
  };

  const handleVibeCheck = async () => {
    if (conversations.length === 0) return;

    setIsVibeLoading(true);
    setVibeResult(null);

    try {
      const questions = conversations.map((c) => c.question).join("\n- ");
      const prompt = `Analyze the vibe of these anonymous questions from students. Give a brief, fun summary (2-3 sentences) of the overall mood and themes. Be encouraging!\n\nQuestions:\n- ${questions}`;

      const result = await geminiModel.generateContent(prompt);
      setVibeResult(result.response.text());
    } catch (error) {
      console.error("Error checking vibe:", error);
      setVibeResult("Couldn't check the vibe right now. Try again!");
    } finally {
      setIsVibeLoading(false);
    }
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold">Conversations</h2>
          <div className="flex gap-2">
            <button
              onClick={handleVibeCheck}
              disabled={isVibeLoading || conversations.length === 0}
              className="px-6 py-3 border-2 border-black bg-white text-black hover:bg-black hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVibeLoading ? "Checking..." : "Vibe Check"}
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 border-2 border-black bg-black text-white hover:bg-white hover:text-black transition-colors duration-200"
            >
              + Ask a Question
            </button>
          </div>
        </div>

        {vibeResult && (
          <div className="border-2 border-black bg-gray-50 p-6 mb-8">
            <p className="text-lg font-bold mb-2">Vibe Check Result:</p>
            <p className="text-lg">{vibeResult}</p>
          </div>
        )}

        <p className="text-sm italic mb-8 text-gray-600 border-l-2 border-black pl-4">
          In the next step, we&apos;ll add Remote Config to let users choose between AI models.
        </p>

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
            {conversations.map((convo) => {
              const hasUpvoted = convo.upvotedBy?.includes(user.uid);

              return (
                <div key={convo.id} className="border-2 border-black p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleUpvote(convo)}
                      className={`flex flex-col items-center justify-center px-3 py-2 border-2 border-black transition-colors h-fit ${
                        hasUpvoted
                          ? "bg-black text-white"
                          : "bg-white text-black hover:bg-gray-100"
                      }`}
                    >
                      <span className="text-lg">▲</span>
                      <span className="text-lg font-bold">{convo.upvotes}</span>
                    </button>

                    <div className="flex-1">
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
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
