"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [firebaseError, setFirebaseError] = useState<string | null>(null)
  const { signIn } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Check if Firebase environment variables are set
  const hasFirebaseConfig = typeof process.env.FIREBASE_API_KEY === "string" && process.env.FIREBASE_API_KEY.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setFirebaseError(null)

    try {
      await signIn(email, password)
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Login error:", error)

      // Handle specific Firebase auth errors
      if (error.code === "auth/invalid-api-key") {
        setFirebaseError("Firebase configuration error. Please check your environment variables.")
      } else if (error.code === "auth/invalid-credential") {
        toast({
          title: "Error",
          description: "Invalid email or password",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: error.message || "An error occurred during sign in",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // For demo purposes, add a quick login option
  const handleDemoLogin = () => {
    router.push("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
          <CardDescription>Enter your email and password to access your account</CardDescription>
        </CardHeader>

        {firebaseError && (
          <CardContent className="pt-0">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{firebaseError}</AlertDescription>
            </Alert>
          </CardContent>
        )}

        {!hasFirebaseConfig && (
          <CardContent className="pt-0">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Firebase Configuration Missing</AlertTitle>
              <AlertDescription>
                Firebase environment variables are not properly configured. Please check your .env file or environment
                settings.
              </AlertDescription>
            </Alert>
          </CardContent>
        )}

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m.smith@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button variant="link" className="h-auto p-0 text-sm">
                  Forgot password?
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>

            <Button type="button" variant="outline" className="w-full" onClick={handleDemoLogin}>
              Demo Mode (No Authentication)
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

