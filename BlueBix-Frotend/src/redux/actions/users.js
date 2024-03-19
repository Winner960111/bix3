import { SET_ROLE, SET_USER, SET_TOKEN, ON_LOGOUT } from '../constants/users';

export const setRole = (data) => ({
    type: SET_ROLE,
    data,
});

export const setUser = (data) => ({
    type: SET_USER,
    data,
});

export const setToken = (data) => ({
    type: SET_TOKEN,
    data,
});

export const onLogout = () => ({
    type: ON_LOGOUT,
});