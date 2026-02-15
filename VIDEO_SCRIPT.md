# Video Walkthrough Script (3-4 Minutes)

---

## [0:00 - 0:20] INTRO

"Hi, this is the AI-Powered Adaptive Mock Interview Simulator — a full-stack web application built for practicing technical interviews with real-time AI feedback."

"The tech stack is React with Vite on the frontend, Express.js and PostgreSQL on the backend, and OpenAI GPT-4o-mini powering all the AI features."

---

## [0:20 - 0:50] LANDING PAGE + LOGIN

*Show the landing page*

"Here's the landing page. It explains what the platform does — adaptive questions, instant feedback, and detailed reports."

*Click 'Start Your Mock Interview' button*

"When the user clicks this, a sign-in modal appears. I enter my name and the access password."

*Type name, type 1234, click Continue*

"After signing in, notice my name and avatar appear in the navbar — this persists across all pages, even on refresh."

---

## [0:50 - 1:30] SETUP PAGE

*Show the setup page*

"This is the interview configuration screen. There are four things to set up."

*Click through each option*

"First, I select a **role** — let's go with Frontend Engineer."

"Next, **interview type** — I'll pick Technical."

"Then **difficulty** — I'll choose Medium. The AI will generate all questions at this difficulty level."

"Finally, **duration** — I'll select 15 minutes for a quick demo."

*Click 'Start Interview'*

"Once I hit Start Interview, the system creates a session in the database and the AI generates the first question."

---

## [1:30 - 2:30] LIVE INTERVIEW SESSION

*Show the session page*

"Now we're in the live interview. At the top you can see the role, difficulty, and a live countdown timer."

"Below that is a progress bar showing which question we're on — Question 1 of approximately 7."

*Point to the question*

"The AI has generated a question appropriate for the medium difficulty level. Let me type an answer."

*Type an answer and click Submit*

"After submitting, the AI evaluates my answer instantly. It shows a score out of 100, a quality rating, and specific feedback telling me what was good and what was missing."

"The scoring is strict — a vague answer gets low marks, and the feedback is direct and honest."

*Show a follow-up question if visible*

"Notice this question is tagged as a 'Follow-up' — the AI detected an area to probe deeper based on my previous answer. Every session gets at least one follow-up question."

*Answer one more question*

"The feedback is calibrated to the difficulty level — medium expects examples and real-world scenarios, not just surface-level definitions."

---

## [2:30 - 3:15] PERFORMANCE REPORT

*Navigate to report page (either timer runs out or click End Interview)*

"When the session ends, the AI generates a complete performance report."

*Scroll through the report*

"At the top is the overall score out of 100 — this is a weighted average, not inflated."

"Then there are 3 specific strengths identified from my answers."

"3 improvement areas — each one is actionable and tells me exactly what to study."

"Below that are improved sample answers for my 2 weakest responses — showing what a strong answer would look like."

"And finally, suggested practice topics tailored to the gaps in my performance."

---

## [3:15 - 3:45] HISTORY + DATABASE

*Click 'View History'*

"Every session is stored in the PostgreSQL database. The history page shows all past interviews with the role, difficulty, type, score, and date."

*Click on a past session*

"I can click any session to view its full report again."

*Briefly show the database schema or backend code (optional)*

"On the backend, there are two tables — sessions and questions — storing the full transcript, scores, and the AI-generated report as JSONB."

---

## [3:45 - 4:00] CLOSING

"To summarize — the platform handles role selection, timed adaptive interviews, AI question generation with follow-ups, strict scoring and evaluation, structured performance reports, and persistent session history."

"All AI operations — question generation, follow-up logic, answer evaluation, and report generation — are powered by GPT-4o-mini through carefully engineered prompts."

"Thank you for watching."

---
