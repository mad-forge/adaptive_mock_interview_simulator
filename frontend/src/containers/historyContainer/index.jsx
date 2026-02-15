import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchSessionsList, fetchSession } from "../../pages/interviewPage/interviewThunk";
import classes from "./styles.module.scss";

const HistoryContainer = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { sessionsList } = useSelector((state) => state.Interview);
    const user = useSelector((state) => state.Auth.user);
    const initial = user?.name?.charAt(0)?.toUpperCase() || "?";

    useEffect(() => {
        dispatch(fetchSessionsList());
    }, [dispatch]);

    const handleViewReport = (sessionId) => {
        dispatch(fetchSession({ sessionId }));
        navigate("/report");
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getScoreClass = (score) => {
        if (!score && score !== 0) return "";
        if (score >= 70) return classes.scoreGreat;
        if (score >= 40) return classes.scoreOk;
        return classes.scorePoor;
    };

    const getDifficultyClass = (difficulty) => {
        const map = { easy: classes.diffEasy, medium: classes.diffMedium, hard: classes.diffHard };
        return map[difficulty] || "";
    };

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
                        <button className={classes.navLink} onClick={() => navigate("/setup")}>
                            New Interview
                        </button>
                        <div className={classes.avatarGroup}>
                            <div className={classes.avatar}>{initial}</div>
                            <span className={classes.avatarName}>{user?.name}</span>
                        </div>
                    </div>
                </div>
            </nav>

            <div className={classes.content}>
                <div className={classes.header}>
                    <button className={classes.backBtn} onClick={() => navigate("/setup")}>
                        &larr; Back
                    </button>
                    <h1>Interview History</h1>
                    <p>{sessionsList.length} session{sessionsList.length !== 1 ? "s" : ""}</p>
                </div>

                {sessionsList.length === 0 ? (
                    <div className={classes.empty}>
                        <p>No past interviews yet. Start your first one!</p>
                        <button className={classes.ctaPrimary} onClick={() => navigate("/setup")}>
                            Start Interview
                        </button>
                    </div>
                ) : (
                    <div className={classes.list}>
                        {sessionsList.map((s) => (
                            <div
                                key={s.id}
                                className={classes.card}
                                onClick={() => handleViewReport(s.id)}
                            >
                                <div className={classes.cardLeft}>
                                    <div className={classes.cardTitle}>
                                        <h4>{s.role}</h4>
                                        <span className={`${classes.diffBadge} ${getDifficultyClass(s.difficulty)}`}>
                                            {s.difficulty}
                                        </span>
                                    </div>
                                    <div className={classes.cardMeta}>
                                        <span className={classes.metaChip}>{s.type}</span>
                                        <span className={classes.metaChip}>{s.duration_min} min</span>
                                        <span className={classes.metaDate}>{formatDate(s.created_at)}</span>
                                    </div>
                                </div>
                                <div className={classes.cardRight}>
                                    {(s.score || s.score === 0) ? (
                                        <div className={`${classes.cardScore} ${getScoreClass(s.score)}`}>
                                            {s.score}
                                        </div>
                                    ) : (
                                        <div className={classes.cardStatus}>
                                            {s.status === "completed" ? "View" : "In Progress"}
                                        </div>
                                    )}
                                    <span className={classes.cardArrow}>&rarr;</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryContainer;
