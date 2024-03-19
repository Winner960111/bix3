import { combineReducers } from "redux";

import userReducer from "./users";
import commonReducer from "./common";

const mainReducer = combineReducers({
  users: userReducer,
  common: commonReducer,
});

export default mainReducer;
