"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { FileText, Upload, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"

// Mock data for demonstration
const pendingAssessments = [
  { id: "1", title: "Personal Narrative Essay", student: "Alex Johnson", dueDate: "2023-11-15" },
  { id: "2", title: "Book Report: To Kill a Mockingbird", student: "Jamie Smith", dueDate: "2023-11-18" },
  { id: "3", title: "Persuasive Essay", student: "Taylor Wilson", dueDate: "2023-11-20" },
]

const completedAssessments = [
  { id: "4", title: "Poetry Analysis", student: "Morgan Lee", completedDate: "2023-11-01" },
  { id: "5", title: "Short Story", student: "Casey Brown", completedDate: "2023-10-28" },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const isTeacher = user?.role === "teacher"

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.email}</p>
        </div>
        {isTeacher && (
          <Button asChild>
            <Link href="/submissions/new">
              <Upload className="mr-2 h-4 w-4" />
              New Assignment
            </Link>
          </Button>
        )}
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="space-y-4 pt-4">
          {pendingAssessments.length === 0 ? (
            <Card>
              <CardContent className="flex h-40 flex-col items-center justify-center p-6">
                <p className="text-center text-muted-foreground">No pending assessments</p>
              </CardContent>
            </Card>
          ) : (
            pendingAssessments.map((assessment) => (
              <Card key={assessment.id}>
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{assessment.title}</CardTitle>
                      <CardDescription>Student: {assessment.student}</CardDescription>
                    </div>
                    <Button asChild variant="outline">
                      <Link href={`/assessment/${assessment.id}`}>
                        <FileText className="mr-2 h-4 w-4" />
                        Review
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <p className="text-sm text-muted-foreground">
                    Due: {new Date(assessment.dueDate).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        <TabsContent value="completed" className="space-y-4 pt-4">
          {completedAssessments.length === 0 ? (
            <Card>
              <CardContent className="flex h-40 flex-col items-center justify-center p-6">
                <p className="text-center text-muted-foreground">No completed assessments</p>
              </CardContent>
            </Card>
          ) : (
            completedAssessments.map((assessment) => (
              <Card key={assessment.id}>
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{assessment.title}</CardTitle>
                      <CardDescription>Student: {assessment.student}</CardDescription>
                    </div>
                    <Button asChild variant="outline">
                      <Link href={`/assessment/${assessment.id}`}>
                        <FileText className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <p className="text-sm text-muted-foreground">
                    Completed: {new Date(assessment.completedDate).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

