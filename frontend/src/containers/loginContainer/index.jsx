import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login, clearAuthError } from "../../pages/loginPage/authSlice";
import classes from "./styles.module.scss";

const LoginContainer = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, error } = useSelector((state) => state.Auth);
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (isAuthenticated) navigate("/setup");
    }, [isAuthenticated, navigate]);

    const handleLogin = (e) => {
        e.preventDefault();
        dispatch(clearAuthError());
        dispatch(login({ name, password }));
    };

    const openModal = () => {
        setShowModal(true);
        dispatch(clearAuthError());
    };

    const closeModal = () => {
        setShowModal(false);
        setName("");
        setPassword("");
        dispatch(clearAuthError());
    };

    return (
        <div className={classes.page}>
            {/* Nav */}
            <nav className={classes.nav}>
                <div className={classes.navInner}>
                    <span className={classes.brand}>InterviewAI</span>
                    <button className={classes.navBtn} onClick={openModal}>Start Interview</button>
                </div>
            </nav>

            {/* Hero */}
            <section className={classes.hero}>
                <h1>Practice interviews that<br />actually prepare you.</h1>
                <p>
                    AI-powered mock interviews for software engineers. Pick a role,
                    answer adaptive questions, and get a detailed performance report.
                </p>
                <button className={classes.heroBtn} onClick={openModal}>
                    Start Your Mock Interview
                </button>
            </section>

            {/* Features */}
            <section className={classes.features}>
                <div className={classes.featuresInner}>
                    <div className={classes.feat}>
                        <h3>Adaptive questions</h3>
                        <p>Difficulty adjusts in real time based on how you answer. No two sessions are the same.</p>
                    </div>
                    <div className={classes.feat}>
                        <h3>Instant feedback</h3>
                        <p>Every answer is scored 0-100 with specific feedback so you know exactly what to improve.</p>
                    </div>
                    <div className={classes.feat}>
                        <h3>Detailed reports</h3>
                        <p>Strengths, weaknesses, improved sample answers, and suggested practice topics after each session.</p>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className={classes.steps}>
                <h2>How it works</h2>
                <div className={classes.stepsRow}>
                    <div className={classes.step}>
                        <span className={classes.stepNum}>1</span>
                        <div>
                            <h4>Configure</h4>
                            <p>Pick role, type, difficulty, and duration.</p>
                        </div>
                    </div>
                    <div className={classes.step}>
                        <span className={classes.stepNum}>2</span>
                        <div>
                            <h4>Interview</h4>
                            <p>Answer AI-generated questions with a live timer.</p>
                        </div>
                    </div>
                    <div className={classes.step}>
                        <span className={classes.stepNum}>3</span>
                        <div>
                            <h4>Review</h4>
                            <p>Get your score, feedback, and improvement plan.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className={classes.bottomCta}>
                <h2>Ready to practice?</h2>
                <button className={classes.heroBtn} onClick={openModal}>Start Your Mock Interview</button>
            </section>

            {/* Footer */}
            <footer className={classes.footer}>
                <span className={classes.brand}>InterviewAI</span>
                <span className={classes.footerText}>Built for hackathon demo</span>
            </footer>

            {/* Modal */}
            {showModal && (
                <div className={classes.overlay} onClick={closeModal}>
                    <div className={classes.modal} onClick={(e) => e.stopPropagation()}>
                        <button className={classes.close} onClick={closeModal}>&times;</button>
                        <h2>Sign in</h2>
                        <p className={classes.modalSub}>Enter your name and password to continue.</p>
                        <form onSubmit={handleLogin}>
                            <label>Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => { setName(e.target.value); dispatch(clearAuthError()); }}
                                placeholder="Your name"
                                autoFocus
                            />
                            <label>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); dispatch(clearAuthError()); }}
                                placeholder="Access password"
                            />
                            {error && <div className={classes.err}>{error}</div>}
                            <button type="submit" className={classes.submitBtn}>Continue</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginContainer;
