import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    createSession,
    submitAnswer,
    endSession,
    fetchSessionsList,
    fetchSession,
} from "../../pages/interviewPage/interviewThunk";
import { setConfig, resetInterview } from "../../pages/interviewPage/interviewSlice";
import classes from "./styles.module.scss";

const ROLES = [
    "Frontend Engineer",
    "Backend Engineer",
    "Full Stack Engineer",
    "Data Scientist",
    "DevOps Engineer",
    "Mobile Developer",
    "QA Engineer",
    "Product Manager",
];

const TYPES = [
    { value: "technical", label: "Technical" },
    { value: "behavioral", label: "Behavioral" },
    { value: "system_design", label: "System Design" },
];

const DIFFICULTIES = [
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
];

const DURATIONS = [
    { value: 15, label: "15 min" },
    { value: 30, label: "30 min" },
    { value: 45, label: "45 min" },
    { value: 60, label: "60 min" },
];

const FEATURES = [
    {
        icon: "\u2699\uFE0F",
        title: "Adaptive Difficulty Engine",
        desc: "Questions dynamically adjust based on your performance. Ace a question? The next one gets harder. Struggle? It eases up to keep you in the zone.",
    },
    {
        icon: "\u26A1",
        title: "Real-Time Feedback & Scoring",
        desc: "Get instant, AI-powered evaluation after every answer with a score, quality rating, and actionable feedback to improve on the spot.",
    },
    {
        icon: "\uD83D\uDCCA",
        title: "Structured Performance Reports",
        desc: "Receive a comprehensive report with strengths, improvement areas, improved sample answers, and personalized practice topics.",
    },
];

const STEPS = [
    { num: "01", title: "Choose Role & Difficulty", desc: "Pick your target role, interview type, difficulty level, and session duration." },
    { num: "02", title: "Take Adaptive Interview", desc: "Answer AI-generated questions in real time. The interview adapts to challenge you at just the right level." },
    { num: "03", title: "Get Detailed AI Report", desc: "Review your overall score, key strengths, areas to improve, and model answers to study from." },
];

// ================================================
// MAIN CONTAINER
// ================================================

const InterviewContainer = () => {
    const dispatch = useDispatch();
    const interview = useSelector((state) => state.Interview);
    const [view, setView] = useState("setup"); // setup | session | report | history
    const configRef = useRef(null);

    useEffect(() => {
        if (interview.status === "active" || interview.status === "evaluating") {
            setView("session");
        } else if (interview.status === "completed" && interview.report) {
            setView("report");
        }
    }, [interview.status, interview.report]);

    const handleNewInterview = () => {
        dispatch(resetInterview());
        setView("setup");
    };

    const handleViewHistory = () => {
        dispatch(fetchSessionsList());
        setView("history");
    };

    const handleViewReport = (sessionId) => {
        dispatch(fetchSession({ sessionId }));
        setView("report");
    };

    const scrollToConfig = () => {
        configRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const scrollToHowItWorks = () => {
        document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
    };

    // Session & Report views get a focused layout (no landing page)
    if (view === "session") {
        return (
            <div className={classes.appShell}>
                <div className={classes.innerWrap}>
                    <SessionView />
                </div>
            </div>
        );
    }

    if (view === "report") {
        return (
            <div className={classes.appShell}>
                <div className={classes.innerWrap}>
                    <ReportView onNewInterview={handleNewInterview} onHistory={handleViewHistory} />
                </div>
            </div>
        );
    }

    if (view === "history") {
        return (
            <div className={classes.appShell}>
                <div className={classes.innerWrap}>
                    <div className={classes.historyHeader}>
                        <button className={classes.backBtn} onClick={() => setView("setup")}>&larr; Back</button>
                        <h2>Interview History</h2>
                    </div>
                    <HistoryView onViewReport={handleViewReport} />
                </div>
            </div>
        );
    }

    // Landing page (setup view)
    return (
        <div className={classes.landing}>
            {/* Navbar */}
            <nav className={classes.navbar}>
                <div className={classes.navInner}>
                    <div className={classes.logo}>InterviewAI</div>
                    <div className={classes.navLinks}>
                        <button onClick={scrollToHowItWorks}>How It Works</button>
                        <button onClick={handleViewHistory}>History</button>
                        <button className={classes.navCta} onClick={scrollToConfig}>Start Interview</button>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className={classes.hero}>
                <div className={classes.heroContent}>
                    <span className={classes.heroBadge}>AI-Powered Mock Interviews</span>
                    <h1>Ace Your Next Technical Interview with AI</h1>
                    <p className={classes.heroSub}>
                        Practice with an adaptive AI interviewer that adjusts difficulty in real time,
                        gives instant feedback on every answer, and generates a detailed performance report
                        to fast-track your preparation.
                    </p>
                    <div className={classes.heroCtas}>
                        <button className={classes.ctaPrimary} onClick={scrollToConfig}>
                            Start Free Interview
                        </button>
                        <button className={classes.ctaSecondary} onClick={scrollToHowItWorks}>
                            View How It Works
                        </button>
                    </div>
                    <div className={classes.heroStats}>
                        <div><strong>8+</strong><span>Roles</span></div>
                        <div><strong>3</strong><span>Interview Types</span></div>
                        <div><strong>Adaptive</strong><span>Difficulty</span></div>
                        <div><strong>Instant</strong><span>AI Reports</span></div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className={classes.features}>
                <div className={classes.sectionInner}>
                    <span className={classes.sectionTag}>Features</span>
                    <h2 className={classes.sectionTitle}>Everything you need to interview with confidence</h2>
                    <div className={classes.featureGrid}>
                        {FEATURES.map((f, i) => (
                            <div key={i} className={classes.featureCard}>
                                <div className={classes.featureIcon}>{f.icon}</div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className={classes.howItWorks} id="how-it-works">
                <div className={classes.sectionInner}>
                    <span className={classes.sectionTag}>How It Works</span>
                    <h2 className={classes.sectionTitle}>Three steps to a better interview</h2>
                    <div className={classes.stepsGrid}>
                        {STEPS.map((s, i) => (
                            <div key={i} className={classes.stepCard}>
                                <div className={classes.stepNum}>{s.num}</div>
                                <h3>{s.title}</h3>
                                <p>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Config Section */}
            <section className={classes.configSection} ref={configRef}>
                <div className={classes.sectionInner}>
                    <SetupView />
                </div>
            </section>

            {/* Footer */}
            <footer className={classes.footer}>
                <div className={classes.footerInner}>
                    <div className={classes.footerBrand}>
                        <div className={classes.logo}>InterviewAI</div>
                        <p>Sharpen your interview skills with adaptive AI-powered mock sessions.</p>
                    </div>
                    <div className={classes.footerLinks}>
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
                        <button onClick={scrollToConfig}>Start Interview</button>
                        <button onClick={scrollToHowItWorks}>How It Works</button>
                    </div>
                </div>
                <div className={classes.footerBottom}>
                    <p>Built for hackathon demo purposes. Not affiliated with any company.</p>
                </div>
            </footer>
        </div>
    );
};

// ================================================
// SETUP VIEW
// ================================================

const SetupView = () => {
    const dispatch = useDispatch();
    const { config, status } = useSelector((state) => state.Interview);

    const handleChange = (field, value) => {
        dispatch(setConfig({ [field]: field === "duration_min" ? Number(value) : value }));
    };

    const handleStart = () => {
        if (!config.role || !config.difficulty || !config.type) return;
        dispatch(createSession({ data: config }));
    };

    const isReady = config.role && config.difficulty && config.type && config.duration_min;

    return (
        <div className={classes.setupForm}>
            <span className={classes.sectionTag}>Get Started</span>
            <h2>Configure Your Interview</h2>
            <p className={classes.setupSub}>Choose your settings and jump straight into a mock interview.</p>
            <div className={classes.formGrid}>
                <div className={classes.formGroup}>
                    <label>Role</label>
                    <select value={config.role} onChange={(e) => handleChange("role", e.target.value)}>
                        <option value="">Select a role</option>
                        {ROLES.map((r) => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                </div>
                <div className={classes.formGroup}>
                    <label>Interview Type</label>
                    <select value={config.type} onChange={(e) => handleChange("type", e.target.value)}>
                        <option value="">Select type</option>
                        {TYPES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                </div>
                <div className={classes.formGroup}>
                    <label>Difficulty</label>
                    <select value={config.difficulty} onChange={(e) => handleChange("difficulty", e.target.value)}>
                        <option value="">Select difficulty</option>
                        {DIFFICULTIES.map((d) => (
                            <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                    </select>
                </div>
                <div className={classes.formGroup}>
                    <label>Duration</label>
                    <select value={config.duration_min} onChange={(e) => handleChange("duration_min", e.target.value)}>
                        {DURATIONS.map((d) => (
                            <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                    </select>
                </div>
            </div>
            <button
                className={classes.startBtn}
                onClick={handleStart}
                disabled={!isReady || status === "loading"}
            >
                {status === "loading" ? "Starting..." : "Start Interview"}
            </button>
        </div>
    );
};

// ================================================
// SESSION VIEW (Live Interview)
// ================================================

const SessionView = () => {
    const dispatch = useDispatch();
    const { sessionId, config, createdAt, currentQuestion, lastFeedback, questions, totalQuestions, status } =
        useSelector((state) => state.Interview);

    const [answer, setAnswer] = useState("");
    const [timeLeft, setTimeLeft] = useState(null);
    const timerRef = useRef(null);
    const textareaRef = useRef(null);

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
    const progressPct = totalQuestions > 0 ? Math.min(100, Math.round((questions.length / totalQuestions) * 100)) : 0;

    const getDifficultyBadge = (difficulty) => {
        const map = { easy: classes.badgeEasy, medium: classes.badgeMedium, hard: classes.badgeHard };
        return `${classes.badge} ${map[difficulty] || ""}`;
    };

    const getScoreClass = (score) => {
        if (score >= 70) return classes.scoreGreat;
        if (score >= 40) return classes.scoreGood;
        return classes.scorePoor;
    };

    return (
        <div className={classes.session}>
            {/* Dark branded header */}
            <div className={classes.sessionHeader}>
                <div className={classes.sessionLogo}>InterviewAI</div>
                <div className={classes.sessionTitle}>{config.role} &middot; {config.type}</div>
                <div className={`${classes.timerBox} ${isWarning ? classes.timerWarning : ""}`}>
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Progress bar */}
            <div className={classes.progressWrap}>
                <div className={classes.progressInfo}>
                    <span>Question {qNum} of ~{totalQuestions}</span>
                    <span>{progressPct}% complete</span>
                </div>
                <div className={classes.progressBar}>
                    <div className={classes.progressFill} style={{ width: `${progressPct}%` }} />
                </div>
            </div>

            {lastFeedback && (
                <div className={classes.feedbackCard}>
                    <div className={classes.feedbackHeader}>
                        <span>Previous Answer Feedback</span>
                        <span className={`${classes.feedbackScore} ${getScoreClass(lastFeedback.score)}`}>
                            {lastFeedback.score}/100
                        </span>
                    </div>
                    <p>{lastFeedback.feedback}</p>
                </div>
            )}

            {currentQuestion && (
                <div className={classes.questionCard}>
                    <div className={classes.questionHeader}>
                        <span className={classes.qNum}>Question {qNum}</span>
                        <div>
                            <span className={getDifficultyBadge(currentQuestion.difficulty)}>
                                {currentQuestion.difficulty}
                            </span>
                            {currentQuestion.is_followup && (
                                <span className={`${classes.badge} ${classes.badgeFollowup}`}>Follow-up</span>
                            )}
                        </div>
                    </div>
                    <p className={classes.questionText}>{currentQuestion.question_text}</p>

                    <div className={classes.answerArea}>
                        <textarea
                            ref={textareaRef}
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your answer here... (Ctrl+Enter to submit)"
                            disabled={status === "evaluating"}
                        />
                        {status === "evaluating" && (
                            <div className={classes.evalOverlay}>
                                <div className={classes.evalSpinner} />
                                <span>Evaluating your answer...</span>
                            </div>
                        )}
                    </div>

                    <div className={classes.answerActions}>
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
    );
};

// ================================================
// REPORT VIEW
// ================================================

const ReportView = ({ onNewInterview, onHistory }) => {
    const { report, questions, config } = useSelector((state) => state.Interview);

    if (!report) return <div className={classes.emptyState}>Loading report...</div>;

    const getScoreClass = (score) => {
        if (score >= 70) return classes.scoreGreat;
        if (score >= 40) return classes.scoreGood;
        return classes.scorePoor;
    };

    return (
        <div className={classes.report}>
            <div className={classes.reportHeader}>
                <h2>Interview Complete</h2>
                <div className={`${classes.overallScore} ${getScoreClass(report.overall_score)}`}>
                    {report.overall_score}
                </div>
                <div className={classes.scoreLabel}>
                    Overall Score &middot; {config.role} &middot; {questions.length} questions
                </div>
            </div>

            <div className={classes.reportSection}>
                <h3>Strengths</h3>
                <ul>
                    {report.strengths?.map((s, i) => (
                        <li key={i} className={classes.strengthItem}>{s}</li>
                    ))}
                </ul>
            </div>

            <div className={classes.reportSection}>
                <h3>Areas for Improvement</h3>
                <ul>
                    {report.improvements?.map((s, i) => (
                        <li key={i} className={classes.improvementItem}>{s}</li>
                    ))}
                </ul>
            </div>

            <div className={classes.reportSection}>
                <h3>Improved Sample Answers</h3>
                {report.sample_answers?.map((sa, i) => (
                    <div key={i} className={classes.sampleAnswer}>
                        <div className={classes.sampleQ}>{sa.question}</div>
                        <div className={classes.sampleLabel}>Your Answer</div>
                        <div className={classes.originalText}>{sa.original_answer}</div>
                        <div className={classes.sampleLabel}>Improved Answer</div>
                        <div className={classes.sampleText}>{sa.improved_answer}</div>
                    </div>
                ))}
            </div>

            <div className={classes.reportSection}>
                <h3>Suggested Practice Topics</h3>
                <ul>
                    {report.practice_topics?.map((t, i) => (
                        <li key={i} className={classes.topicItem}>{t}</li>
                    ))}
                </ul>
            </div>

            <div className={classes.reportActions}>
                <button className={classes.ctaPrimary} onClick={onNewInterview}>
                    New Interview
                </button>
                <button className={classes.ctaSecondary} onClick={onHistory}>
                    View History
                </button>
            </div>
        </div>
    );
};

// ================================================
// HISTORY VIEW
// ================================================

const HistoryView = ({ onViewReport }) => {
    const { sessionsList } = useSelector((state) => state.Interview);

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    };

    if (!sessionsList.length) {
        return <div className={classes.emptyState}>No past interviews yet. Start your first one!</div>;
    }

    return (
        <div className={classes.historyList}>
            {sessionsList.map((s) => (
                <div
                    key={s.id}
                    className={classes.historyCard}
                    onClick={() => onViewReport(s.id)}
                >
                    <div className={classes.historyInfo}>
                        <h4>{s.role} &middot; {s.type}</h4>
                        <p>{s.difficulty} &middot; {s.duration_min} min &middot; {formatDate(s.created_at)}</p>
                    </div>
                    {s.score && <div className={classes.historyScore}>{s.score}</div>}
                </div>
            ))}
        </div>
    );
};

export default InterviewContainer;
