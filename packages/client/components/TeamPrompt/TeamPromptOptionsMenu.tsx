import styled from '@emotion/styled'
import {Flag, Replay} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {MenuProps} from '~/hooks/useMenu'
import useMutationProps from '~/hooks/useMutationProps'
import useRouter from '~/hooks/useRouter'
import EndTeamPromptMutation from '~/mutations/EndTeamPromptMutation'
import StartRecurrenceMutation from '~/mutations/StartRecurrenceMutation'
import StopRecurrenceMutation from '~/mutations/StopRecurrenceMutation'
import {TeamPromptOptionsMenu_meeting$key} from '~/__generated__/TeamPromptOptionsMenu_meeting.graphql'
import {PALETTE} from '../../styles/paletteV3'
import Menu from '../Menu'
import MenuItem from '../MenuItem'
import {MenuItemLabelStyle} from '../MenuItemLabel'

const ReplayIcon = styled(Replay)({
  color: PALETTE.SLATE_600,
  marginRight: 8
})

const FlagIcon = styled(Flag)({
  color: PALETTE.SLATE_600,
  marginRight: 8
})

const OptionMenuItem = styled('div')({
  ...MenuItemLabelStyle,
  width: '200px'
})

interface Props {
  meetingRef: TeamPromptOptionsMenu_meeting$key
  menuProps: MenuProps
}

const TeamPromptOptionsMenu = (props: Props) => {
  const {meetingRef, menuProps} = props

  const {t} = useTranslation()

  const meeting = useFragment(
    graphql`
      fragment TeamPromptOptionsMenu_meeting on TeamPromptMeeting {
        id
        meetingSeries {
          id
          cancelledAt
        }
        endedAt
        viewerMeetingMember {
          user {
            featureFlags {
              recurrence
            }
          }
        }
      }
    `,
    meetingRef
  )

  const {id: meetingId, meetingSeries, endedAt, viewerMeetingMember} = meeting
  const recurrence = viewerMeetingMember?.user.featureFlags.recurrence
  const atmosphere = useAtmosphere()
  const {onCompleted, onError} = useMutationProps()
  const {history} = useRouter()
  const hasRecurrenceEnabled = meetingSeries && !meetingSeries.cancelledAt

  return (
    <Menu ariaLabel={t('TeamPromptOptionsMenu.EditTheMeeting')} {...menuProps}>
      {recurrence && (
        <MenuItem
          key='copy'
          isDisabled={!!endedAt}
          label={
            <OptionMenuItem>
              <ReplayIcon />
              {hasRecurrenceEnabled ? (
                <span>{t('TeamPromptOptionsMenu.StopRepeating')}</span>
              ) : (
                <span>{t('TeamPromptOptionsMenu.RepeatMF')}</span>
              )}
            </OptionMenuItem>
          }
          onClick={() => {
            menuProps.closePortal()

            if (hasRecurrenceEnabled) {
              StopRecurrenceMutation(atmosphere, {meetingId}, {onCompleted, onError})
            } else {
              StartRecurrenceMutation(atmosphere, {meetingId}, {onCompleted, onError})
            }
          }}
        />
      )}
      <MenuItem
        key='end'
        isDisabled={!!endedAt}
        label={
          <OptionMenuItem>
            <FlagIcon />
            <span>{t('TeamPromptOptionsMenu.EndThisActivity')}</span>
          </OptionMenuItem>
        }
        onClick={() => {
          menuProps.closePortal()
          EndTeamPromptMutation(atmosphere, {meetingId}, {onCompleted, onError, history})
        }}
      />
    </Menu>
  )
}

export default TeamPromptOptionsMenu
