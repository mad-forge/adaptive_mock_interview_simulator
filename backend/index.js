import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import sessionRoutes from './routes/sessions.js';
import interviewRoutes from './routes/interview.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/sessions', interviewRoutes);  // POST /, POST /:id/answer, POST /:id/end
app.use('/api/sessions', sessionRoutes);    // GET /, GET /:id

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
