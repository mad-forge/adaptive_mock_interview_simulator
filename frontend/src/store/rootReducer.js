import { combineReducers } from '@reduxjs/toolkit';
import { baseApi } from '../apiCall/rtkBaseApi/baseApi';
import statusReducer from './slices/notifications/notificationSlice';
import userReducer from '../pages/userlist/userSlice';
import interviewReducer from '../pages/interviewPage/interviewSlice';
import authReducer from '../pages/loginPage/authSlice';
export const rootReducer = combineReducers({
    [baseApi.reducerPath]: baseApi.reducer,
    Loader: statusReducer,
    User: userReducer,
    Interview: interviewReducer,
    Auth: authReducer,
});
