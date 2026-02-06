import { getRouterParam } from 'h3'
import { getStage } from '../../../utils/stage-store'

export default defineEventHandler(async (event) => {
  const summaryId = getRouterParam(event, 'summaryId')

  console.log(`[Stage API] Fetching stage for summaryId: ${summaryId}`)

  if (!summaryId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'summaryId is required',
    })
  }

  // Get current stage from shared stage store
  const stage = getStage(summaryId)

  console.log(`[Stage API] Returning stage: ${stage} for summaryId: ${summaryId}`)

  return {
    summaryId,
    stage,
  }
})
