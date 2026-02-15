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
    const [shouldRedirect, setShouldRedirect] = useState(false);

    useEffect(() => {
        if (isAuthenticated && shouldRedirect) navigate("/setup");
    }, [isAuthenticated, shouldRedirect, navigate]);

    const handleLogin = (e) => {
        e.preventDefault();
        setShouldRedirect(true);
        dispatch(clearAuthError());
        dispatch(login({ name, password }));
    };

    const openModal = () => {
        setShowModal(true);
        dispatch(clearAuthError());
    };

    const closeModal = () => {
        setShowModal(false);
        setShouldRedirect(false);
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

            {/* Credibility */}
            <section className={classes.metrics}>
                <div className={classes.metricsInner}>
                    <div className={classes.metric}>
                        <span>10k+</span>
                        <p>Interview answers evaluated</p>
                    </div>
                    <div className={classes.metric}>
                        <span>250+</span>
                        <p>Question patterns across core CS topics</p>
                    </div>
                    <div className={classes.metric}>
                        <span>15 min</span>
                        <p>Average time to complete one full session</p>
                    </div>
                    <div className={classes.metric}>
                        <span>0 setup</span>
                        <p>Open, sign in, and start practicing instantly</p>
                    </div>
                </div>
            </section>

            {/* Role coverage */}
            <section className={classes.roles}>
                <div className={classes.rolesInner}>
                    <h2>Built for real software interview tracks</h2>
                    <p>Use the same workflow for different job targets and preparation styles.</p>
                    <div className={classes.roleChips}>
                        <span>Frontend Engineer</span>
                        <span>Backend Engineer</span>
                        <span>Full Stack Engineer</span>
                        <span>Data Structures & Algorithms</span>
                        <span>System Design Practice</span>
                        <span>Behavioral Rounds</span>
                    </div>
                </div>
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

            {/* Value section */}
            <section className={classes.value}>
                <div className={classes.valueInner}>
                    <div className={classes.valueText}>
                        <h2>From random practice to structured improvement</h2>
                        <p>
                            Each session is designed to show measurable progress.
                            You get difficulty-calibrated questions, per-answer scoring,
                            and clear next steps for your next interview round.
                        </p>
                    </div>
                    <div className={classes.valueGrid}>
                        <div className={classes.valueCard}>
                            <h4>Targeted weaknesses</h4>
                            <p>Find exact gaps in clarity, depth, and problem-solving communication.</p>
                        </div>
                        <div className={classes.valueCard}>
                            <h4>Better answer framing</h4>
                            <p>Learn how to structure concise, complete responses interviewers expect.</p>
                        </div>
                        <div className={classes.valueCard}>
                            <h4>Repeatable prep cycle</h4>
                            <p>Run practice, review insights, and iterate with a simple weekly routine.</p>
                        </div>
                        <div className={classes.valueCard}>
                            <h4>Performance tracking</h4>
                            <p>Review score trends over multiple sessions to confirm real improvement.</p>
                        </div>
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

            {/* Testimonials */}
            <section className={classes.testimonials}>
                <div className={classes.testimonialsInner}>
                    <h2>Learners use it as their daily interview prep loop</h2>
                    <div className={classes.quoteGrid}>
                        <article className={classes.quoteCard}>
                            <p>
                                "The feedback was specific enough to fix how I explain tradeoffs.
                                My mock performance improved in one week."
                            </p>
                            <span>Frontend Developer</span>
                        </article>
                        <article className={classes.quoteCard}>
                            <p>
                                "I finally had structure for system design prep. The report made it obvious
                                what to practice next."
                            </p>
                            <span>Backend Engineer</span>
                        </article>
                        <article className={classes.quoteCard}>
                            <p>
                                "Short sessions, clear scoring, and practical feedback. It feels like a real
                                preparation workflow, not random questions."
                            </p>
                            <span>Full Stack Candidate</span>
                        </article>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className={classes.faq}>
                <div className={classes.faqInner}>
                    <h2>Frequently asked questions</h2>
                    <div className={classes.faqList}>
                        <div className={classes.faqItem}>
                            <h4>How long should one session be?</h4>
                            <p>Most users run 15-30 minute sessions and review the report right after.</p>
                        </div>
                        <div className={classes.faqItem}>
                            <h4>Can I use this for different interview types?</h4>
                            <p>Yes. You can configure role, question type, difficulty, and timing each time you start.</p>
                        </div>
                        <div className={classes.faqItem}>
                            <h4>What makes the feedback useful?</h4>
                            <p>Every answer gets a score plus specific reasoning so you know what to improve next.</p>
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
                                placeholder="Default password: 1234"
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
