"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { DocumentViewer } from "@/components/document-viewer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { v4 as uuidv4 } from "uuid"

// Mock data for demonstration
const mockDocument = {
  id: "1",
  title: "Personal Narrative Essay",
  student: "Alex Johnson",
  content: `
    <h1>My Summer Adventure</h1>
    <p>Last summer, I embarked on an unforgettable journey through the mountains of Colorado. What started as a simple hiking trip turned into a life-changing experience that taught me about perseverance, friendship, and the beauty of nature.</p>
    
    <p>Our group consisted of five friends who had known each other since elementary school. We had been planning this trip for months, carefully mapping out our route and packing all the necessary supplies. Little did we know that our preparation would be tested in ways we couldn't imagine.</p>
    
    <p>On the third day of our hike, dark clouds gathered overhead, and soon we found ourselves caught in a sudden thunderstorm. The rain poured down relentlessly, making the trail slippery and dangerous. We had to quickly find shelter and set up camp earlier than planned.</p>
    
    <p>Despite the challenges, we managed to work together as a team. Sarah used her wilderness training to find a safe location away from potential flash floods. Michael, always prepared, had packed extra tarps that kept our supplies dry. I was responsible for setting up the portable stove so we could have a warm meal.</p>
    
    <p>The next morning, we woke up to a transformed landscape. The storm had cleared, revealing a breathtaking view of the mountains covered in mist. It was in that moment that I realized the value of pushing through difficulties to witness something truly beautiful.</p>
    
    <p>This experience taught me that sometimes the most rewarding adventures come with unexpected challenges. I learned to appreciate the importance of preparation, teamwork, and maintaining a positive attitude even when things don't go according to plan.</p>
  `,
}

// Mock annotations
const mockAnnotations = [
  {
    id: "1",
    startIndex: 245,
    endIndex: 275,
    text: "planning this trip for months",
    type: "highlight" as const,
  },
  {
    id: "2",
    startIndex: 420,
    endIndex: 458,
    text: "caught in a sudden thunderstorm",
    type: "comment" as const,
    comment: "Great use of weather to create tension in your narrative!",
  },
  {
    id: "3",
    startIndex: 650,
    endIndex: 685,
    text: "we managed to work together as a team",
    type: "suggestion" as const,
    comment: "Consider adding more specific examples of how you worked together.",
  },
]

export default function AssessmentPage() {
  const params = useParams()
  const { id } = params
  const { toast } = useToast()
  const [document, setDocument] = useState(mockDocument)
  const [annotations, setAnnotations] = useState(mockAnnotations)
  const [isLoading, setIsLoading] = useState(false)

  // In a real app, you would fetch the document and annotations from your backend
  useEffect(() => {
    // Simulate API call
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [id])

  const handleAnnotationAdd = (annotation: Omit<(typeof annotations)[0], "id">) => {
    const newAnnotation = {
      ...annotation,
      id: uuidv4(),
    }
    setAnnotations([...annotations, newAnnotation])
  }

  const handleAnnotationDelete = (annotationId: string) => {
    setAnnotations(annotations.filter((a) => a.id !== annotationId))
  }

  const handleSave = () => {
    // In a real app, you would save the annotations to your backend
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Success",
        description: "Annotations saved successfully",
      })
    }, 1000)
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="icon">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{document.title}</h1>
            <p className="text-muted-foreground">Student: {document.student}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          Save Feedback
        </Button>
      </div>

      <DocumentViewer
        documentId={id as string}
        documentContent={document.content}
        annotations={annotations}
        onAnnotationAdd={handleAnnotationAdd}
        onAnnotationDelete={handleAnnotationDelete}
      />
    </div>
  )
}

