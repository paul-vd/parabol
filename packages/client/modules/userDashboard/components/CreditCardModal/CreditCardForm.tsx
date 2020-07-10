import styled from '@emotion/styled'
import React, {useEffect, useState} from 'react'
import PlainButton from '../../../../components/PlainButton/PlainButton'
import PrimaryButton from '../../../../components/PrimaryButton'
import UpgradeCreditCardFormField from '../../../../components/UpgradeCreditCardFormField'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useForm from '../../../../hooks/useForm'
import useMutationProps from '../../../../hooks/useMutationProps'
import useScript from '../../../../hooks/useScript'
import useSegmentTrack from '../../../../hooks/useSegmentTrack'
import UpdateCreditCardMutation from '../../../../mutations/UpdateCreditCardMutation'
import UpgradeToProMutation from '../../../../mutations/UpgradeToProMutation'
import StripeClientManager, {StripeError} from '../../../../utils/StripeClientManager'
import CreditCardErrorLine from './CreditCardErrorLine'
import {CreditCardModalActionType} from './CreditCardModal'
import CreditCardPricingLine from './CreditCardPricingLine'
import {createRefetchContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'

const Form = styled('form')({
  borderRadius: 2,
  display: 'flex',
  flexDirection: 'column',
  padding: '8px 24px 24px',
  // required to clip 0 border radius for input
  overflow: 'hidden',
  width: '100%'
})

const CreditCardNumber = styled(UpgradeCreditCardFormField)({
  marginBottom: 8
})

const CardDetails = styled('div')({
  display: 'flex'
})

const CardExpiry = styled(UpgradeCreditCardFormField)({
  marginRight: 8
})

const CardCvc = styled(UpgradeCreditCardFormField)({})

const ButtonGroup = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  paddingTop: 8,
  width: '100%'
})

const UpgradeButton = styled(PrimaryButton)({
  flexGrow: 1
})

const UpgradeLaterButton = styled(PlainButton)({
  fontSize: 14,
  paddingLeft: 8,
  paddingRight: 8
})

const paramToInputLookup = {
  exp_year: 'expiry',
  exp_month: 'expiry',
  number: 'creditCardNumber',
  cvc: 'cvc'
}

const CTALabel = {
  update: 'Update',
  upgrade: 'Upgrade',
  squeeze: 'Upgrade Now'
}

interface Props {
  activeUserCount?: number
  actionType: CreditCardModalActionType
  orgId: string
  onSuccess?: () => void
  onLater?: (e: React.FormEvent) => void
  invoiceListRefetch?: (refetchVariables: {}) => void
}

const CreditCardForm = (props: Props) => {
  const {activeUserCount, actionType, onSuccess, onLater, orgId, invoiceListRefetch} = props
  const atmosphere = useAtmosphere()
  const isStripeLoaded = useScript('https://js.stripe.com/v2/')
  const [stripeClientManager] = useState(() => new StripeClientManager())
  const {submitting, submitMutation, onError, error, onCompleted} = useMutationProps()
  const {fields, onChange, setDirtyField, validateField} = useForm({
    creditCardNumber: {
      getDefault: () => '',
      normalize: stripeClientManager.normalizeCardNumber,
      validate: stripeClientManager.validateCardNumber
    },
    cvc: {
      getDefault: () => '',
      normalize: stripeClientManager.normalizeCVC,
      validate: stripeClientManager.validateCVC
    },
    expiry: {
      getDefault: () => '',
      normalize: stripeClientManager.normalizeExpiry,
      validate: stripeClientManager.validateExpiry
    }
  })
  useSegmentTrack('Credit Card Modal Opened', {actionType})

  useEffect(() => {
    if (isStripeLoaded) {
      stripeClientManager.init()
    }
  }, [isStripeLoaded])

  const handleError = (param: string, fallback = 'Invalid details') => {
    const inputField = paramToInputLookup[param]
    if (inputField) {
      fields[inputField].setError(StripeError[inputField])
    } else {
      onError(new Error(fallback))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setDirtyField()
    validateField()
    if (
      Object.keys(fields)
        .map((name) => fields[name].error)
        .filter(Boolean).length !== 0
    )
      return
    submitMutation()
    const [expMonth, expYear] = fields.expiry.value.split('/')
    const {error, id: stripeToken} = await stripeClientManager.createToken({
      number: fields.creditCardNumber.value,
      exp_month: expMonth,
      exp_year: expYear,
      cvc: fields.cvc.value
    })
    if (error) {
      handleError(error.param!)
      return
    }

    const handleCompleted = (data) => {
      const [mutationName] = Object.keys(data)
      const {error} = data[mutationName]
      console.log(data[mutationName])
      onCompleted()
      if (error) {
        handleError(error.message, error.message)
        return
      }

      const refetchVariables = {
        orgId: orgId,
        first: 3
      }

      if (invoiceListRefetch) {
        console.log('WE ARE REFETCHING')
        invoiceListRefetch(refetchVariables)
      }

      if (onSuccess) {
        onSuccess()
      }
    }

    if (actionType === 'update') {
      UpdateCreditCardMutation(atmosphere, orgId, stripeToken, onError, handleCompleted)
    } else {
      UpgradeToProMutation(
        atmosphere,
        {orgId, stripeToken},
        {onError, onCompleted: handleCompleted}
      )
    }
  }

  return (
    <>
      <CreditCardErrorLine
        stripeClientManager={stripeClientManager}
        fields={fields as any}
        serverError={error ? error.message : undefined}
      />
      <Form onSubmit={handleSubmit}>
        <CreditCardNumber
          {...fields.creditCardNumber}
          autoComplete='cc-number'
          autoFocus
          iconName='credit_card'
          maxLength={20}
          name={'creditCardNumber'}
          onBlur={() => setDirtyField('creditCardNumber')}
          onChange={onChange}
          placeholder='Card number'
        />
        <CardDetails>
          <CardExpiry
            {...fields.expiry}
            autoComplete='cc-exp'
            iconName='date_range'
            maxLength={5}
            name={'expiry'}
            onChange={onChange}
            onBlur={() => setDirtyField('expiry')}
            placeholder='MM/YY'
          />
          <CardCvc
            {...fields.cvc}
            autoComplete='cc-csc'
            iconName={'lock'}
            name={'cvc'}
            maxLength={5}
            onBlur={() => setDirtyField('cvc')}
            onChange={onChange}
            placeholder='CVC'
          />
        </CardDetails>
        <CreditCardPricingLine activeUserCount={activeUserCount} actionType={actionType} />
        <ButtonGroup>
          {actionType === 'squeeze' && (
            <UpgradeLaterButton onClick={onLater}>Upgrade Later</UpgradeLaterButton>
          )}
          <UpgradeButton size='medium' onClick={handleSubmit} waiting={submitting} type={'submit'}>
            {CTALabel[actionType]}
          </UpgradeButton>
        </ButtonGroup>
      </Form>
    </>
  )
}

export default CreditCardForm
