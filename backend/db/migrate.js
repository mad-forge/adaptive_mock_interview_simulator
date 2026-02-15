import 'dotenv/config';
import pg from 'pg';

const dbUrl = process.env.DATABASE_URL.replace(/[?&]sslmode=[^&]*/g, '');

const pool = new pg.Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

const schema = `
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";

  CREATE TABLE IF NOT EXISTS sessions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role          VARCHAR(100) NOT NULL,
    difficulty    VARCHAR(20)  NOT NULL,
    type          VARCHAR(50)  NOT NULL,
    duration_min  INTEGER      NOT NULL,
    status        VARCHAR(20)  NOT NULL DEFAULT 'in_progress',
    report        JSONB,
    created_at    TIMESTAMP DEFAULT NOW(),
    completed_at  TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS questions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    sequence_num    INTEGER NOT NULL,
    question_text   TEXT NOT NULL,
    answer_text     TEXT,
    score           INTEGER,
    feedback        TEXT,
    quality         VARCHAR(20),
    difficulty      VARCHAR(20) NOT NULL,
    is_followup     BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_questions_session
    ON questions(session_id, sequence_num);
`;

async function migrate() {
  console.log('Running database migration...');
  try {
    await pool.query(schema);
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
