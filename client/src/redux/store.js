import { configureStore, combineReducers } from "@reduxjs/toolkit"
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // Mặc định là localStorage cho web
import authReducer from "./auth/authSlice"
import contractReducer from "./contract/contractSlice"

const role = localStorage.getItem("current_role") || 'user';

// Cấu hình cho redux-persist
const persistConfig = {
  key: role , // Khóa chính trong localStorage
  storage, // Sử dụng localStorage
  whitelist: ['auth'] // Chỉ persist slice 'auth'. Slice 'contracts' sẽ không được lưu.
  // Nếu bạn cũng muốn persist 'contracts', hãy thêm nó vào whitelist: ['auth', 'contracts']
}


// Kết hợp các reducers của bạn
const rootReducer = combineReducers({
  auth: authReducer,
  contracts: contractReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer, // Sử dụng persisted reducer
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Bỏ qua các action này cho redux-persist
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

// Tạo persistor
export const persistor = persistStore(store)

