"use server"

import { generateAIFeedback, type AIFeedbackRequest, type AIFeedbackResponse } from "@/lib/ai-service"

export async function generateFeedback(formData: FormData): Promise<AIFeedbackResponse> {
  const documentContent = formData.get("documentContent") as string
  const grammar = formData.get("grammar") === "on"
  const structure = formData.get("structure") === "on"
  const content = formData.get("content") === "on"
  const vocabulary = formData.get("vocabulary") === "on"

  const request: AIFeedbackRequest = {
    documentContent,
    rubric: {
      grammar,
      structure,
      content,
      vocabulary,
    },
  }

  try {
    const feedback = await generateAIFeedback(request)
    return feedback
  } catch (error) {
    console.error("Error generating feedback:", error)
    throw new Error("Failed to generate feedback")
  }
}

