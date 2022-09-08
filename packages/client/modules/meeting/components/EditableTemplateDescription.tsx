import styled from '@emotion/styled'
import React from 'react'
import {useTranslation} from 'react-i18next'
import EditableText from '../../../components/EditableText'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import ReflectTemplatePromptUpdateDescriptionMutation from '../../../mutations/ReflectTemplatePromptUpdateDescriptionMutation'
import Legitity from '../../../validation/Legitity'

interface Props {
  isOwner: boolean
  description: string
  promptId: string
  onEditingChange: (isEditing: boolean) => void
}

const EditableSubText = styled(EditableText)({
  fontSize: 12,
  lineHeight: '24px'
})

const EditableTemplateDescription = (props: Props) => {
  const {isOwner, description, promptId, onEditingChange} = props

  const {t} = useTranslation()

  const atmosphere = useAtmosphere()
  const {onError, error, onCompleted, submitMutation, submitting} = useMutationProps()

  const handleSubmit = (rawQuestion) => {
    if (submitting) return
    const {error, value: description = ''} = validate(rawQuestion)
    if (error) return
    submitMutation()
    ReflectTemplatePromptUpdateDescriptionMutation(
      atmosphere,
      {promptId, description},
      {onError, onCompleted}
    )
  }

  const legitify = (value: string) => {
    return new Legitity(value)
      .trim()
      .max(256, t('EditableTemplateDescription.ThatDescriptionIsProbablyLongEnough'))
  }

  const validate = (rawValue: string) => {
    const res = legitify(rawValue)
    if (res.error) {
      onError(new Error(res.error))
    } else {
      onCompleted()
    }
    return res
  }

  const onEditChange = (isEditing: boolean) => {
    onEditingChange && onEditingChange(isEditing)
  }

  return (
    <EditableSubText
      disabled={!isOwner}
      error={error?.message}
      hideIcon
      handleSubmit={handleSubmit}
      initialValue={description}
      maxLength={256}
      validate={validate}
      placeholder={t('EditableTemplateDescription.Description')}
      onEditingChange={onEditChange}
    />
  )
}

export default EditableTemplateDescription
