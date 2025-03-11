import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

// Only initialize Firebase if we have the required environment variables
const hasRequiredConfig =
  process.env.FIREBASE_API_KEY && process.env.FIREBASE_AUTH_DOMAIN && process.env.FIREBASE_PROJECT_ID

// Create a function to initialize Firebase
const initializeFirebase = () => {
  if (!hasRequiredConfig) {
    console.error("Firebase configuration is missing or incomplete")
    // Return mock Firebase instances to prevent app from crashing
    return {
      app: null,
      auth: { currentUser: null, onAuthStateChanged: () => () => {} },
      db: {},
      storage: {},
    }
  }

  try {
    const firebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
    }

    // Initialize Firebase
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
    const auth = getAuth(app)
    const db = getFirestore(app)
    const storage = getStorage(app)

    return { app, auth, db, storage }
  } catch (error) {
    console.error("Error initializing Firebase:", error)
    // Return mock Firebase instances to prevent app from crashing
    return {
      app: null,
      auth: { currentUser: null, onAuthStateChanged: () => () => {} },
      db: {},
      storage: {},
    }
  }
}

// Only initialize Firebase in the browser
const { app, auth, db, storage } = isBrowser ? initializeFirebase() : { app: null, auth: null, db: null, storage: null }

export { auth, db, storage }

