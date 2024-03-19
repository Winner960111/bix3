import { SET_CATEGORY } from "../constants/common";

const initialState = {
  category: [],
};

const commonReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CATEGORY:
      return { ...state, category: action.data };
    default:
      return state;
  }
};

export default commonReducer;
