"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

// Mock data for demonstration
const mockSubmissions = [
  { id: "1", title: "Personal Narrative Essay", student: "Alex Johnson", date: "2023-11-01", status: "pending" },
  {
    id: "2",
    title: "Book Report: To Kill a Mockingbird",
    student: "Jamie Smith",
    date: "2023-10-28",
    status: "pending",
  },
  { id: "3", title: "Poetry Analysis", student: "Morgan Lee", date: "2023-10-15", status: "graded" },
  { id: "4", title: "Short Story", student: "Casey Brown", date: "2023-10-10", status: "graded" },
]

export default function SubmissionsPage() {
  const { user } = useAuth()
  const isTeacher = user?.role === "teacher"
  const { toast } = useToast()
  const [submissions, setSubmissions] = useState(mockSubmissions)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)

    // Simulate file upload
    setTimeout(() => {
      setIsUploading(false)
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      })
    }, 2000)
  }

  const handleDelete = (id: string) => {
    setSubmissions(submissions.filter((submission) => submission.id !== id))
    toast({
      title: "Success",
      description: "Document deleted successfully",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Submissions</h1>
        <p className="text-muted-foreground">
          {isTeacher ? "Manage student submissions" : "View your submitted documents"}
        </p>
      </div>

      {isTeacher && (
        <Card>
          <CardHeader>
            <CardTitle>Upload New Document</CardTitle>
            <CardDescription>Upload a document for assessment. Supported formats: PDF, DOCX, TXT</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Document Title</Label>
                  <Input id="title" placeholder="Enter document title" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student">Student Name</Label>
                  <Input id="student" placeholder="Enter student name" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">Document File</Label>
                <Input id="file" type="file" accept=".pdf,.docx,.txt" required />
              </div>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Submissions</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="graded">Graded</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4 pt-4">
          {submissions.length === 0 ? (
            <Card>
              <CardContent className="flex h-40 flex-col items-center justify-center p-6">
                <p className="text-center text-muted-foreground">No submissions found</p>
              </CardContent>
            </Card>
          ) : (
            submissions.map((submission) => (
              <Card key={submission.id}>
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{submission.title}</CardTitle>
                      <CardDescription>Student: {submission.student}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/assessment/${submission.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          {submission.status === "graded" ? "View Feedback" : "Review"}
                        </Link>
                      </Button>
                      {isTeacher && (
                        <Button variant="outline" size="sm" onClick={() => handleDelete(submission.id)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Submitted: {new Date(submission.date).toLocaleDateString()}
                    </p>
                    <div
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        submission.status === "graded"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                      }`}
                    >
                      {submission.status === "graded" ? "Graded" : "Pending"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        <TabsContent value="pending" className="space-y-4 pt-4">
          {submissions.filter((s) => s.status === "pending").length === 0 ? (
            <Card>
              <CardContent className="flex h-40 flex-col items-center justify-center p-6">
                <p className="text-center text-muted-foreground">No pending submissions</p>
              </CardContent>
            </Card>
          ) : (
            submissions
              .filter((s) => s.status === "pending")
              .map((submission) => (
                <Card key={submission.id}>
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{submission.title}</CardTitle>
                        <CardDescription>Student: {submission.student}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/assessment/${submission.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Review
                          </Link>
                        </Button>
                        {isTeacher && (
                          <Button variant="outline" size="sm" onClick={() => handleDelete(submission.id)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 pt-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Submitted: {new Date(submission.date).toLocaleDateString()}
                      </p>
                      <div className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                        Pending
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>
        <TabsContent value="graded" className="space-y-4 pt-4">
          {submissions.filter((s) => s.status === "graded").length === 0 ? (
            <Card>
              <CardContent className="flex h-40 flex-col items-center justify-center p-6">
                <p className="text-center text-muted-foreground">No graded submissions</p>
              </CardContent>
            </Card>
          ) : (
            submissions
              .filter((s) => s.status === "graded")
              .map((submission) => (
                <Card key={submission.id}>
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{submission.title}</CardTitle>
                        <CardDescription>Student: {submission.student}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/assessment/${submission.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Feedback
                          </Link>
                        </Button>
                        {isTeacher && (
                          <Button variant="outline" size="sm" onClick={() => handleDelete(submission.id)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 pt-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Submitted: {new Date(submission.date).toLocaleDateString()}
                      </p>
                      <div className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                        Graded
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

