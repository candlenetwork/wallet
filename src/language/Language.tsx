import { StackScreenProps, TransitionPresets } from '@react-navigation/stack'
import { localesList } from 'locales'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, ListRenderItemInfo, ScrollView, StyleSheet, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SettingsEvents } from 'src/analytics/Events'
import ValoraAnalytics from 'src/analytics/ValoraAnalytics'
import SelectionOption from 'src/components/SelectionOption'
import useChangeLanguage from 'src/i18n/useChangeLanguage'
import { emptyHeader, headerWithBackButton } from 'src/navigator/Headers'
import { navigate } from 'src/navigator/NavigationService'
import { Screens } from 'src/navigator/Screens'
import { StackParamList } from 'src/navigator/types'
import fontStyles from 'src/styles/fonts'

type ScreenProps = StackScreenProps<StackParamList, Screens.Language | Screens.LanguageModal>
type Props = ScreenProps

interface Language {
  code: string
  name: string
}

function keyExtractor(item: Language) {
  return item.code
}

function LanguageScreen({ route }: Props) {
  const changeLanguage = useChangeLanguage()
  const { t, i18n } = useTranslation()
  const nextScreen = route.params?.nextScreen

  const onSelect = (language: string, code: string) => {
    void changeLanguage(code)
    // Wait for next frame before navigating
    // so the user can see the changed selection briefly
    requestAnimationFrame(() => {
      navigate(nextScreen || Screens.OnboardingEducationScreen)
    })

    ValoraAnalytics.track(SettingsEvents.language_select, { language: code })
  }

  const renderItem = ({ item: language }: ListRenderItemInfo<Language>) => {
    return (
      <SelectionOption
        // nextScreen is not set when the language screen is the first seen in the app
        // for when the best language couldn't be determined
        hideCheckboxes={!nextScreen}
        text={language.name}
        key={language.code}
        onSelect={onSelect}
        isSelected={language.code === i18n.language}
        data={language.code}
        testID={`ChooseLanguage/${language.code}`}
      />
    )
  }

  return (
    <ScrollView style={styles.container}>
      <SafeAreaView edges={['bottom']}>
        <Text style={styles.title} testID={'ChooseLanguageTitle'}>
          {t('selectLanguage')}
        </Text>
        <FlatList
          data={localesList}
          extraData={i18n.language}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
        />
      </SafeAreaView>
    </ScrollView>
  )
}

LanguageScreen.navigationOptions =
  (withAnimation: boolean) =>
  ({ navigation }: ScreenProps) => {
    return navigation.canGoBack()
      ? {
          ...headerWithBackButton,
          ...(withAnimation ? TransitionPresets.ModalTransition : {}),
        }
      : emptyHeader
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    ...fontStyles.h2,
    margin: 16,
  },
})

export default LanguageScreen
