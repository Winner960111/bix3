import { SET_RECRUITERS } from "../constants/recruiters";
import { SET_RECRUITERS } from "../constants/recruiters";

const initialState = {
  recruiters: [],
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_RECRUITERS:
      return { ...state, recruiters: action.data };
    default:
      return state;
  }
};

export default userReducer;
