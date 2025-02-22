import { stringToBoolean } from '@celo/utils/lib/parsing'
import { Network } from '@fiatconnect/fiatconnect-types'
import BigNumber from 'bignumber.js'
import Config from 'react-native-config'
import { CachesDirectoryPath } from 'react-native-fs'
import { SpendMerchant } from 'src/fiatExchanges/Spend'
import { LoggerLevel } from 'src/utils/LoggerLevels'
// eslint-disable-next-line import/no-relative-packages
import * as secretsFile from '../secrets.json'
import { ONE_HOUR_IN_MILLIS } from './utils/time'

export * from 'src/brandingConfig'

// extract secrets from secrets.json
const keyOrUndefined = (file: any, secretsKey: any, attribute: any) => {
  if (secretsKey in file) {
    if (attribute in file[secretsKey]) {
      return file[secretsKey][attribute]
    }
  }
  return undefined
}

// DEV only related settings
export const isE2EEnv = stringToBoolean(Config.IS_E2E || 'false')
export const DEV_RESTORE_NAV_STATE_ON_RELOAD = stringToBoolean(
  Config.DEV_RESTORE_NAV_STATE_ON_RELOAD || 'false'
)
export const DEV_SETTINGS_ACTIVE_INITIALLY = stringToBoolean(
  Config.DEV_SETTINGS_ACTIVE_INITIALLY || 'false'
)

// VALUES
export const GAS_INFLATION_FACTOR = 1.5 // Used when estimating gas for txs
export const GAS_PRICE_INFLATION_FACTOR = 5 // Used when getting gas price, must match what Geth does
export const BALANCE_OUT_OF_SYNC_THRESHOLD = 1 * 60 // 1 minute
export const ALERT_BANNER_DURATION = 5000
export const NUMBER_INPUT_MAX_DECIMALS = 2
export const MAX_COMMENT_LENGTH = 70
export const INPUT_DEBOUNCE_TIME = 1000 // milliseconds
// The minimum allowed value to add funds
export const DOLLAR_ADD_FUNDS_MIN_AMOUNT = 20
// The maximum allowed value to add funds
export const DOLLAR_ADD_FUNDS_MAX_AMOUNT = 5000
// The minimum allowed value to cash out
export const DOLLAR_CASH_OUT_MIN_AMOUNT = 0.01
// The minimum allowed value for a transaction such as a transfer
export const STABLE_TRANSACTION_MIN_AMOUNT = 0.01
export const CELO_TRANSACTION_MIN_AMOUNT = 0.001
export const TOKEN_MIN_AMOUNT = 0.00000001
// The minimum amount for a wallet to be considered as "funded"
export const DOLLAR_MIN_AMOUNT_ACCOUNT_FUNDED = 0.01
// The number of seconds before the sender can reclaim the payment.
export const ESCROW_PAYMENT_EXPIRY_SECONDS = 1 // The contract doesn't allow 0 seconds.
export const DEFAULT_TESTNET = Config.DEFAULT_TESTNET
export const SMS_RETRIEVER_APP_SIGNATURE = Config.SMS_RETRIEVER_APP_SIGNATURE
// ODIS minimum dollar balance for pepper quota retrieval
// TODO change this to new ODIS minimum dollar balance once deployed
export const ODIS_MINIMUM_DOLLAR_BALANCE = 0.1
export const ATTESTATION_REVEAL_TIMEOUT_SECONDS = 60 // 1 minute
// Additional gas added when setting the fee currency
// See details where used.
export const STATIC_GAS_PADDING = 50_000

// We can safely assume that any balance query returning a number
// higher than this is incorrect (currently set to 10M)
export const WALLET_BALANCE_UPPER_BOUND = new BigNumber('1e10')

export const TIME_UNTIL_TOKEN_INFO_BECOMES_STALE = 12 * ONE_HOUR_IN_MILLIS

// The amount of time
export const TIME_OF_SUPPORTED_UNSYNC_HISTORICAL_PRICES = ONE_HOUR_IN_MILLIS

export const DEFAULT_FORNO_URL =
  DEFAULT_TESTNET === 'mainnet'
    ? 'https://rpc.walker-cole.com/'
    : 'https://alfajores-forno.celo-testnet.org/'
export const BLOCKSCOUT_BASE_URL = Config.BLOCKSCOUT_BASE_URL

export const APP_BUNDLE_ID = Config.APP_BUNDLE_ID

// The network that FiatConnect providers operate on
export const FIATCONNECT_NETWORK =
  DEFAULT_TESTNET === 'mainnet' ? Network.Mainnet : Network.Alfajores

export const STATSIG_ENV = {
  tier: DEFAULT_TESTNET === 'mainnet' ? 'production' : 'development',
}

// FEATURE FLAGS
export const FIREBASE_ENABLED = stringToBoolean(Config.FIREBASE_ENABLED || 'true')
export const SHOW_TESTNET_BANNER = stringToBoolean(Config.SHOW_TESTNET_BANNER || 'false')
export const SHOW_GET_INVITE_LINK = stringToBoolean(Config.SHOW_GET_INVITE_LINK || 'false')
export const SENTRY_ENABLED = stringToBoolean(Config.SENTRY_ENABLED || 'false')
export const SUPERCHARGE_AVAILABLE_REWARDS_URL = Config.SUPERCHARGE_AVAILABLE_REWARDS_URL

// SECRETS
export const STATSIG_API_KEY = keyOrUndefined(secretsFile, DEFAULT_TESTNET, 'STATSIG_API_KEY')
export const SEGMENT_API_KEY = keyOrUndefined(secretsFile, DEFAULT_TESTNET, 'SEGMENT_API_KEY')
export const SENTRY_CLIENT_URL = keyOrUndefined(secretsFile, DEFAULT_TESTNET, 'SENTRY_CLIENT_URL')
export const RECAPTCHA_SITE_KEY = keyOrUndefined(secretsFile, DEFAULT_TESTNET, 'RECAPTCHA_SITE_KEY')
export const SAFETYNET_KEY = keyOrUndefined(secretsFile, DEFAULT_TESTNET, 'SAFETYNET_KEY')
export const BIDALI_URL = keyOrUndefined(secretsFile, DEFAULT_TESTNET, 'BIDALI_URL')

export const SPEND_MERCHANT_LINKS: SpendMerchant[] = [
  {
    name: 'Beam and Go',
    link: 'https://valora.beamandgo.com/',
  },
  {
    name: 'Merchant Map',
    link: 'https://celo.org/experience/merchant/merchants-accepting-celo#map',
    subtitleKey: 'findMerchants',
  },
]

export const VALORA_LOGO_URL =
  'https://storage.googleapis.com/celo-mobile-mainnet.appspot.com/images/valora-icon.png'
export const CELO_LOGO_URL =
  'https://firebasestorage.googleapis.com/v0/b/celo-mobile-mainnet.appspot.com/o/images%2Fcelo.jpeg?alt=media'
export const SUPERCHARGE_LOGO_URL =
  'https://firebasestorage.googleapis.com/v0/b/celo-mobile-mainnet.appspot.com/o/images%2Fsupercharge_logo.png?alt=media'

export const SIMPLEX_URI = 'https://valoraapp.com/simplex'
export const SIMPLEX_FEES_URL =
  'https://support.simplex.com/hc/en-gb/articles/360014078420-What-fees-am-I-paying-'

export const CASH_IN_SUCCESS_DEEPLINK = 'celo://wallet/cash-in-success'
export const CASH_IN_FAILURE_DEEPLINK = 'celo://wallet/cash-in-failure'

export const APP_STORE_ID = Config.APP_STORE_ID
export const DYNAMIC_DOWNLOAD_LINK = Config.DYNAMIC_DOWNLOAD_LINK
export const DYNAMIC_LINK_DOMAIN_URI_PREFIX = 'https://vlra.app'
export const CROWDIN_DISTRIBUTION_HASH = 'e-f9f6869461793b9d1a353b2v7c'
export const OTA_TRANSLATIONS_FILEPATH = `file://${CachesDirectoryPath}/translations`

export const FETCH_TIMEOUT_DURATION = 15000 // 15 seconds

export const DEFAULT_APP_LANGUAGE = 'en-US'

// Logging and monitoring
export const DEFAULT_SENTRY_TRACES_SAMPLE_RATE = 0.2
export const DEFAULT_SENTRY_NETWORK_ERRORS = [
  'network request failed',
  'The network connection was lost',
]

const configLoggerLevels: { [key: string]: LoggerLevel } = {
  debug: LoggerLevel.Debug,
  info: LoggerLevel.Info,
  warn: LoggerLevel.Warn,
  error: LoggerLevel.Error,
}

export const LOGGER_LEVEL = configLoggerLevels[Config.LOGGER_LEVEL] || LoggerLevel.Debug

export const PHONE_NUMBER_VERIFICATION_CODE_LENGTH = 6
