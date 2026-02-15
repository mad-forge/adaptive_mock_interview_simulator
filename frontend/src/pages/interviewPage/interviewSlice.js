import { createSlice } from "@reduxjs/toolkit";
import {
    createSession,
    submitAnswer,
    endSession,
    fetchSession,
    fetchSessionsList,
} from "./interviewThunk";

const initialState = {
    // Session config & metadata
    sessionId: null,
    config: { role: "", difficulty: "", type: "", duration_min: 30 },
    createdAt: null,
    status: "idle", // idle | loading | active | evaluating | completed

    // Current question
    currentQuestion: null,

    // Feedback from last evaluated answer
    lastFeedback: null,

    // Progress tracking
    totalQuestions: 0,

    // All Q&A pairs in this session
    questions: [],

    // Final report
    report: null,

    // Session history list
    sessionsList: [],

    // Error state
    error: null,
};

const interviewSlice = createSlice({
    name: "interview",
    initialState,
    reducers: {
        setConfig: (state, action) => {
            state.config = { ...state.config, ...action.payload };
        },
        resetInterview: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            // --- createSession ---
            .addCase(createSession.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(createSession.fulfilled, (state, action) => {
                const { session_id, created_at, duration_min, total_questions, question } = action.payload;
                state.sessionId = session_id;
                state.createdAt = created_at;
                state.config.duration_min = duration_min;
                state.totalQuestions = total_questions;
                state.currentQuestion = question;
                state.questions = [];
                state.lastFeedback = null;
                state.report = null;
                state.status = "active";
            })
            .addCase(createSession.rejected, (state, action) => {
                state.status = "idle";
                state.error = action.payload;
            })

            // --- submitAnswer ---
            .addCase(submitAnswer.pending, (state) => {
                state.status = "evaluating";
                state.error = null;
            })
            .addCase(submitAnswer.fulfilled, (state, action) => {
                const { score, feedback, quality, is_complete, next_question, report } = action.payload;

                // Archive current question with its answer
                state.questions.push({
                    ...state.currentQuestion,
                    answer_text: action.meta.arg.answer_text,
                    score,
                    feedback,
                    quality,
                });

                state.lastFeedback = { score, feedback, quality };

                if (is_complete) {
                    state.currentQuestion = null;
                    state.report = report;
                    state.status = "completed";
                } else {
                    state.currentQuestion = next_question;
                    state.status = "active";
                }
            })
            .addCase(submitAnswer.rejected, (state, action) => {
                state.status = "active";
                state.error = action.payload;
            })

            // --- endSession ---
            .addCase(endSession.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(endSession.fulfilled, (state, action) => {
                state.report = action.payload.report;
                state.currentQuestion = null;
                state.status = "completed";
            })
            .addCase(endSession.rejected, (state, action) => {
                state.status = "active";
                state.error = action.payload;
            })

            // --- fetchSession ---
            .addCase(fetchSession.fulfilled, (state, action) => {
                const { session, questions } = action.payload;
                state.sessionId = session.id;
                state.config = {
                    role: session.role,
                    difficulty: session.difficulty,
                    type: session.type,
                    duration_min: session.duration_min,
                };
                state.createdAt = session.created_at;
                state.totalQuestions = Math.max(3, Math.floor(session.duration_min / 2));
                state.questions = questions;
                state.report = session.report;
                state.status = session.status === "completed" ? "completed" : "active";
            })

            // --- fetchSessionsList ---
            .addCase(fetchSessionsList.fulfilled, (state, action) => {
                state.sessionsList = action.payload.sessions;
            });
    },
});

export const { setConfig, resetInterview } = interviewSlice.actions;
export default interviewSlice.reducer;
