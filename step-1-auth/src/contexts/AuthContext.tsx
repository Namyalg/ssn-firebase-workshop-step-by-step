"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";
import { generateAnonId } from "@/lib/anonId";

export interface UserProfile {
  uid: string;
  email: string;
  anonymousId: string;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for authentication state changes
    // This Firebase listener automatically triggers:
    // - When user signs in/out
    // - On app initialization (checks existing session)
    // - When tokens expire/refresh
    // - On page reload (rehydrates auth state)
    // 
    // The callback receives the current Firebase user object:
    // - null = not authenticated
    // - User object = authenticated with session data
    // 
    // We use this to:
    // 1. Update React state with current auth status
    // 2. Load user profile from Firestore if exists
    // 3. Clear profile when user signs out
    // 4. Control loading state for the app
    // 
    // The unsubscribe function returned cleans up the listener
    // when the component unmounts to prevent memory leaks.

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      // Google verifies user and returns Firebase user object.
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

      if (!userDoc.exists()) {
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          anonymousId: generateAnonId(),
          createdAt: new Date(),
        };
        // Store the user -> anonymous ID mapping in a Firestore collection.
        await setDoc(doc(db, "users", firebaseUser.uid), newProfile);
        setUserProfile(newProfile);
      } else {
        setUserProfile(userDoc.data() as UserProfile);
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
