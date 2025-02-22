import { TouchableOpacity } from '@gorhom/bottom-sheet'
import { RouteProp } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  Dimensions,
  LayoutChangeEvent,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useDispatch } from 'react-redux'
import Persona from 'src/account/Persona'
import { KycStatus } from 'src/account/reducer'
import { CICOEvents, FiatExchangeEvents } from 'src/analytics/Events'
import ValoraAnalytics from 'src/analytics/ValoraAnalytics'
import { PRIVACY_LINK } from 'src/brandingConfig'
import BackButton from 'src/components/BackButton'
import { LinkAccountSection } from 'src/fiatconnect/LinkAccountScreen'
import { selectFiatConnectQuote } from 'src/fiatconnect/slice'
import FiatConnectQuote from 'src/fiatExchanges/quotes/FiatConnectQuote'
import { CICOFlow } from 'src/fiatExchanges/utils'
import i18n from 'src/i18n'
import CheckBox from 'src/icons/CheckBox'
import GreyOut from 'src/icons/GreyOut'
import { emptyHeader } from 'src/navigator/Headers'
import { navigate } from 'src/navigator/NavigationService'
import { Screens } from 'src/navigator/Screens'
import { StackParamList } from 'src/navigator/types'
import Colors from 'src/styles/colors'
import fontStyles from 'src/styles/fonts'
import { navigateToURI } from 'src/utils/linking'

export interface Props {
  quote: FiatConnectQuote
  flow: CICOFlow
  step: 'one' | 'two'
  personaKycStatus?: KycStatus
}

export default function KycLanding(props: StackScreenProps<StackParamList, Screens.KycLanding>) {
  const { quote, flow, step, personaKycStatus } = props.route.params
  return (
    <ScrollView>
      <StepOne disabled={step !== 'one'} personaKycStatus={personaKycStatus} quote={quote} />
      <StepTwo quote={quote} flow={flow} disabled={step !== 'two'} />
    </ScrollView>
  )
}

KycLanding.navigationOptions = ({
  route,
}: {
  route: RouteProp<StackParamList, Screens.KycLanding>
}) => ({
  ...emptyHeader,
  headerLeft: () => (
    <BackButton
      eventName={FiatExchangeEvents.cico_fc_link_kyc_account_back}
      eventProperties={{
        flow: route.params.flow,
        provider: route.params.quote.getProviderId(),
        fiatAccountSchema: route.params.quote.getFiatAccountSchema(),
        step: route.params.step,
      }}
    />
  ),
  // NOTE: title should be dynamic when we support multiple fiat account types
  headerTitle: i18n.t('fiatConnectLinkAccountScreen.bankAccount.header'),
})

const useComponentSize = (): [
  { width: number; height: number },
  (event: LayoutChangeEvent) => void
] => {
  const { width, height } = Dimensions.get('window')
  const [size, setSize] = useState({
    height,
    width,
  })

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout
    setSize({ width, height })
  }, [])

  return [size, onLayout]
}

function StepOne(props: {
  disabled: boolean
  personaKycStatus?: KycStatus
  quote: FiatConnectQuote
}) {
  const { t } = useTranslation()
  const { disabled, personaKycStatus, quote } = props
  const [size, onLayout] = useComponentSize()
  return (
    <View onLayout={onLayout} style={styles.stepOne}>
      {disabled && <GreyOut testID="step-one-grey" {...size} />}
      <Text style={styles.stepText}>{t('fiatConnectKycLandingScreen.stepOne')}</Text>
      <KycAgreement personaKycStatus={personaKycStatus} quote={quote} />
    </View>
  )
}

function StepTwo(props: { quote: FiatConnectQuote; flow: CICOFlow; disabled: boolean }) {
  const { quote, flow, disabled } = props
  const { t } = useTranslation()
  const [size, onLayout] = useComponentSize()
  return (
    <View onLayout={onLayout} style={styles.stepTwo}>
      {disabled && <GreyOut testID="step-two-grey" {...size} />}
      <Text style={styles.stepText}>{t('fiatConnectKycLandingScreen.stepTwo')}</Text>
      <LinkAccountSection quote={quote} flow={flow} disabled={disabled} />
    </View>
  )
}

export function KycAgreement(props: { personaKycStatus?: KycStatus; quote: FiatConnectQuote }) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { personaKycStatus, quote } = props
  const [agreementChecked, toggleAgreementChecked] = useState(false)

  const onPressPrivacyPolicy = () => {
    navigateToURI(PRIVACY_LINK)
  }

  const personaSuccessCallback = () => {
    // optimistically navigate to step 2 to reduce flash
    // The subsequent saga may direct the user elsewhere if there is an error or edge case
    navigate(Screens.KycLanding, {
      quote,
      flow: quote.flow,
      step: 'two',
    })
    dispatch(selectFiatConnectQuote({ quote })) // continue with flow through saga
  }

  return (
    <SafeAreaView style={styles.content}>
      <Text style={styles.title}>{t('fiatConnectKycLandingScreen.title')}</Text>
      <Text testID="descriptionText" style={styles.description}>
        {t('fiatConnectKycLandingScreen.description')}
      </Text>
      <View style={styles.consentContainer}>
        <TouchableOpacity
          onPress={() => toggleAgreementChecked(!agreementChecked)}
          style={styles.checkBoxContainer}
        >
          <CheckBox testID="checkbox" checked={agreementChecked} />
        </TouchableOpacity>
        <Text style={styles.disclaimer}>
          <Trans i18nKey={'fiatConnectKycLandingScreen.disclaimer'}>
            <Text
              testID="providerNameText"
              style={styles.privacyLink}
              onPress={onPressPrivacyPolicy}
            />
          </Trans>
        </Text>
      </View>
      <Persona
        text={t('fiatConnectKycLandingScreen.button')}
        kycStatus={personaKycStatus}
        disabled={!agreementChecked}
        onPress={() => {
          ValoraAnalytics.track(CICOEvents.persona_kyc_start)
        }}
        onSuccess={personaSuccessCallback}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  stepOne: {
    alignItems: 'center',
    paddingVertical: 48,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray2,
  },
  stepTwo: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  stepText: {
    ...fontStyles.notificationHeadline,
    textAlign: 'center',
    marginBottom: 12,
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...fontStyles.h2,
    marginHorizontal: 16,
  },
  description: {
    ...fontStyles.regular,
    textAlign: 'center',
    marginVertical: 12,
    marginHorizontal: 24,
  },
  disclaimer: {
    color: Colors.gray5,
    textAlign: 'left',
    marginLeft: 11,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  privacyLink: {
    textDecorationLine: 'underline',
  },
  consentContainer: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: 27,
    marginBottom: 12,
  },
  checkBoxContainer: {
    marginTop: 3,
  },
})
