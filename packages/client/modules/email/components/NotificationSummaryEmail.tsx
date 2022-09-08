import {ContactInfo, ExternalLinks} from 'parabol-client/types/constEnums'
import plural from 'parabol-client/utils/plural'
import React from 'react'
import {useTranslation} from 'react-i18next'
import makeAppURL from '../../../utils/makeAppURL'
import {emailCopyStyle, emailLinkStyle} from '../styles'
import Button from './Button'
import EmailBlock from './EmailBlock/EmailBlock'
import EmailFooter from './EmailFooter/EmailFooter'
import EmptySpace from './EmptySpace/EmptySpace'
import Header from './Header/Header'
import Layout from './Layout/Layout'

const innerMaxWidth = 480

const copyStyle = {
  ...emailCopyStyle
}

const linkStyle = {
  ...emailCopyStyle,
  ...emailLinkStyle
}

export interface NotificationSummaryProps {
  appOrigin: string
  preferredName: string
  notificationCount: number
}
export default function NotificationSummaryEmail(props: NotificationSummaryProps) {
  const {appOrigin, notificationCount, preferredName} = props

  const {t} = useTranslation()

  const tasksURL = makeAppURL(appOrigin, 'me/tasks')
  return (
    <Layout maxWidth={544}>
      <EmailBlock innerMaxWidth={innerMaxWidth}>
        <Header appOrigin={appOrigin} />
        <p style={copyStyle}>
          {t('NotificationSummaryEmail.HiPreferredName', {
            preferredName
          })}
        </p>
        <p style={copyStyle}>
          {t('NotificationSummaryEmail.YouHave')}
          <span style={{fontWeight: 600}}>
            {t('NotificationSummaryEmail.NotificationCountNewPluralNotificationCountNotification', {
              notificationCount,
              pluralNotificationCountNotification: plural(notificationCount, 'notification')
            })}
          </span>
          {t('NotificationSummaryEmail.SeeWhatsChangedWithYourTeams')}
        </p>
        <Button url={tasksURL}>{t('NotificationSummaryEmail.SeeMyDashboard')}</Button>
        <EmptySpace height={24} />
        <p style={copyStyle}>
          {t('NotificationSummaryEmail.IfYouNeedAnythingFromUsDontHesitateToReachOutAt')}
          <a
            style={linkStyle}
            href={t('NotificationSummaryEmail.MailtoContactInfoEmailLove', {
              contactInfoEmailLove: ContactInfo.EMAIL_LOVE
            })}
          >
            {ContactInfo.EMAIL_LOVE}
          </a>
          {'.'}
        </p>
        <p style={copyStyle}>
          {t('NotificationSummaryEmail.HaveFunDoGreatWork')}
          <br />
          {'- '}
          <a style={linkStyle} href={ExternalLinks.TEAM}>
            {t('NotificationSummaryEmail.ParabolTeam')}
          </a>
        </p>
        <EmptySpace height={16} />
      </EmailBlock>
      <EmailBlock hasBackgroundColor innerMaxWidth={innerMaxWidth}>
        <EmailFooter />
      </EmailBlock>
    </Layout>
  )
}
