"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Highlighter, MessageSquare, ThumbsUp, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface Annotation {
  id: string
  startIndex: number
  endIndex: number
  text: string
  type: "highlight" | "comment" | "suggestion" | "issue"
  comment?: string
}

interface DocumentViewerProps {
  documentId: string
  documentContent: string
  annotations: Annotation[]
  onAnnotationAdd?: (annotation: Omit<Annotation, "id">) => void
  onAnnotationDelete?: (id: string) => void
}

export function DocumentViewer({
  documentId,
  documentContent,
  annotations = [],
  onAnnotationAdd,
  onAnnotationDelete,
}: DocumentViewerProps) {
  const { user } = useAuth()
  const isTeacher = user?.role === "teacher"
  const [selectedText, setSelectedText] = useState("")
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null)
  const [activeAnnotation, setActiveAnnotation] = useState<Annotation | null>(null)
  const [annotationType, setAnnotationType] = useState<Annotation["type"]>("highlight")
  const [annotationComment, setAnnotationComment] = useState("")
  const documentRef = useRef<HTMLDivElement>(null)

  // Handle text selection
  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const documentElement = documentRef.current

    if (documentElement && documentElement.contains(range.commonAncestorContainer)) {
      const text = selection.toString().trim()
      if (text) {
        // Calculate the start and end indices of the selection
        // This is a simplified approach and might need adjustment for complex documents
        const documentText = documentElement.textContent || ""
        const preSelectionRange = range.cloneRange()
        preSelectionRange.selectNodeContents(documentElement)
        preSelectionRange.setEnd(range.startContainer, range.startOffset)
        const start = preSelectionRange.toString().length
        const end = start + text.length

        setSelectedText(text)
        setSelectionRange({ start, end })
      }
    }
  }

  // Add annotation
  const addAnnotation = () => {
    if (!selectedText || !selectionRange || !isTeacher) return

    const newAnnotation = {
      startIndex: selectionRange.start,
      endIndex: selectionRange.end,
      text: selectedText,
      type: annotationType,
      comment: annotationComment,
    }

    onAnnotationAdd?.(newAnnotation)
    setSelectedText("")
    setSelectionRange(null)
    setAnnotationComment("")
  }

  // Render document with annotations
  const renderDocumentWithAnnotations = () => {
    if (!documentContent) return null

    // Sort annotations by start index (descending) to avoid index shifting
    const sortedAnnotations = [...annotations].sort((a, b) => b.startIndex - a.startIndex)

    let annotatedContent = documentContent

    // Apply annotations from end to start to maintain correct indices
    sortedAnnotations.forEach((annotation) => {
      const before = annotatedContent.substring(0, annotation.startIndex)
      const highlighted = annotatedContent.substring(annotation.startIndex, annotation.endIndex)
      const after = annotatedContent.substring(annotation.endIndex)

      const annotationClass = `annotation annotation-${annotation.type}`
      const annotationHtml = `<span class="${annotationClass}" data-annotation-id="${annotation.id}">${highlighted}</span>`

      annotatedContent = before + annotationHtml + after
    })

    return (
      <div
        ref={documentRef}
        className="prose max-w-none"
        onMouseUp={handleTextSelection}
        dangerouslySetInnerHTML={{ __html: annotatedContent }}
      />
    )
  }

  // Handle clicking on an annotation
  useEffect(() => {
    const handleAnnotationClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.classList.contains("annotation")) {
        const annotationId = target.getAttribute("data-annotation-id")
        if (annotationId) {
          const annotation = annotations.find((a) => a.id === annotationId)
          if (annotation) {
            setActiveAnnotation(annotation)
          }
        }
      }
    }

    document.addEventListener("click", handleAnnotationClick)
    return () => {
      document.removeEventListener("click", handleAnnotationClick)
    }
  }, [annotations])

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card className="h-[calc(100vh-12rem)] overflow-auto">
        <CardContent className="p-6">
          <div className="relative">
            {renderDocumentWithAnnotations()}
            {selectedText && isTeacher && (
              <div className="sticky bottom-0 mt-4 flex flex-col gap-2 rounded-lg border bg-background p-4 shadow-lg">
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={annotationType === "highlight" ? "default" : "outline"}
                    onClick={() => setAnnotationType("highlight")}
                  >
                    <Highlighter className="mr-2 h-4 w-4" />
                    Highlight
                  </Button>
                  <Button
                    size="sm"
                    variant={annotationType === "comment" ? "default" : "outline"}
                    onClick={() => setAnnotationType("comment")}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Comment
                  </Button>
                  <Button
                    size="sm"
                    variant={annotationType === "suggestion" ? "default" : "outline"}
                    onClick={() => setAnnotationType("suggestion")}
                  >
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Suggestion
                  </Button>
                  <Button
                    size="sm"
                    variant={annotationType === "issue" ? "default" : "outline"}
                    onClick={() => setAnnotationType("issue")}
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Issue
                  </Button>
                </div>
                {(annotationType === "comment" || annotationType === "suggestion" || annotationType === "issue") && (
                  <textarea
                    className="mt-2 w-full rounded-md border p-2"
                    placeholder="Add your comment..."
                    value={annotationComment}
                    onChange={(e) => setAnnotationComment(e.target.value)}
                    rows={2}
                  />
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedText("")
                      setSelectionRange(null)
                      setAnnotationComment("")
                    }}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={addAnnotation}>
                    Add Annotation
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="h-[calc(100vh-12rem)] overflow-auto">
        <CardContent className="p-6">
          <Tabs defaultValue="annotations">
            <TabsList className="mb-4 grid w-full grid-cols-2">
              <TabsTrigger value="annotations">Annotations</TabsTrigger>
              <TabsTrigger value="ai-feedback">AI Feedback</TabsTrigger>
            </TabsList>
            <TabsContent value="annotations" className="space-y-4">
              {annotations.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-4 text-center text-muted-foreground">
                  <p>No annotations yet</p>
                  {isTeacher && <p className="text-sm">Select text in the document to add annotations</p>}
                </div>
              ) : (
                annotations.map((annotation) => (
                  <div
                    key={annotation.id}
                    className={`rounded-lg border p-4 ${
                      activeAnnotation?.id === annotation.id ? "border-primary" : ""
                    }`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      {annotation.type === "highlight" && <Highlighter className="h-4 w-4 text-yellow-500" />}
                      {annotation.type === "comment" && <MessageSquare className="h-4 w-4 text-blue-500" />}
                      {annotation.type === "suggestion" && <ThumbsUp className="h-4 w-4 text-green-500" />}
                      {annotation.type === "issue" && <AlertCircle className="h-4 w-4 text-red-500" />}
                      <span className="font-medium capitalize">{annotation.type}</span>
                    </div>
                    <p className="mb-2 text-sm italic">"{annotation.text}"</p>
                    {annotation.comment && <p className="text-sm">{annotation.comment}</p>}
                    {isTeacher && (
                      <div className="mt-2 flex justify-end">
                        <Button size="sm" variant="outline" onClick={() => onAnnotationDelete?.(annotation.id)}>
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </TabsContent>
            <TabsContent value="ai-feedback">
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="mb-2 font-medium">Grammar & Style</h3>
                    <p className="text-sm">
                      The essay demonstrates good grammar overall. Consider varying sentence structure for more engaging
                      writing. Watch for comma splices in paragraphs 2 and 4.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h3 className="mb-2 font-medium">Content & Organization</h3>
                    <p className="text-sm">
                      Strong thesis statement and supporting evidence. The conclusion could be strengthened by restating
                      key points and providing a broader perspective.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h3 className="mb-2 font-medium">Vocabulary & Word Choice</h3>
                    <p className="text-sm">
                      Good use of domain-specific vocabulary. Consider replacing generic terms like "good" and "bad"
                      with more precise alternatives.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

