import { axios } from "../../shared/axios";

// POST /api/sessions — create session + get first question
export const createSessionApi = (data) => {
    return axios.post("/api/sessions", data);
};

// POST /api/sessions/:id/answer — submit answer, get eval + next question
export const submitAnswerApi = (sessionId, data) => {
    return axios.post(`/api/sessions/${sessionId}/answer`, data);
};

// POST /api/sessions/:id/end — force-end session + get report
export const endSessionApi = (sessionId) => {
    return axios.post(`/api/sessions/${sessionId}/end`);
};

// GET /api/sessions/:id — get full session with questions + report
export const getSessionApi = (sessionId) => {
    return axios.get(`/api/sessions/${sessionId}`);
};

// GET /api/sessions — list past sessions
export const getSessionsListApi = (params) => {
    return axios.get("/api/sessions", { params });
};
