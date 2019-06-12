import {GraphQLFloat, GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import SetStageTimerPayload from 'server/graphql/types/SetStageTimerPayload'
import publish from 'server/utils/publish'
import {TEAM} from 'universal/utils/constants'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import standardError from 'server/utils/standardError'
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type'
import {GQLContext} from 'server/graphql/graphql'
import findStageById from 'universal/utils/meetings/findStageById'

const BAD_CLOCK_THRESH = 2000
const AVG_PING = 150

export default {
  type: SetStageTimerPayload,
  description: 'Set or clear a timer for a meeting stage',
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the id of the meeting'
    },
    scheduledEndTime: {
      type: GraphQLISO8601Type,
      description:
        'The time the timer is scheduled to go off (based on client clock), null if unsetting the timer'
    },
    timeRemaining: {
      type: GraphQLFloat,
      description:
        'scheduledEndTime - now. Used to reconcile bad client clocks. Present for time limit, else null'
    }
  },
  async resolve (
    _source,
    {meetingId, scheduledEndTime, timeRemaining},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const r = getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)
    const now = new Date()

    // AUTH
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    const {endedAt, facilitatorStageId, facilitatorUserId, phases, teamId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})
    if (facilitatorUserId !== viewerId) {
      return standardError(new Error('Not the facilitator'), {userId: viewerId})
    }

    const stageRes = findStageById(phases, facilitatorStageId)!
    const {stage} = stageRes
    if (scheduledEndTime) {
      if (timeRemaining) {
        stage.isAsync = false
        const actualTimeRemaining = scheduledEndTime - now.getTime()
        const badClientClock = Math.abs(timeRemaining - actualTimeRemaining) > BAD_CLOCK_THRESH
        stage.scheduledEndTime = badClientClock ? now + timeRemaining - AVG_PING : scheduledEndTime
      } else {
        stage.isAsync = true
        stage.scheduledEndTime = scheduledEndTime
      }
    } else {
      stage.isAsync = null
      stage.scheduledEndTime = null
    }

    // RESOLUTION
    await r
      .table('NewMeeting')
      .get(meetingId)
      .update({
        phases,
        updatedAt: now
      })

    const data = {meetingId, stageId: facilitatorStageId}
    publish(TEAM, teamId, SetStageTimerPayload, data, subOptions)
    return data
  }
}
