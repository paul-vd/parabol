import styled from '@emotion/styled'
import {Info as InfoIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React, {FormEvent} from 'react'
import {useTranslation} from 'react-i18next'
import {useFragment} from 'react-relay'
import {MenuPosition} from '~/hooks/useCoords'
import useForm from '~/hooks/useForm'
import useTooltip from '~/hooks/useTooltip'
import linkify from '~/utils/linkify'
import {MattermostPanel_viewer$key} from '~/__generated__/MattermostPanel_viewer.graphql'
import FlatButton from '../../../../components/FlatButton'
import BasicInput from '../../../../components/InputField/BasicInput'
import LabelHeading from '../../../../components/LabelHeading/LabelHeading'
import StyledError from '../../../../components/StyledError'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import AddIntegrationProviderMutation from '../../../../mutations/AddIntegrationProviderMutation'
import AddTeamMemberIntegrationAuthMutation from '../../../../mutations/AddTeamMemberIntegrationAuthMutation'
import UpdateIntegrationProviderMutation from '../../../../mutations/UpdateIntegrationProviderMutation'
import {PALETTE} from '../../../../styles/paletteV3'
import {Layout} from '../../../../types/constEnums'
import Legitity from '../../../../validation/Legitity'
import {AddIntegrationProviderMutationResponse} from '../../../../__generated__/AddIntegrationProviderMutation.graphql'

interface Props {
  viewerRef: MattermostPanel_viewer$key
  teamId: string
}

const StyledIcon = styled('div')({
  color: PALETTE.SLATE_600,
  height: 24,
  width: 24,
  marginLeft: 4,
  ':hover': {
    cursor: 'pointer'
  }
})

const MattermostPanelStyles = styled('div')({
  borderTop: `1px solid ${PALETTE.SLATE_300}`,
  padding: Layout.ROW_GUTTER
})

const ConnectionGroup = styled('div')({
  alignItems: 'center',
  display: 'flex',
  paddingBottom: 16
})

const Heading = styled(LabelHeading)({
  width: '100%'
})

const Row = styled('div')({
  alignItems: 'center',
  display: 'flex',
  padding: '8px 0'
})

const Label = styled('span')({
  fontSize: 14,
  marginRight: 16,
  width: '100%',
  position: 'relative',
  alignItems: 'center',
  display: 'flex'
})

const StyledButton = styled(FlatButton)({
  borderColor: PALETTE.SLATE_400,
  color: PALETTE.SLATE_700,
  fontSize: 12,
  fontWeight: 600,
  minWidth: 36,
  marginLeft: '16px',
  marginRight: '16px'
})

const MattermostPanel = (props: Props) => {
  const {teamId, viewerRef} = props

  const {t} = useTranslation()

  const viewer = useFragment(
    graphql`
      fragment MattermostPanel_viewer on User {
        teamMember(teamId: $teamId) {
          integrations {
            mattermost {
              auth {
                provider {
                  id
                  webhookUrl
                }
              }
            }
          }
        }
      }
    `,
    viewerRef
  )
  const {teamMember} = viewer
  const {integrations} = teamMember!
  const {mattermost} = integrations
  const {auth} = mattermost
  const activeProvider = auth?.provider
  const atmosphere = useAtmosphere()

  // corner case: let them re-upsert the same webhook url when reverting to a previous value
  const serverWebhookUrl = activeProvider?.webhookUrl ?? ''
  const {validateField, setDirtyField, onChange, fields} = useForm({
    webhookUrl: {
      getDefault: () => serverWebhookUrl,
      validate: (rawInput: string) => {
        return new Legitity(rawInput).test((maybeUrl) => {
          if (!maybeUrl) return t('MattermostPanel.NoLinkProvided')
          const links = linkify.match(maybeUrl)
          return !links ? t('MattermostPanel.NotLookingTooLinky') : ''
        })
      }
    }
  })

  const {
    submitting,
    onError,
    error: mutationError,
    onCompleted,
    submitMutation
  } = useMutationProps()

  const {error: fieldError, value: fieldValue} = fields.webhookUrl
  const isUpdateDisabled = (error?: string, value?: any) =>
    !!error || submitting || !value || (value === serverWebhookUrl && !mutationError)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const {error, value: webhookUrl} = validateField('webhookUrl')
    if (isUpdateDisabled(error, webhookUrl)) return
    setDirtyField()
    submitMutation()
    if (activeProvider) {
      UpdateIntegrationProviderMutation(
        atmosphere,
        {
          provider: {
            id: activeProvider.id,
            scope: 'team',
            webhookProviderMetadataInput: {
              webhookUrl
            }
          }
        },
        {onError, onCompleted}
      )
    } else {
      const handleCompleted = (res: AddIntegrationProviderMutationResponse) => {
        const {addIntegrationProvider} = res
        const {provider} = addIntegrationProvider
        if (!provider) return
        const {id: providerId} = provider
        AddTeamMemberIntegrationAuthMutation(
          atmosphere,
          {providerId, teamId},
          {onError, onCompleted}
        )
      }

      AddIntegrationProviderMutation(
        atmosphere,
        {
          input: {
            scope: 'team',
            service: 'mattermost',
            teamId,
            authStrategy: 'webhook',
            webhookProviderMetadataInput: {
              webhookUrl
            }
          }
        },
        {onError, onCompleted: handleCompleted}
      )
    }
  }

  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLDivElement>(
    MenuPosition.LOWER_CENTER
  )

  return (
    <MattermostPanelStyles>
      <ConnectionGroup>
        <Heading>{t('MattermostPanel.Connection')}</Heading>
      </ConnectionGroup>
      <form onSubmit={onSubmit}>
        <Row>
          <Label>
            {t('MattermostPanel.MattermostWebhook')}
            <StyledIcon onMouseOver={openTooltip} onMouseOut={closeTooltip} ref={originRef}>
              <InfoIcon />
            </StyledIcon>
          </Label>
          {tooltipPortal(
            t('MattermostPanel.ConfigureInMattermostMainMenuIntegrationsIncomingWebhook')
          )}
          <BasicInput
            value={fields.webhookUrl.value}
            error=''
            onChange={onChange}
            name='webhookUrl'
            placeholder={t('MattermostPanel.EnterYourWebhookUrlHere')}
          />
          <StyledButton size='medium' disabled={isUpdateDisabled(fieldError, fieldValue)}>
            {t('MattermostPanel.Update')}
          </StyledButton>
        </Row>
        {fieldError && <StyledError>{fieldError}</StyledError>}
        {!fieldError && mutationError && <StyledError>{mutationError.message}</StyledError>}
      </form>
    </MattermostPanelStyles>
  )
}

export default MattermostPanel
