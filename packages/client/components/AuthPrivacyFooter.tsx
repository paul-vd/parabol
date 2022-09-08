import styled from '@emotion/styled'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {PALETTE} from '../styles/paletteV3'

const color = PALETTE.SKY_500

const Link = styled('a')({
  color,
  marginTop: '1rem',
  textAlign: 'center',
  ':hover,:focus,:active': {
    color,
    textDecoration: 'underline'
  }
})

const FooterCopy = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 11,
  lineHeight: '24px',
  marginTop: 8,
  textAlign: 'center'
})

const AuthPrivacyFooter = () => {
  const {t} = useTranslation()

  return (
    <FooterCopy>
      {t('AuthPrivacyFooter.ByCreatingAnAccountYouAgreeToOur')}
      <Link
        href='https://www.parabol.co/privacy'
        rel='noopener noreferrer'
        target='_blank'
        title={t('AuthPrivacyFooter.PrivacyPolicy')}
      >
        {t('AuthPrivacyFooter.PrivacyPolicy')}
      </Link>
      .
    </FooterCopy>
  )
}

export default AuthPrivacyFooter
