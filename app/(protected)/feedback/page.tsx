"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { FileText, Download, Calendar } from "lucide-react"
import Link from "next/link"

// Mock data for demonstration
const mockFeedback = [
  {
    id: "1",
    title: "Personal Narrative Essay",
    student: "Alex Johnson",
    date: "2023-11-05",
    type: "teacher",
    summary: "Good structure and content. Work on grammar and vocabulary.",
  },
  {
    id: "2",
    title: "Book Report: To Kill a Mockingbird",
    student: "Jamie Smith",
    date: "2023-11-03",
    type: "ai",
    summary: "Strong analysis of themes. Consider adding more textual evidence.",
  },
  {
    id: "3",
    title: "Poetry Analysis",
    student: "Morgan Lee",
    date: "2023-10-20",
    type: "teacher",
    summary: "Excellent use of literary terms. Structure could be improved.",
  },
  {
    id: "4",
    title: "Short Story",
    student: "Casey Brown",
    date: "2023-10-15",
    type: "ai",
    summary: "Creative plot and characters. Work on dialogue and pacing.",
  },
]

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState(mockFeedback)

  const downloadFeedback = (id: string) => {
    // In a real app, this would generate and download a PDF or text file
    alert(`Downloading feedback for document ${id}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Feedback</h1>
        <p className="text-muted-foreground">View and manage feedback for student writing</p>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Feedback</TabsTrigger>
          <TabsTrigger value="teacher">Teacher Feedback</TabsTrigger>
          <TabsTrigger value="ai">AI Feedback</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4 pt-4">
          {feedback.length === 0 ? (
            <Card>
              <CardContent className="flex h-40 flex-col items-center justify-center p-6">
                <p className="text-center text-muted-foreground">No feedback found</p>
              </CardContent>
            </Card>
          ) : (
            feedback.map((item) => (
              <Card key={item.id}>
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{item.title}</CardTitle>
                      <CardDescription>Student: {item.student}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/assessment/${item.id}`}>
                          <FileText className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => downloadFeedback(item.id)}>
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{new Date(item.date).toLocaleDateString()}</p>
                    </div>
                    <div
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        item.type === "teacher"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                      }`}
                    >
                      {item.type === "teacher" ? "Teacher Feedback" : "AI Feedback"}
                    </div>
                  </div>
                  <p className="mt-2 text-sm">{item.summary}</p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        <TabsContent value="teacher" className="space-y-4 pt-4">
          {feedback.filter((item) => item.type === "teacher").length === 0 ? (
            <Card>
              <CardContent className="flex h-40 flex-col items-center justify-center p-6">
                <p className="text-center text-muted-foreground">No teacher feedback found</p>
              </CardContent>
            </Card>
          ) : (
            feedback
              .filter((item) => item.type === "teacher")
              .map((item) => (
                <Card key={item.id}>
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{item.title}</CardTitle>
                        <CardDescription>Student: {item.student}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/assessment/${item.id}`}>
                            <FileText className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => downloadFeedback(item.id)}>
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Download</span>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{new Date(item.date).toLocaleDateString()}</p>
                      </div>
                      <div className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        Teacher Feedback
                      </div>
                    </div>
                    <p className="mt-2 text-sm">{item.summary}</p>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>
        <TabsContent value="ai" className="space-y-4 pt-4">
          {feedback.filter((item) => item.type === "ai").length === 0 ? (
            <Card>
              <CardContent className="flex h-40 flex-col items-center justify-center p-6">
                <p className="text-center text-muted-foreground">No AI feedback found</p>
              </CardContent>
            </Card>
          ) : (
            feedback
              .filter((item) => item.type === "ai")
              .map((item) => (
                <Card key={item.id}>
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{item.title}</CardTitle>
                        <CardDescription>Student: {item.student}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/assessment/${item.id}`}>
                            <FileText className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => downloadFeedback(item.id)}>
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Download</span>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{new Date(item.date).toLocaleDateString()}</p>
                      </div>
                      <div className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                        AI Feedback
                      </div>
                    </div>
                    <p className="mt-2 text-sm">{item.summary}</p>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

