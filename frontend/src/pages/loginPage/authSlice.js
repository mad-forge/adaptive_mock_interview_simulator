import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isAuthenticated: false,
    user: null,
    error: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            const { name, password } = action.payload;
            if (!name || !name.trim()) {
                state.error = "Please enter your name";
                return;
            }
            if (password !== "1234") {
                state.error = "Invalid password";
                return;
            }
            state.isAuthenticated = true;
            state.user = { name: name.trim() };
            state.error = null;
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.error = null;
        },
        clearAuthError: (state) => {
            state.error = null;
        },
    },
});

export const { login, logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
