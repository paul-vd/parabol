import styled from '@emotion/styled'
import React, {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {PALETTE} from '../styles/paletteV3'
import {Card} from '../types/constEnums'

const StyledLink = styled('a')({
  color: PALETTE.SLATE_700,
  display: 'block',
  fontSize: Card.FONT_SIZE,
  lineHeight: '1.25rem',
  padding: `0 ${Card.PADDING}`,
  textDecoration: 'underline',
  '&:hover,:focus': {
    textDecoration: 'underline'
  }
})

interface Props {
  className?: string
  dataCy?: string
  cloudName: string
  issueKey: string
  projectKey: string
  children?: ReactNode
  showLabelPrefix?: boolean
}

const JiraIssueLink = (props: Props) => {
  const {
    dataCy,
    className,
    cloudName,
    issueKey,
    projectKey,
    children,
    showLabelPrefix = true
  } = props

  const {t} = useTranslation()

  const href =
    cloudName === 'jira-demo'
      ? 'https://www.parabol.co/features/integrations'
      : t('JiraIssueLink.HttpsCloudNameAtlassianNetBrowseIssueKey', {
          cloudName,
          issueKey
        })
  return (
    <StyledLink
      className={className}
      data-cy={dataCy}
      href={href}
      rel='noopener noreferrer'
      target='_blank'
      title={t('JiraIssueLink.JiraIssueIssueKeyOnProjectKey', {
        issueKey,
        projectKey
      })}
    >
      {t('JiraIssueLink.ShowLabelPrefixIssueIssueKey', {
        showLabelPrefixIssue: showLabelPrefix ? 'Issue #' : '',
        issueKey
      })}
      {children}
    </StyledLink>
  )
}

export default JiraIssueLink
