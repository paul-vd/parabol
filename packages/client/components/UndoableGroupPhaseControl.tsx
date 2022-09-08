import styled from '@emotion/styled'
import {Edit} from '@mui/icons-material'
import React from 'react'
import {useTranslation} from 'react-i18next'
import FlatButton from '~/components/FlatButton'
import useAtmosphere from '~/hooks/useAtmosphere'
import useHotkey from '~/hooks/useHotkey'
import useModal from '~/hooks/useModal'
import ResetRetroMeetingToGroupStageMutation from '~/mutations/ResetRetroMeetingToGroupStageMutation'
import lazyPreload from '~/utils/lazyPreload'

interface Props {
  meetingId: string
}

const StyledButton = styled(FlatButton)({
  fontWeight: 600,
  height: 28,
  marginLeft: 16,
  padding: 0
})

const StyledIcon = styled(Edit)({
  marginRight: 4
})

const UndoableGroupPhaseDialog = lazyPreload(
  () => import(/* webpackChunkName: 'UndoableGroupPhaseDialog' */ './UndoableGroupPhaseDialog')
)

const UndoableGroupPhaseControl = (props: Props) => {
  const {meetingId} = props

  const {t} = useTranslation()

  const {togglePortal: toggleModal, closePortal: closeModal, modalPortal} = useModal()
  const atmosphere = useAtmosphere()
  useHotkey(t('UndoableGroupPhaseControl.IDIDNTMEANTO'), () => {
    console.log('didntmean')
    ResetRetroMeetingToGroupStageMutation(atmosphere, {meetingId})
  })
  return (
    <>
      <StyledButton onClick={toggleModal} palette={t('UndoableGroupPhaseControl.Blue')}>
        <StyledIcon />
        {t('UndoableGroupPhaseControl.EditGroups')}
      </StyledButton>
      {modalPortal(<UndoableGroupPhaseDialog closePortal={closeModal} meetingId={meetingId} />)}
    </>
  )
}

export default UndoableGroupPhaseControl
