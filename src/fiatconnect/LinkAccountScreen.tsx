import { RouteProp } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { SafeAreaView, StyleSheet, Text } from 'react-native'
import { FiatExchangeEvents } from 'src/analytics/Events'
import ValoraAnalytics from 'src/analytics/ValoraAnalytics'
import BackButton from 'src/components/BackButton'
import Button, { BtnSizes, BtnTypes } from 'src/components/Button'
import FiatConnectQuote from 'src/fiatExchanges/quotes/FiatConnectQuote'
import { CICOFlow } from 'src/fiatExchanges/utils'
import i18n from 'src/i18n'
import { emptyHeader } from 'src/navigator/Headers'
import { navigate } from 'src/navigator/NavigationService'
import { Screens } from 'src/navigator/Screens'
import { StackParamList } from 'src/navigator/types'
import fontStyles from 'src/styles/fonts'

type Props = StackScreenProps<StackParamList, Screens.FiatConnectLinkAccount>

export default function FiatConnectLinkAccountScreen({ route }: Props) {
  const { quote, flow } = route.params
  return <LinkAccountSection quote={quote} flow={flow} />
}

export function LinkAccountSection(props: {
  quote: FiatConnectQuote
  flow: CICOFlow
  disabled?: boolean
}) {
  const { t } = useTranslation()
  const { quote, flow, disabled } = props

  const onPressContinue = () => {
    ValoraAnalytics.track(FiatExchangeEvents.cico_fc_link_account_continue, {
      flow,
      provider: quote.getProviderId(),
      fiatAccountSchema: quote.getFiatAccountSchema(),
    })
    navigate(Screens.FiatDetailsScreen, { quote, flow })
  }

  const onPressProvider = () => {
    ValoraAnalytics.track(FiatExchangeEvents.cico_fc_link_account_provider_website, {
      flow,
      provider: quote.getProviderId(),
      fiatAccountSchema: quote.getFiatAccountSchema(),
      page: 'home',
    })
    navigate(Screens.WebViewScreen, { uri: quote.getProviderWebsiteUrl() })
  }

  const onPressTermsAndConditions = () => {
    ValoraAnalytics.track(FiatExchangeEvents.cico_fc_link_account_provider_website, {
      flow,
      provider: quote.getProviderId(),
      fiatAccountSchema: quote.getFiatAccountSchema(),
      page: 'termsAndConditions',
    })
    navigate(Screens.WebViewScreen, { uri: quote.getProviderTermsAndConditionsUrl() })
  }

  const onPressPrivacyPolicy = () => {
    ValoraAnalytics.track(FiatExchangeEvents.cico_fc_link_account_provider_website, {
      flow,
      provider: quote.getProviderId(),
      fiatAccountSchema: quote.getFiatAccountSchema(),
      page: 'privacyPolicy',
    })
    navigate(Screens.WebViewScreen, { uri: quote.getProviderPrivacyPolicyUrl() })
  }

  return (
    <SafeAreaView style={styles.content}>
      <Text style={styles.title}>{t('fiatConnectLinkAccountScreen.bankAccount.bodyTitle')}</Text>
      <Text testID="descriptionText" style={styles.description}>
        <Trans
          i18nKey={'fiatConnectLinkAccountScreen.bankAccount.description'}
          values={{ providerName: quote.getProviderName() }}
        >
          <Text testID="providerNameText" style={styles.providerLink} onPress={onPressProvider} />
          <Text
            testID="termsAndConditionsText"
            style={styles.providerLink}
            onPress={onPressTermsAndConditions}
          />
          <Text
            testID="privacyPolicyText"
            style={styles.providerLink}
            onPress={onPressPrivacyPolicy}
          />
        </Trans>
      </Text>
      <Button
        style={styles.button}
        testID="continueButton"
        onPress={onPressContinue}
        text={t('fiatConnectLinkAccountScreen.continue')}
        type={BtnTypes.PRIMARY}
        size={BtnSizes.MEDIUM}
        disabled={disabled}
      />
    </SafeAreaView>
  )
}

FiatConnectLinkAccountScreen.navigationOptions = ({
  route,
}: {
  route: RouteProp<StackParamList, Screens.FiatConnectLinkAccount>
}) => ({
  ...emptyHeader,
  headerLeft: () => (
    <BackButton
      eventName={FiatExchangeEvents.cico_fc_link_account_back}
      eventProperties={{
        flow: route.params.flow,
        provider: route.params.quote.getProviderId(),
        fiatAccountSchema: route.params.quote.getFiatAccountSchema(),
      }}
    />
  ),
  // NOTE: title should be dynamic when we support multiple fiat account types
  headerTitle: i18n.t('fiatConnectLinkAccountScreen.bankAccount.header'),
})

const styles = StyleSheet.create({
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
  button: {
    marginTop: 12,
  },
  providerLink: {
    textDecorationLine: 'underline',
  },
})
