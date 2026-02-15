import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../pages/loginPage/authSlice";
import { createSession } from "../../pages/interviewPage/interviewThunk";
import { setConfig, resetInterview } from "../../pages/interviewPage/interviewSlice";
import { useEffect } from "react";
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
    { value: "easy", label: "Easy", desc: "Fundamentals & basics" },
    { value: "medium", label: "Medium", desc: "Intermediate concepts" },
    { value: "hard", label: "Hard", desc: "Advanced & in-depth" },
];

const DURATIONS = [
    { value: 15, label: "15 min", desc: "Quick practice" },
    { value: 30, label: "30 min", desc: "Standard session" },
    { value: 45, label: "45 min", desc: "Deep dive" },
    { value: 60, label: "60 min", desc: "Full interview" },
];

const SetupContainer = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { config, status } = useSelector((state) => state.Interview);
    const user = useSelector((state) => state.Auth.user);

    const initial = user?.name?.charAt(0)?.toUpperCase() || "?";

    useEffect(() => {
        dispatch(resetInterview());
    }, [dispatch]);

    useEffect(() => {
        if (status === "active") {
            navigate("/session");
        }
    }, [status, navigate]);

    const handleChange = (field, value) => {
        dispatch(setConfig({ [field]: field === "duration_min" ? Number(value) : value }));
    };

    const handleStart = () => {
        if (!config.role || !config.difficulty || !config.type) return;
        dispatch(createSession({ data: config }));
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate("/");
    };

    const isReady = config.role && config.difficulty && config.type && config.duration_min;

    return (
        <div className={classes.page}>
            {/* Navbar */}
            <nav className={classes.navbar}>
                <div className={classes.navInner}>
                    <div className={classes.logo}>
                        <span className={classes.logoIcon}>AI</span>
                        InterviewAI
                    </div>
                    <div className={classes.navRight}>
                        <button className={classes.navLink} onClick={() => navigate("/history")}>
                            History
                        </button>
                        <div className={classes.profileGroup}>
                            <div className={classes.avatar}>{initial}</div>
                            <div className={classes.profileInfo}>
                                <span className={classes.profileName}>{user?.name}</span>
                                <button className={classes.logoutBtn} onClick={handleLogout}>
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Setup Content */}
            <div className={classes.content}>
                <div className={classes.header}>
                    <h1>Configure Your Interview</h1>
                    <p>Choose your settings and jump straight into a mock interview session.</p>
                </div>

                <div className={classes.formCard}>
                    {/* Role */}
                    <div className={classes.formSection}>
                        <label className={classes.formLabel}>Target Role</label>
                        <div className={classes.roleGrid}>
                            {ROLES.map((r) => (
                                <button
                                    key={r}
                                    className={`${classes.roleChip} ${config.role === r ? classes.active : ""}`}
                                    onClick={() => handleChange("role", r)}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Interview Type */}
                    <div className={classes.formSection}>
                        <label className={classes.formLabel}>Interview Type</label>
                        <div className={classes.optionGrid}>
                            {TYPES.map((t) => (
                                <button
                                    key={t.value}
                                    className={`${classes.optionCard} ${config.type === t.value ? classes.active : ""}`}
                                    onClick={() => handleChange("type", t.value)}
                                >
                                    <span className={classes.optionTitle}>{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Difficulty */}
                    <div className={classes.formSection}>
                        <label className={classes.formLabel}>Difficulty Level</label>
                        <div className={classes.optionGrid}>
                            {DIFFICULTIES.map((d) => (
                                <button
                                    key={d.value}
                                    className={`${classes.optionCard} ${config.difficulty === d.value ? classes.active : ""}`}
                                    onClick={() => handleChange("difficulty", d.value)}
                                >
                                    <span className={classes.optionTitle}>{d.label}</span>
                                    <span className={classes.optionDesc}>{d.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Duration */}
                    <div className={classes.formSection}>
                        <label className={classes.formLabel}>Session Duration</label>
                        <div className={classes.durationGrid}>
                            {DURATIONS.map((d) => (
                                <button
                                    key={d.value}
                                    className={`${classes.durationChip} ${config.duration_min === d.value ? classes.active : ""}`}
                                    onClick={() => handleChange("duration_min", d.value)}
                                >
                                    <strong>{d.label}</strong>
                                    <span>{d.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Start Button */}
                    <button
                        className={classes.startBtn}
                        onClick={handleStart}
                        disabled={!isReady || status === "loading"}
                    >
                        {status === "loading" ? "Starting Session..." : "Start Interview"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SetupContainer;
