import {
   SET_ROLE,
   SET_USER,
   SET_TOKEN,
   ON_LOGOUT
} from '../constants/users';

const initialState = {
   role: "",
   user: {},
   token: ""
};

const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_ROLE:
            return {...state, role: action.data};
        case SET_USER:
            return {...state, user: action.data};
        case SET_TOKEN:
            return {...state, token: action.data};
        case ON_LOGOUT:
            return {...initialState};
        default:
            return state;
    }
};

export default userReducer;