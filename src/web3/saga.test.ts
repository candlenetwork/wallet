import { generateMnemonic, MnemonicLanguages, MnemonicStrength } from '@celo/utils/lib/account'
import { isValidChecksumAddress } from '@celo/utils/lib/address'
import * as bip39 from 'react-native-bip39'
import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { call, select } from 'redux-saga/effects'
import { generateSignedMessage } from 'src/account/saga'
import { ErrorMessages } from 'src/app/ErrorMessages'
import { storeMnemonic } from 'src/backup/utils'
import { currentLanguageSelector } from 'src/i18n/selectors'
import { getPasswordSaga, retrieveSignedMessage } from 'src/pincode/authentication'
import { setAccount, setDataEncryptionKey, setMtwAddress } from 'src/web3/actions'
import {
  getConnectedAccount,
  getConnectedUnlockedAccount,
  getMTWAddress,
  getOrCreateAccount,
  getWalletAddress,
  unlockAccount,
  UnlockResult,
} from 'src/web3/saga'
import {
  currentAccountSelector,
  mtwAddressSelector,
  walletAddressSelector,
} from 'src/web3/selectors'
import { createMockStore } from 'test/utils'
import { mockAccount, mockAccount2, mockAccount3 } from 'test/values'

jest.unmock('src/pincode/authentication')

jest.mock('src/account/actions', () => ({
  ...(jest.requireActual('src/account/actions') as any),
  getPincode: async () => 'pin',
}))

jest.mock('src/navigator/NavigationService', () => ({
  navigateToError: jest.fn().mockReturnValueOnce(undefined),
}))

const state = createMockStore({
  web3: { account: mockAccount, mtwAddress: mockAccount2 },
}).getState()

describe(getOrCreateAccount, () => {
  it('returns an existing account', async () => {
    await expectSaga(getOrCreateAccount)
      .withState(state)
      .not.call.fn(generateMnemonic)
      .returns('0x0000000000000000000000000000000000007e57')
      .run()
  })

  it('creates a new account', async () => {
    const MNEMONIC =
      'avellana novio zona pinza ducha íntimo amante diluir toldo peón ocio encía gen balcón carro lingote millón amasar mármol bondad toser soledad croqueta agosto'
    const EXPECTED_ADDRESS = '0xE025583d25Eff2C254999b5904C97bAe9B3F8D83'
    const EXPECTED_DEK = '0xb6812219f7003c27cc1ef17c2033c033a38cfc52d83f176a0667086787d59d39'

    await expectSaga(getOrCreateAccount)
      .withState(state)
      .provide([
        [select(currentAccountSelector), null],
        [matchers.call.fn(generateMnemonic), MNEMONIC],
        [
          call(storeMnemonic, MNEMONIC, EXPECTED_ADDRESS),
          {
            service: 'mnemonic',
            storage: 'storage',
          },
        ],
        [call(getPasswordSaga, EXPECTED_ADDRESS, false, true), 'somePassword'],
      ])
      .put(setAccount(EXPECTED_ADDRESS))
      .put(setDataEncryptionKey(EXPECTED_DEK))
      .returns(EXPECTED_ADDRESS)
      .run()
  })

  it.each`
    appLang             | expectedMnemonicLang
    ${'en-US'}          | ${MnemonicLanguages[MnemonicLanguages.english]}
    ${'es-419'}         | ${MnemonicLanguages[MnemonicLanguages.spanish]}
    ${'pt-BR'}          | ${MnemonicLanguages[MnemonicLanguages.portuguese]}
    ${'incorrect-lang'} | ${MnemonicLanguages[MnemonicLanguages.english]}
  `(
    'creates an account with a mnemonic in $expectedMnemonicLang when app language is $appLang',
    async ({ appLang, expectedMnemonicLang }) => {
      const { returnValue } = await expectSaga(getOrCreateAccount)
        .withState(state)
        .provide([
          [select(currentAccountSelector), null],
          [select(currentLanguageSelector), appLang],
          [
            matchers.call.fn(storeMnemonic),
            {
              service: 'mnemonic',
              storage: 'storage',
            },
          ],
          [matchers.call.fn(getPasswordSaga), 'somePassword'],
        ])
        .call(
          generateMnemonic,
          MnemonicStrength.s256_24words,
          MnemonicLanguages[expectedMnemonicLang] as unknown as MnemonicLanguages,
          bip39
        )
        .run()

      expect(isValidChecksumAddress(returnValue)).toBe(true)
    }
  )
})

describe('Address getters', () => {
  it('getWalletAddress: unit test', async () => {
    const EXPECTED_WALLET_ADDRESS = '0xabc'
    await expectSaga(getWalletAddress)
      .withState(state)
      .provide([[select(walletAddressSelector), EXPECTED_WALLET_ADDRESS]])
      .returns(EXPECTED_WALLET_ADDRESS)
      .run()
  })

  it('getWalletAddress + walletAddressSelector: integration test, case where wallet address already set', async () => {
    await expectSaga(getWalletAddress).withState(state).returns(mockAccount.toLowerCase()).run()
  })

  it('getMTWAddress + walletAddressSelector: integration test, case where wallet address is set with dispatched action', async () => {
    const state = createMockStore({
      web3: { account: null },
    }).getState()
    await expectSaga(getWalletAddress)
      .withState(state)
      .dispatch(setAccount(mockAccount3))
      .returns(mockAccount3.toLowerCase())
      .run()
  })

  it('getMTWAddress: unit test', async () => {
    const EXPECTED_MTW_ADDRESS = '0x123'
    await expectSaga(getMTWAddress)
      .withState(state)
      .provide([[select(mtwAddressSelector), EXPECTED_MTW_ADDRESS]])
      .returns(EXPECTED_MTW_ADDRESS)
      .run()
  })

  it('getMTWAddress + mtwAddressSelector: integration test, case where MTW already set', async () => {
    await expectSaga(getMTWAddress).withState(state).returns(mockAccount2).run()
  })
  it('getMTWAddress + mtwAddressSelector: integration test, case where MTW is set with dispatched action', async () => {
    const state = createMockStore({
      web3: { account: mockAccount, mtwAddress: null },
    }).getState()
    await expectSaga(getMTWAddress)
      .withState(state)
      .dispatch(setMtwAddress(mockAccount3))
      .returns(mockAccount3.toLowerCase())
      .run()
  })
})

describe('getConnectedUnlockedAccount', () => {
  it("should generate the signed message if it doesn't exist", async () => {
    await expectSaga(getConnectedUnlockedAccount)
      .provide([
        [call(getConnectedAccount), mockAccount],
        [matchers.call.fn(unlockAccount), UnlockResult.SUCCESS],
        [call(retrieveSignedMessage), null],
        [call(generateSignedMessage), null],
      ])
      .call(generateSignedMessage)
      .run()
  })

  it('should not generate the signed message if it exists', async () => {
    await expectSaga(getConnectedUnlockedAccount)
      .provide([
        [call(getConnectedAccount), mockAccount],
        [matchers.call.fn(unlockAccount), UnlockResult.SUCCESS],
        [call(retrieveSignedMessage), 'some signed message'],
        [call(generateSignedMessage), null],
      ])
      .not.call(generateSignedMessage)
      .run()
  })

  it('should throw an error if the account could not be unlocked', async () => {
    await expect(
      expectSaga(getConnectedUnlockedAccount)
        .provide([
          [call(getConnectedAccount), mockAccount],
          [matchers.call.fn(unlockAccount), UnlockResult.FAILURE],
          [call(retrieveSignedMessage), null],
        ])
        .not.call(generateSignedMessage)
        .run()
    ).rejects.toThrowError(ErrorMessages.INCORRECT_PIN)
  })
})
