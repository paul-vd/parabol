import styled from '@emotion/styled'
import {AccountCircle, ChangeHistory, GroupAdd, GroupWork, History} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React, {ReactNode} from 'react'
import {createFragmentContainer} from 'react-relay'
import {cardShadow} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import {TimelineEventCard_timelineEvent} from '../__generated__/TimelineEventCard_timelineEvent.graphql'
import TimelineEventDate from './TimelineEventDate'
import TimelineEventHeaderMenuToggle from './TimelineEventHeaderMenuToggle'

interface Props {
  children: ReactNode
  //FIXME 6062: change to React.ComponentType
  iconName?: string
  IconSVG?: ReactNode
  title: ReactNode
  timelineEvent: TimelineEventCard_timelineEvent
}

const Surface = styled('div')({
  background: '#FFFFFF',
  borderRadius: 4,
  boxShadow: cardShadow,
  display: 'flex',
  flexDirection: 'column',
  marginBottom: 16,
  overflow: 'hidden',
  position: 'relative',
  width: '100%'
})

const CardHeader = styled('div')({
  display: 'flex',
  margin: '16px 16px 8px',
  position: 'relative',
  justifyContent: 'space-between'
})

const CardTitleBlock = styled('div')({
  display: 'flex'
})

const EventIcon = styled('div')({
  alignSelf: 'flex-start',
  borderRadius: '100%',
  color: PALETTE.SLATE_600,
  display: 'block',
  height: 24,
  userSelect: 'none',
  width: 24
})

const HeaderText = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  fontSize: 14,
  justifyContent: 'space-around',
  lineHeight: '20px',
  paddingLeft: 16,
  paddingTop: 2
})

const TimelineEventCard = (props: Props) => {
  const {children, iconName, IconSVG, title, timelineEvent} = props
  const {id: timelineEventId, createdAt, type} = timelineEvent
  return (
    <Surface>
      <CardHeader>
        <CardTitleBlock>
          {iconName && (
            <EventIcon>
              {
                {
                  change_history: <ChangeHistory />,
                  history: <History />,
                  account_circle: <AccountCircle />,
                  group_add: <GroupAdd />,
                  group_work: <GroupWork />
                }[iconName]
              }
            </EventIcon>
          )}
          {IconSVG}
          <HeaderText>
            {title}
            <TimelineEventDate createdAt={createdAt} />
          </HeaderText>
        </CardTitleBlock>
        {type === 'retroComplete' ||
        type === 'actionComplete' ||
        type === 'POKER_COMPLETE' ||
        type === 'TEAM_PROMPT_COMPLETE' ? (
          <TimelineEventHeaderMenuToggle timelineEventId={timelineEventId} />
        ) : null}
      </CardHeader>
      {children}
    </Surface>
  )
}

export default createFragmentContainer(TimelineEventCard, {
  timelineEvent: graphql`
    fragment TimelineEventCard_timelineEvent on TimelineEvent {
      id
      createdAt
      type
    }
  `
})
