// Simple in-memory stage store for tracking processing stages
// Shared between API routes and services

type ProcessingStage = 'metadata' | 'classifying' | 'summarizing' | null

const stageStore = new Map<string, {
  stage: ProcessingStage
  timestamp: number
}>()

export function setStage(summaryId: string, stage: ProcessingStage) {
  console.log(`[Stage Store] Setting stage '${stage}' for summaryId: ${summaryId}`)
  stageStore.set(summaryId, {
    stage,
    timestamp: Date.now()
  })
  console.log(`[Stage Store] Current store contents:`, Array.from(stageStore.entries()))
}

export function getStage(summaryId: string): ProcessingStage {
  const data = stageStore.get(summaryId)
  console.log(`[Stage Store] Getting stage for summaryId: ${summaryId}, result: ${data?.stage || null}`)
  return data?.stage || null
}

export function clearStage(summaryId: string) {
  stageStore.delete(summaryId)
}
