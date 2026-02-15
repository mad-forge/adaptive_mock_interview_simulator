import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import classes from "./styles.module.scss";

const ReportContainer = () => {
    const navigate = useNavigate();
    const { report, questions, config } = useSelector((state) => state.Interview);
    const user = useSelector((state) => state.Auth.user);
    const initial = user?.name?.charAt(0)?.toUpperCase() || "?";

    if (!report) {
        return (
            <div className={classes.page}>
                <div className={classes.empty}>
                    <p>No report available.</p>
                    <button className={classes.ctaPrimary} onClick={() => navigate("/setup")}>
                        Start New Interview
                    </button>
                </div>
            </div>
        );
    }

    const getScoreClass = (score) => {
        if (score >= 70) return classes.scoreGreat;
        if (score >= 40) return classes.scoreOk;
        return classes.scorePoor;
    };

    const getScoreLabel = (score) => {
        if (score >= 80) return "Excellent";
        if (score >= 60) return "Good";
        if (score >= 40) return "Average";
        return "Needs Work";
    };

    return (
        <div className={classes.page}>
            {/* Nav */}
            <nav className={classes.navbar}>
                <div className={classes.navInner}>
                    <div className={classes.logo}>
                        <span className={classes.logoIcon}>AI</span>
                        InterviewAI
                    </div>
                    <div className={classes.navRight}>
                        <button className={classes.navLink} onClick={() => navigate("/setup")}>New Interview</button>
                        <button className={classes.navLink} onClick={() => navigate("/history")}>History</button>
                        <div className={classes.avatarGroup}>
                            <div className={classes.avatar}>{initial}</div>
                            <span className={classes.avatarName}>{user?.name}</span>
                        </div>
                    </div>
                </div>
            </nav>

            <div className={classes.content}>
                {/* Score Header */}
                <div className={classes.scoreHeader}>
                    <span className={classes.scoreTag}>Interview Complete</span>
                    <div className={`${classes.scoreCircle} ${getScoreClass(report.overall_score)}`}>
                        <span className={classes.scoreNum}>{report.overall_score}</span>
                        <span className={classes.scoreMax}>/100</span>
                    </div>
                    <div className={classes.scoreLabel}>{getScoreLabel(report.overall_score)}</div>
                    <div className={classes.scoreMeta}>
                        {config.role} &middot; {config.type} &middot; {questions.length} questions
                    </div>
                </div>

                {/* Strengths */}
                <div className={classes.section}>
                    <div className={classes.sectionHeader}>
                        <span className={classes.sectionIcon}>+</span>
                        <h3>Strengths</h3>
                    </div>
                    <div className={classes.itemList}>
                        {report.strengths?.map((s, i) => (
                            <div key={i} className={classes.strengthItem}>{s}</div>
                        ))}
                    </div>
                </div>

                {/* Improvements */}
                <div className={classes.section}>
                    <div className={classes.sectionHeader}>
                        <span className={classes.sectionIconWarn}>!</span>
                        <h3>Areas for Improvement</h3>
                    </div>
                    <div className={classes.itemList}>
                        {report.improvements?.map((s, i) => (
                            <div key={i} className={classes.improvementItem}>{s}</div>
                        ))}
                    </div>
                </div>

                {/* Sample Answers */}
                <div className={classes.section}>
                    <div className={classes.sectionHeader}>
                        <span className={classes.sectionIconBlue}>&#8593;</span>
                        <h3>Improved Sample Answers</h3>
                    </div>
                    {report.sample_answers?.map((sa, i) => (
                        <div key={i} className={classes.sampleCard}>
                            <div className={classes.sampleQ}>{sa.question}</div>
                            <div className={classes.sampleBlock}>
                                <span className={classes.sampleTag}>Your Answer</span>
                                <p className={classes.originalText}>{sa.original_answer}</p>
                            </div>
                            <div className={classes.sampleBlock}>
                                <span className={classes.sampleTagGood}>Improved Answer</span>
                                <p className={classes.improvedText}>{sa.improved_answer}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Practice Topics */}
                <div className={classes.section}>
                    <div className={classes.sectionHeader}>
                        <span className={classes.sectionIconBlue}>&#9733;</span>
                        <h3>Suggested Practice Topics</h3>
                    </div>
                    <div className={classes.itemList}>
                        {report.practice_topics?.map((t, i) => (
                            <div key={i} className={classes.topicItem}>{t}</div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className={classes.reportActions}>
                    <button className={classes.ctaPrimary} onClick={() => navigate("/setup")}>
                        Start New Interview
                    </button>
                    <button className={classes.ctaSecondary} onClick={() => navigate("/history")}>
                        View History
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportContainer;
