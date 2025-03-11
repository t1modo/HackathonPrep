"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { type User, onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

type UserRole = "teacher" | "student"

interface AuthUser extends User {
  role: UserRole
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, role: UserRole) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if auth is available (Firebase is initialized)
    if (!auth) {
      console.error("Firebase Auth is not initialized")
      setLoading(false)
      return () => {}
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            // Fetch user role from Firestore
            if (db) {
              const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
              const userData = userDoc.data()

              setUser({
                ...firebaseUser,
                role: userData?.role || "student",
              } as AuthUser)
            } else {
              // If Firestore is not available, set a default role
              setUser({
                ...firebaseUser,
                role: "student",
              } as AuthUser)
            }
          } catch (error) {
            console.error("Error fetching user data:", error)
            // Set user with default role if there's an error
            setUser({
              ...firebaseUser,
              role: "student",
            } as AuthUser)
          }
        } else {
          setUser(null)
        }
        setLoading(false)
      })

      return () => unsubscribe()
    } catch (error) {
      console.error("Error setting up auth state listener:", error)
      setLoading(false)
      return () => {}
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase Auth is not initialized")

    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error("Error signing in:", error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, role: UserRole) => {
    // Implementation would include creating the user in Firebase Auth
    // and storing their role in Firestore
    throw new Error("Not implemented")
  }

  const signOut = async () => {
    if (!auth) throw new Error("Firebase Auth is not initialized")

    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  // For development/demo purposes, let's add a mock authentication option
  const mockAuthValue: AuthContextType = {
    user: {
      uid: "mock-user-id",
      email: "teacher@example.com",
      role: "teacher",
      // Add other required User properties with mock values
      emailVerified: true,
      isAnonymous: false,
      metadata: {},
      providerData: [],
      refreshToken: "",
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => "",
      getIdTokenResult: async () => ({
        token: "",
        signInProvider: "",
        expirationTime: "",
        issuedAtTime: "",
        claims: {},
      }),
      reload: async () => {},
      toJSON: () => ({}),
      displayName: "Mock Teacher",
      phoneNumber: null,
      photoURL: null,
      providerId: "password",
    } as AuthUser,
    loading: false,
    signIn: async () => {},
    signUp: async () => {},
    signOut: async () => {},
  }

  // Use mock auth if Firebase auth is not available
  const authValue = auth
    ? {
        user,
        loading,
        signIn,
        signUp,
        signOut,
      }
    : mockAuthValue

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

