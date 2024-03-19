import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { put, takeLatest } from "redux-saga/effects";

export const actionTypes = {
  Login: "[Login] Action",
  Logout: "[Logout] Action",
  Register: "[Register] Action",
  UserRequested: "[Request User] Action",
  UserLoaded: "[Load User] Auth API",
  SetUser: "[Set User] Action",
};

const initialAuthState = {
  user: undefined,
  authToken: undefined,
  role: undefined,
};

export const reducer = persistReducer(
  {
    storage,
    key: "blubixAuth",
    whitelist: ["user", "authToken", "role"],
  },
  (state = initialAuthState, action) => {
    switch (action.type) {
      case actionTypes.Login: {
        const { authToken, user, role } = action.payload;
        return { authToken, user, role };
      }
      case actionTypes.Register: {
        const { authToken, role } = action.payload;
        return { authToken, role, user: undefined };
      }
      case actionTypes.Logout: {
        return initialAuthState;
      }
      case actionTypes.UserLoaded: {
        const { user } = action.payload;
        return { ...state, user };
      }
      case actionTypes.SetUser: {
        const { user } = action.payload;
        return { ...state, user };
      }
      default:
        return state;
    }
  }
);

export const actions = {
  login: (authToken, user, role) => ({
    type: actionTypes.Login,
    payload: { authToken, user, role },
  }),
  register: (authToken, role) => ({
    type: actionTypes.Register,
    payload: { authToken, role },
  }),
  requestUser: (user) => ({
    type: actionTypes.UserRequested,
    payload: { user },
  }),
  fulfillUser: (user) => ({ type: actionTypes.UserLoaded, payload: { user } }),
  setUser: (user) => ({ type: actionTypes.SetUser, payload: { user } }),
  logout: () => ({ type: actionTypes.Logout }),
};

export function* saga() {
  yield takeLatest(actionTypes.Login, function* loginSaga() {
    yield put(actions.requestUser());
  });
  yield takeLatest(actionTypes.Register, function* registerSaga() {
    yield put(actions.requestUser());
  });
  yield takeLatest(actionTypes.UserRequested, function* userRequested() {});
}
