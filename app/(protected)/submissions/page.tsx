"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Trash2, Eye, FileText } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore"
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage"
import { v4 as uuidv4 } from "uuid"

export default function SubmissionsPage() {
  // Client-side only rendering to avoid hydration issues
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()
  
  // Initialize state with empty values to avoid hydration mismatches
  const [submissions, setSubmissions] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [importSource, setImportSource] = useState<"file" | "gdocs" | "url">("file")
  const [title, setTitle] = useState("")
  const [fileToUpload, setFileToUpload] = useState<File | null>(null)
  const [gdocsLink, setGdocsLink] = useState("")
  const [docUrl, setDocUrl] = useState("")
  
  // Get user from auth context
  const { user } = useAuth()
  
  // Only set mounted to true after component mounts on client
  useEffect(() => {
    setMounted(true)
    
    if (user) {
      fetchSubmissions()
    }
  }, [user])
  
  // Only determine user role on client side
  const isTeacher = mounted ? user?.role === "teacher" : false
  
  const fetchSubmissions = async () => {
    if (!user) return
    
    try {
      const db = getFirestore()
      const submissionsRef = collection(db, "users", user.uid, "submissions")
      const querySnapshot = await getDocs(submissionsRef)
      
      const submissionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      setSubmissions(submissionsData)
    } catch (error) {
      console.error("Error fetching submissions:", error)
      toast({
        title: "Error",
        description: "Failed to load submissions",
        variant: "destructive"
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileToUpload(e.target.files[0])
    }
  }

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to upload documents",
        variant: "destructive"
      })
      return
    }
    
    setIsUploading(true)
    
    try {
      const db = getFirestore()
      const storage = getStorage()
      const fileId = uuidv4()
      let downloadURL = ""
      let fileType = ""
      let fileName = ""
      
      // Handle different import sources
      if (importSource === "file" && fileToUpload) {
        // Upload file to Firebase Storage
        const storageRef = ref(storage, `users/${user.uid}/submissions/${fileId}`)
        await uploadBytes(storageRef, fileToUpload)
        downloadURL = await getDownloadURL(storageRef)
        fileType = fileToUpload.type
        fileName = fileToUpload.name
      } else if (importSource === "gdocs" && gdocsLink) {
        // Store Google Docs link
        downloadURL = gdocsLink
        fileType = "application/gdocs"
        fileName = title || "Google Docs Document"
      } else if (importSource === "url" && docUrl) {
        // Store document URL
        downloadURL = docUrl
        fileType = "url"
        fileName = title || "External Document"
      } else {
        throw new Error("Missing required fields")
      }
      
      // Add document metadata to Firestore
      const submissionData = {
        title: title || fileName,
        fileURL: downloadURL,
        fileType,
        fileName,
        student: user.email,
        date: serverTimestamp(),
        status: "pending",
        importSource
      }
      
      await addDoc(collection(db, "users", user.uid, "submissions"), submissionData)
      
      // Refresh submissions list
      await fetchSubmissions()
      
      // Reset form
      setTitle("")
      setFileToUpload(null)
      setGdocsLink("")
      setDocUrl("")
      
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      })
    } catch (error) {
      console.error("Error uploading document:", error)
      toast({
        title: "Error",
        description: "Failed to upload document. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!user) return
    
    try {
      const db = getFirestore()
      const storage = getStorage()
      
      // Get the submission to find the file URL
      const submissionToDelete = submissions.find(s => s.id === id)
      
      // Delete from Firestore
      const submissionRef = doc(db, "users", user.uid, "submissions", id)
      await deleteDoc(submissionRef)
      
      // If it was a file upload, delete from Storage too
      if (submissionToDelete && submissionToDelete.importSource === "file") {
        try {
          const storageRef = ref(storage, `users/${user.uid}/submissions/${id}`)
          await deleteObject(storageRef)
        } catch (storageError) {
          console.error("Error deleting file from storage:", storageError)
        }
      }
      
      // Update UI
      setSubmissions(submissions.filter(submission => submission.id !== id))
      
      toast({
        title: "Success",
        description: "Document deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting document:", error)
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive"
      })
    }
  }

  // Return a loading state or empty div until client-side hydration is complete
  if (!mounted) {
    return <div className="flex min-h-screen flex-col"></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Submissions</h1>
        <p className="text-muted-foreground">
          {isTeacher ? "Manage student submissions" : "Upload and manage your documents"}
        </p>
      </div>

      {/* Upload section for both teachers and students */}
      <Card>
        <CardHeader>
          <CardTitle>{isTeacher ? "Upload New Document" : "Submit New Document"}</CardTitle>
          <CardDescription>
            {isTeacher 
              ? "Upload a document for assessment. Supported formats: PDF, DOCX, TXT" 
              : "Submit your document for review. Supported formats: PDF, DOCX, TXT"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Import source selection for students */}
          {!isTeacher && (
            <div className="mb-4">
              <Label>Import from:</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button 
                  variant={importSource === "file" ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setImportSource("file")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Local File
                </Button>
                <Button 
                  variant={importSource === "gdocs" ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setImportSource("gdocs")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Google Docs
                </Button>
                <Button 
                  variant={importSource === "url" ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setImportSource("url")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Document URL
                </Button>
              </div>
            </div>
          )}

          <form onSubmit={handleFileUpload} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Document Title</Label>
                <Input 
                  id="title" 
                  placeholder="Enter document title" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required 
                />
              </div>
              {isTeacher && (
                <div className="space-y-2">
                  <Label htmlFor="student">Student Name</Label>
                  <Input id="student" placeholder="Enter student name" required />
                </div>
              )}
            </div>
            
            {/* Different input fields based on import source */}
            {importSource === "file" && (
              <div className="space-y-2">
                <Label htmlFor="file">Document File</Label>
                <Input 
                  id="file" 
                  type="file" 
                  accept=".pdf,.docx,.txt" 
                  onChange={handleFileChange}
                  required 
                />
              </div>
            )}
            
            {importSource === "gdocs" && (
              <div className="space-y-2">
                <Label htmlFor="gdocs">Google Docs Link</Label>
                <Input 
                  id="gdocs" 
                  type="url" 
                  placeholder="Paste Google Docs sharing link" 
                  value={gdocsLink}
                  onChange={(e) => setGdocsLink(e.target.value)}
                  required 
                />
                <p className="text-xs text-muted-foreground">
                  Make sure your document is set to "Anyone with the link can view"
                </p>
              </div>
            )}
            
            {importSource === "url" && (
              <div className="space-y-2">
                <Label htmlFor="url">Document URL</Label>
                <Input 
                  id="url" 
                  type="url" 
                  placeholder="Enter document URL" 
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  required 
                />
              </div>
            )}
            
            <Button type="submit" disabled={isUploading}>
              {isUploading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {isTeacher ? "Upload Document" : "Submit Document"}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

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
                      <Button variant="outline" size="sm" onClick={() => handleDelete(submission.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Submitted: {submission.date ? new Date(submission.date.seconds * 1000).toLocaleDateString() : "Just now"}
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
                  {submission.importSource && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Source: {submission.importSource === "file" ? "Uploaded File" : 
                              submission.importSource === "gdocs" ? "Google Docs" : "External URL"}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        <TabsContent value="pending" className="space-y-4 pt-4">
          {/* Pending submissions content */}
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
                        <Button variant="outline" size="sm" onClick={() => handleDelete(submission.id)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 pt-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Submitted: {submission.date ? new Date(submission.date.seconds * 1000).toLocaleDateString() : "Just now"}
                      </p>
                      <div className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                        Pending
                      </div>
                    </div>
                    {submission.importSource && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Source: {submission.importSource === "file" ? "Uploaded File" : 
                                submission.importSource === "gdocs" ? "Google Docs" : "External URL"}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>
        <TabsContent value="graded" className="space-y-4 pt-4">
          {/* Graded submissions content */}
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
                        <Button variant="outline" size="sm" onClick={() => handleDelete(submission.id)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                          </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 pt-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Submitted: {submission.date ? new Date(submission.date.seconds * 1000).toLocaleDateString() : "Just now"}
                      </p>
                      <div className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                        Graded
                      </div>
                    </div>
                    {submission.importSource && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Source: {submission.importSource === "file" ? "Uploaded File" : 
                                submission.importSource === "gdocs" ? "Google Docs" : "External URL"}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

