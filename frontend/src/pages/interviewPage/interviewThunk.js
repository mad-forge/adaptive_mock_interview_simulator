import { createAsyncThunk } from "@reduxjs/toolkit";
import {
    createSessionApi,
    submitAnswerApi,
    endSessionApi,
    getSessionApi,
    getSessionsListApi,
} from "../../apiCall/interview";
import { apiLoading, apiLoadingEnd } from "../../store/slices/notifications/notificationSlice";
import { actionNotifier } from "../../components/ui/toast";

export const createSession = createAsyncThunk(
    "interview/createSession",
    async ({ data, callback }, { dispatch, rejectWithValue }) => {
        try {
            dispatch(apiLoading({ loadingMessage: "Starting interview..." }));
            const response = await createSessionApi(data);
            if (callback) callback(response.data);
            return response.data;
        } catch (error) {
            actionNotifier.error(error.response?.data?.error || "Failed to start session");
            return rejectWithValue(error.response?.data?.error || error.message);
        } finally {
            dispatch(apiLoadingEnd());
        }
    }
);

export const submitAnswer = createAsyncThunk(
    "interview/submitAnswer",
    async ({ sessionId, answer_text }, { dispatch, rejectWithValue }) => {
        try {
            dispatch(apiLoading({ loadingMessage: "Evaluating your answer..." }));
            const response = await submitAnswerApi(sessionId, { answer_text });
            return response.data;
        } catch (error) {
            actionNotifier.error(error.response?.data?.error || "Failed to submit answer");
            return rejectWithValue(error.response?.data?.error || error.message);
        } finally {
            dispatch(apiLoadingEnd());
        }
    }
);

export const endSession = createAsyncThunk(
    "interview/endSession",
    async ({ sessionId }, { dispatch, rejectWithValue }) => {
        try {
            dispatch(apiLoading({ loadingMessage: "Generating your report..." }));
            const response = await endSessionApi(sessionId);
            return response.data;
        } catch (error) {
            actionNotifier.error(error.response?.data?.error || "Failed to end session");
            return rejectWithValue(error.response?.data?.error || error.message);
        } finally {
            dispatch(apiLoadingEnd());
        }
    }
);

export const fetchSession = createAsyncThunk(
    "interview/fetchSession",
    async ({ sessionId }, { dispatch, rejectWithValue }) => {
        try {
            dispatch(apiLoading());
            const response = await getSessionApi(sessionId);
            return response.data;
        } catch (error) {
            actionNotifier.error("Failed to load session");
            return rejectWithValue(error.response?.data?.error || error.message);
        } finally {
            dispatch(apiLoadingEnd());
        }
    }
);

export const fetchSessionsList = createAsyncThunk(
    "interview/fetchSessionsList",
    async (params = {}, { dispatch, rejectWithValue }) => {
        try {
            dispatch(apiLoading());
            const response = await getSessionsListApi(params);
            return response.data;
        } catch (error) {
            actionNotifier.error("Failed to load sessions");
            return rejectWithValue(error.response?.data?.error || error.message);
        } finally {
            dispatch(apiLoadingEnd());
        }
    }
);
