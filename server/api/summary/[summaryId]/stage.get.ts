import { getRouterParam } from 'h3'

// Simple in-memory stage store for tracking processing stages
const stageStore = new Map<string, {
  stage: string | null
  timestamp: number
}>()

export function setStage(summaryId: string, stage: string | null) {
  stageStore.set(summaryId, {
    stage,
    timestamp: Date.now()
  })
}

export default defineEventHandler(async (event) => {
  const summaryId = getRouterParam(event, 'summaryId')

  if (!summaryId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'summaryId is required',
    })
  }

  // Get current stage from in-memory store
  const stageData = stageStore.get(summaryId)
  
  return {
    summaryId,
    stage: stageData?.stage || null,
  }
})
