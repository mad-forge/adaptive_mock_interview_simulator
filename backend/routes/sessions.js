import { Router } from 'express';
import pool from '../db/pool.js';

const router = Router();

// GET /api/sessions — list past sessions
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;

    const { rows } = await pool.query(
      `SELECT id, role, difficulty, type, duration_min, status,
              report->>'overall_score' as score,
              created_at, completed_at
       FROM sessions
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({ sessions: rows });
  } catch (err) {
    console.error('GET /sessions error:', err);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// GET /api/sessions/:id — get full session with questions + report
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const sessionResult = await pool.query(
      'SELECT * FROM sessions WHERE id = $1',
      [id]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const questionsResult = await pool.query(
      'SELECT * FROM questions WHERE session_id = $1 ORDER BY sequence_num',
      [id]
    );

    res.json({
      session: sessionResult.rows[0],
      questions: questionsResult.rows,
    });
  } catch (err) {
    console.error('GET /sessions/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

export default router;
