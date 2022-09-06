import React from 'react'
import {useTranslation} from 'react-i18next'
import {emailCopyStyle, emailLinkStyle, emailProductTeamSignature} from '../styles'
import EmailBlock from './EmailBlock/EmailBlock'
import EmailFooter from './EmailFooter/EmailFooter'
import EmptySpace from './EmptySpace/EmptySpace'
import Header from './Header/Header'
import Layout from './Layout/Layout'

const innerMaxWidth = 480

const listItemStyle = {
  ...emailCopyStyle,
  margin: 0
}

export interface UpcomingInvoiceEmailProps {
  appOrigin: string
  memberUrl: string
  periodEndStr: string
  newUsers: {email: string; name: string}[]
}

const UpcomingInvoiceEmail = (props: UpcomingInvoiceEmailProps) => {
  const {appOrigin, periodEndStr, newUsers, memberUrl} = props

  //FIXME i18n: Organization Settings
  const {t} = useTranslation()

  return (
    <Layout maxWidth={544}>
      <EmailBlock innerMaxWidth={innerMaxWidth}>
        <Header appOrigin={appOrigin} />
        <p style={emailCopyStyle}>{t('UpcomingInvoiceEmail.Hello,')}</p>
        <p style={emailCopyStyle}>
          {`Your teams have added the following users to your organization for the billing cycle ending on ${periodEndStr}.`}
        </p>
        <ul>
          {newUsers.map((newUser) => (
            <li key={newUser.email} style={listItemStyle}>
              <b>{`${newUser.name}`}</b>
              {t('UpcomingInvoiceEmail.(')}
              <a href={`mailto:${newUser.email}`} style={emailLinkStyle}>{`${newUser.email}`}</a>
              {t('UpcomingInvoiceEmail.)')}
            </li>
          ))}
        </ul>
        <p style={emailCopyStyle}>
          {t('UpcomingInvoiceEmail.IfAnyOfTheseUsersWereAddedByMistakeSimplyRemoveThemUnder:')}
          <a href={memberUrl} style={emailLinkStyle} title='Organization Settings'>
            {t('UpcomingInvoiceEmail.OrganizationSettings')}
          </a>
        </p>
        <p style={emailCopyStyle}>
          {t('UpcomingInvoiceEmail.GetInTouchIfWeCanHelpInAnyWay,')}
          <br />
          {emailProductTeamSignature}
          <br />
          <a href='mailto:love@parabol.co' style={emailLinkStyle} title='love@parabol.co'>
            {t('UpcomingInvoiceEmail.LoveParabolCo')}
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

export default UpcomingInvoiceEmail
