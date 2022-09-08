import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {createFragmentContainer} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router'
import {PALETTE} from '../styles/paletteV3'
import {SuggestedActionTryRetroMeeting_suggestedAction} from '../__generated__/SuggestedActionTryRetroMeeting_suggestedAction.graphql'
import SuggestedActionButton from './SuggestedActionButton'
import SuggestedActionCard from './SuggestedActionCard'
import SuggestedActionCopy from './SuggestedActionCopy'

interface Props extends RouteComponentProps<{[x: string]: string | undefined}> {
  suggestedAction: SuggestedActionTryRetroMeeting_suggestedAction
}

const SuggestedActionTryRetroMeeting = (props: Props) => {
  const {t} = useTranslation()

  const onClick = () => {
    const {history, suggestedAction} = props
    const {team} = suggestedAction
    const {id: teamId} = team
    history.push(
      t('SuggestedActionTryRetroMeeting.NewMeetingTeamId', {
        teamId
      })
    )
  }

  const {suggestedAction} = props
  const {id: suggestedActionId, team} = suggestedAction
  const {name: teamName} = team
  return (
    <SuggestedActionCard
      backgroundColor={PALETTE.TOMATO_500}
      iconName='history'
      suggestedActionId={suggestedActionId}
    >
      <SuggestedActionCopy>
        {t('SuggestedActionTryRetroMeeting.HoldYourFirstRetroMeetingWith')}
        {teamName}
      </SuggestedActionCopy>
      <SuggestedActionButton onClick={onClick}>
        {t('SuggestedActionTryRetroMeeting.StartRetroMeeting')}
      </SuggestedActionButton>
    </SuggestedActionCard>
  )
}

export default createFragmentContainer(withRouter(SuggestedActionTryRetroMeeting), {
  suggestedAction: graphql`
    fragment SuggestedActionTryRetroMeeting_suggestedAction on SuggestedActionTryRetroMeeting {
      id
      team {
        id
        name
      }
    }
  `
})
