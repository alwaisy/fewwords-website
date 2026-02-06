// Simple in-memory stage store for tracking processing stages
// Shared between API routes and services

type ProcessingStage = 'metadata' | 'classifying' | 'summarizing' | null

const stageStore = new Map<string, {
  stage: ProcessingStage
  timestamp: number
}>()

export function setStage(summaryId: string, stage: ProcessingStage) {
  stageStore.set(summaryId, {
    stage,
    timestamp: Date.now()
  })
}

export function getStage(summaryId: string): ProcessingStage {
  const data = stageStore.get(summaryId)
  return data?.stage || null
}

export function clearStage(summaryId: string) {
  stageStore.delete(summaryId)
}
