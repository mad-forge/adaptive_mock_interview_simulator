import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { submitAnswer, endSession } from "../../pages/interviewPage/interviewThunk";
import classes from "./styles.module.scss";

const SessionContainer = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { sessionId, config, createdAt, currentQuestion, lastFeedback, questions, totalQuestions, status } =
        useSelector((state) => state.Interview);
    const user = useSelector((state) => state.Auth.user);
    const initial = user?.name?.charAt(0)?.toUpperCase() || "?";

    const [answer, setAnswer] = useState("");
    const [timeLeft, setTimeLeft] = useState(null);
    const timerRef = useRef(null);
    const textareaRef = useRef(null);

    // Redirect if no active session
    useEffect(() => {
        if (!sessionId || status === "idle") {
            navigate("/setup");
        }
    }, [sessionId, status, navigate]);

    // Navigate to report when completed
    useEffect(() => {
        if (status === "completed") {
            navigate("/report");
        }
    }, [status, navigate]);

    // Timer
    useEffect(() => {
        if (!createdAt || !config.duration_min) return;
        const endTime = new Date(createdAt).getTime() + config.duration_min * 60000;

        const tick = () => {
            const remaining = Math.max(0, endTime - Date.now());
            setTimeLeft(remaining);
            if (remaining <= 0) {
                clearInterval(timerRef.current);
                dispatch(endSession({ sessionId }));
            }
        };

        tick();
        timerRef.current = setInterval(tick, 1000);
        return () => clearInterval(timerRef.current);
    }, [createdAt, config.duration_min, sessionId, dispatch]);

    // Focus textarea on new question
    useEffect(() => {
        if (currentQuestion && status === "active") {
            setAnswer("");
            textareaRef.current?.focus();
        }
    }, [currentQuestion?.id, status]);

    const handleSubmit = () => {
        if (!answer.trim() || status === "evaluating") return;
        dispatch(submitAnswer({ sessionId, answer_text: answer.trim() }));
    };

    const handleEnd = () => {
        if (window.confirm("End the interview early? Your report will be generated from answers so far.")) {
            clearInterval(timerRef.current);
            dispatch(endSession({ sessionId }));
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            handleSubmit();
        }
    };

    const formatTime = useCallback((ms) => {
        if (ms === null) return "--:--";
        const totalSec = Math.floor(ms / 1000);
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    }, []);

    const isWarning = timeLeft !== null && timeLeft < 60000;
    const qNum = questions.length + 1;
    const total = totalQuestions || Math.max(3, Math.floor((config.duration_min || 30) / 2));
    const progressPct = total > 0 ? Math.min(100, Math.round((questions.length / total) * 100)) : 0;

    const getDifficultyClass = (difficulty) => {
        const map = { easy: classes.badgeEasy, medium: classes.badgeMedium, hard: classes.badgeHard };
        return map[difficulty] || "";
    };

    const getScoreColor = (score) => {
        if (score >= 70) return classes.scoreGreat;
        if (score >= 40) return classes.scoreOk;
        return classes.scorePoor;
    };

    if (!sessionId) return null;

    return (
        <div className={classes.page}>
            {/* Top bar */}
            <div className={classes.topBar}>
                <div className={classes.topBarInner}>
                    <div className={classes.brand}>
                        <span className={classes.logoIcon}>AI</span>
                        <span className={classes.brandText}>InterviewAI</span>
                    </div>
                    <div className={classes.sessionMeta}>
                        <span className={classes.metaRole}>{config.role}</span>
                        <span className={classes.metaDot} />
                        <span className={classes.metaType}>{config.type}</span>
                        <span className={classes.metaDot} />
                        <span className={`${classes.metaDifficulty} ${getDifficultyClass(config.difficulty)}`}>
                            {config.difficulty}
                        </span>
                    </div>
                    <div className={classes.topRight}>
                        <div className={`${classes.timer} ${isWarning ? classes.timerWarning : ""}`}>
                            {formatTime(timeLeft)}
                        </div>
                        <div className={classes.avatar}>{initial}</div>
                    </div>
                </div>
            </div>

            {/* Progress */}
            <div className={classes.progressSection}>
                <div className={classes.progressInner}>
                    <div className={classes.progressInfo}>
                        <span>Question {qNum} of ~{total}</span>
                        <span>{progressPct}% complete</span>
                    </div>
                    <div className={classes.progressTrack}>
                        <div className={classes.progressFill} style={{ width: `${progressPct}%` }} />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={classes.content}>
                {/* Feedback from previous answer */}
                {lastFeedback && (
                    <div className={classes.feedbackCard}>
                        <div className={classes.feedbackTop}>
                            <span className={classes.feedbackLabel}>Previous Answer</span>
                            <span className={`${classes.feedbackScore} ${getScoreColor(lastFeedback.score)}`}>
                                {lastFeedback.score}/100
                            </span>
                        </div>
                        <p className={classes.feedbackText}>{lastFeedback.feedback}</p>
                    </div>
                )}

                {/* Current Question */}
                {currentQuestion && (
                    <div className={classes.questionCard}>
                        <div className={classes.questionTop}>
                            <span className={classes.qLabel}>Question {qNum}</span>
                            <div className={classes.badges}>
                                <span className={`${classes.badge} ${getDifficultyClass(currentQuestion.difficulty)}`}>
                                    {currentQuestion.difficulty}
                                </span>
                                {currentQuestion.is_followup && (
                                    <span className={`${classes.badge} ${classes.badgeFollowup}`}>Follow-up</span>
                                )}
                            </div>
                        </div>

                        <p className={classes.questionText}>{currentQuestion.question_text}</p>

                        <div className={classes.answerWrap}>
                            <textarea
                                ref={textareaRef}
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type your answer here... (Ctrl+Enter to submit)"
                                disabled={status === "evaluating"}
                                rows={6}
                            />
                            {status === "evaluating" && (
                                <div className={classes.evalOverlay}>
                                    <div className={classes.spinner} />
                                    <span>Evaluating your answer...</span>
                                </div>
                            )}
                        </div>

                        <div className={classes.actions}>
                            <button className={classes.endBtn} onClick={handleEnd} disabled={status === "evaluating"}>
                                End Interview
                            </button>
                            <button
                                className={classes.submitBtn}
                                onClick={handleSubmit}
                                disabled={!answer.trim() || status === "evaluating"}
                            >
                                {status === "evaluating" ? "Evaluating..." : "Submit Answer"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SessionContainer;
