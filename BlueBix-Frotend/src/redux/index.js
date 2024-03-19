import { createStore } from 'redux';
import mainReducer from './reducers';
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web

const persistConfig = {
	key: 'root',
	storage,
};

const persistedReducer = persistReducer(persistConfig, mainReducer);

export const store = createStore(persistedReducer);
export const persistor =  persistStore(store);	