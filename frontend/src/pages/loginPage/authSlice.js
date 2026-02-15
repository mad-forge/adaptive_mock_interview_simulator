import { createSlice } from "@reduxjs/toolkit";

// Restore auth from localStorage on load
const saved = (() => {
    try {
        const data = localStorage.getItem("auth");
        if (data) return JSON.parse(data);
    } catch {}
    return null;
})();

const initialState = {
    isAuthenticated: !!saved,
    user: saved || null,
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
            localStorage.setItem("auth", JSON.stringify({ name: name.trim() }));
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.error = null;
            localStorage.removeItem("auth");
        },
        clearAuthError: (state) => {
            state.error = null;
        },
    },
});

export const { login, logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
