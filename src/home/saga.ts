import {
  call,
  cancel,
  cancelled,
  delay,
  fork,
  put,
  select,
  spawn,
  take,
  takeLeading,
} from 'redux-saga/effects'
import { fetchSentEscrowPayments } from 'src/escrow/actions'
import { notificationsChannel } from 'src/firebase/firebase'
import { fetchGoldBalance } from 'src/goldToken/actions'
import { Actions, refreshAllBalances, setLoading, updateNotifications } from 'src/home/actions'
import { IdToNotification } from 'src/home/reducers'
import { fetchCurrentRate } from 'src/localCurrency/actions'
import { shouldFetchCurrentRate } from 'src/localCurrency/selectors'
import { withTimeout } from 'src/redux/sagas-helpers'
import { shouldUpdateBalance } from 'src/redux/selectors'
import { fetchStableBalances } from 'src/stableToken/actions'
import { fetchTokenBalances } from 'src/tokens/slice'
import { Actions as TransactionActions } from 'src/transactions/actions'
import Logger from 'src/utils/Logger'
import { getConnectedAccount } from 'src/web3/saga'

const REFRESH_TIMEOUT = 15000
const TAG = 'home/saga'

export function withLoading<Fn extends (...args: any[]) => any>(fn: Fn, ...args: Parameters<Fn>) {
  return function* withLoadingGen() {
    yield put(setLoading(true))
    try {
      const res = yield call(fn, ...args)
      return res
    } finally {
      yield put(setLoading(false))
    }
  }
}

export function* refreshBalances() {
  Logger.debug(TAG, 'Fetching all balances')
  yield call(getConnectedAccount)
  yield put(fetchTokenBalances({ showLoading: false }))
  yield put(fetchCurrentRate())
  yield put(fetchStableBalances())
  yield put(fetchGoldBalance())
  yield put(fetchSentEscrowPayments())
}

export function* autoRefreshSaga() {
  while (true) {
    if (yield select(shouldUpdateBalance)) {
      yield put(refreshAllBalances())
    }
    if (yield select(shouldFetchCurrentRate)) {
      yield put(fetchCurrentRate())
    }
    yield delay(10 * 1000) // sleep 10 seconds
  }
}

export function* autoRefreshWatcher() {
  while (yield take(Actions.START_BALANCE_AUTOREFRESH)) {
    // starts the task in the background
    const autoRefresh = yield fork(autoRefreshSaga)
    yield take(Actions.STOP_BALANCE_AUTOREFRESH)
    yield cancel(autoRefresh)
  }
}

export function* watchRefreshBalances() {
  yield call(refreshBalances)
  yield takeLeading(
    Actions.REFRESH_BALANCES,
    withLoading(withTimeout(REFRESH_TIMEOUT, refreshBalances))
  )
  yield takeLeading(
    TransactionActions.NEW_TRANSACTIONS_IN_FEED,
    withTimeout(REFRESH_TIMEOUT, refreshBalances)
  )
}

function* fetchNotifications() {
  const channel = yield call(notificationsChannel)
  if (!channel) {
    return
  }
  try {
    while (true) {
      const notifications: IdToNotification = yield take(channel)
      yield put(updateNotifications(notifications))
    }
  } catch (error) {
    Logger.error(`${TAG}@fetchNotifications`, 'Failed to update notifications', error)
  } finally {
    if (yield cancelled()) {
      channel.close()
    }
  }
}

export function* homeSaga() {
  yield spawn(watchRefreshBalances)
  yield spawn(autoRefreshWatcher)
  yield spawn(fetchNotifications)
}
