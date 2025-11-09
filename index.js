import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import multer from 'multer';
import fs from 'fs';
import { sendEmail } from './utils/emailStub.js';
import { csvToUsersSql } from './utils/csvImporter.js';

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*' } });
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET;
const RESET_JWT_SECRET = process.env.RESET_JWT_SECRET || JWT_SECRET;

function authRequired(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

app.post('/api/auth/signup', async (req, res) => {
  const { username, password, full_name, role } = req.body;
  if (!username || !password || !role) return res.status(400).json({ error: 'missing fields' });
  const hash = await bcrypt.hash(password, 10);
  try {
    const r = await pool.query('INSERT INTO users (username, password_hash, full_name, role) VALUES ($1,$2,$3,$4) RETURNING id, username, full_name, role', [username, hash, full_name, role]);
    const user = r.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: 'server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const r = await pool.query('SELECT * FROM users WHERE username=$1', [username]);
  const user = r.rows[0];
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ user: { id: user.id, username: user.username, role: user.role, full_name: user.full_name }, token });
});

app.post('/api/auth/request-reset', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'username required' });
  const r = await pool.query('SELECT id, username FROM users WHERE username=$1', [username]);
  const user = r.rows[0];
  if (!user) return res.status(200).json({ ok: true });
  const token = jwt.sign({ id: user.id }, RESET_JWT_SECRET, { expiresIn: '1h' });
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  await sendEmail(user.username, 'Password reset', `Click here to reset: ${resetUrl}`);
  res.json({ ok: true });
});

app.post('/api/auth/reset', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ error: 'token and newPassword required' });
  try {
    const payload = jwt.verify(token, RESET_JWT_SECRET);
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hash, payload.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: 'Invalid or expired token' });
  }
});

app.get('/api/dashboard', authRequired, async (req, res) => {
  const { id, role } = req.user;
  if (role === 'student') {
    const batches = await pool.query('SELECT b.* FROM batches b JOIN batch_members bm ON b.id=bm.batch_id WHERE bm.user_id=$1', [id]);
    const assignments = await pool.query('SELECT a.* FROM assignments a JOIN batch_members bm ON a.batch_id=bm.batch_id WHERE bm.user_id=$1', [id]);
    res.json({ batches: batches.rows, assignments: assignments.rows });
    return;
  }
  if (role === 'teacher') {
    const myBatches = await pool.query('SELECT * FROM batches WHERE created_by=$1', [id]);
    const assignments = await pool.query('SELECT * FROM assignments WHERE created_by=$1', [id]);
    res.json({ batches: myBatches.rows, assignments: assignments.rows });
    return;
  }
  if (role === 'ceo') {
    const stats = await pool.query("SELECT (SELECT count(*) FROM users WHERE role='student') AS students, (SELECT count(*) FROM users WHERE role='teacher') AS teachers");
    res.json({ stats: stats.rows[0] });
    return;
  }
  res.status(400).json({ error: 'unknown role' });
});

app.post('/api/batches', authRequired, async (req, res) => {
  const { id, role } = req.user;
  if (!['teacher', 'ceo'].includes(role)) return res.status(403).json({ error: 'forbidden' });
  const { name, description } = req.body;
  const r = await pool.query('INSERT INTO batches (name, description, created_by) VALUES ($1,$2,$3) RETURNING *', [name, description, id]);
  res.json(r.rows[0]);
});

app.post('/api/batch-members', authRequired, async (req, res) => {
  const { id, role } = req.user;
  if (role !== 'ceo') return res.status(403).json({ error: 'only ceo' });
  const { batch_id, user_id, role_in_batch } = req.body;
  const r = await pool.query('INSERT INTO batch_members (batch_id, user_id, role_in_batch) VALUES ($1,$2,$3) RETURNING *', [batch_id, user_id, role_in_batch || 'student']);
  res.json(r.rows[0]);
});

app.post('/api/assignments', authRequired, async (req, res) => {
  const { id, role } = req.user;
  if (role !== 'teacher') return res.status(403).json({ error: 'only teachers' });
  const { title, description, batch_id, due_date, points } = req.body;
  const r = await pool.query('INSERT INTO assignments (title, description, batch_id, created_by, points, due_date) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *', [title, description, batch_id, id, points || 100, due_date]);
  const assignment = r.rows[0];
  io.to('batch_' + batch_id).emit('new_assignment', assignment);
  res.json(assignment);
});

app.post('/api/submissions', authRequired, async (req, res) => {
  const { id, role } = req.user;
  if (role !== 'student') return res.status(403).json({ error: 'only students' });
  const { assignment_id, content, file_url } = req.body;
  const r = await pool.query('INSERT INTO submissions (assignment_id, student_id, content, file_url) VALUES ($1,$2,$3,$4) RETURNING *', [assignment_id, id, content, file_url]);
  const a = await pool.query('SELECT batch_id FROM assignments WHERE id=$1', [assignment_id]);
  const batch_id = a.rows[0].batch_id;
  io.to('batch_' + batch_id).emit('submission', r.rows[0]);
  res.json(r.rows[0]);
});

app.post('/api/submissions/:id/grade', authRequired, async (req, res) => {
  const { role } = req.user;
  if (role !== 'teacher') return res.status(403).json({ error: 'only teachers' });
  const submissionId = req.params.id;
  const { grade, feedback } = req.body;
  const r = await pool.query('UPDATE submissions SET grade=$1, feedback=$2 WHERE id=$3 RETURNING *', [grade, feedback, submissionId]);
  res.json(r.rows[0]);
});

const upload = multer({ dest: 'uploads/' });
app.post('/api/upload', authRequired, upload.single('file'), async (req, res) => {
  const file = req.file;
  const url = `/uploads/${file.filename}`;
  res.json({ url });
});

app.post('/api/import-csv', authRequired, async (req, res) => {
  const { id, role } = req.user;
  if (role !== 'ceo') return res.status(403).json({ error: 'only ceo' });
  if (!req.body.csv) return res.status(400).json({ error: 'csv required in body' });
  const tmp = './tmp_bulk.csv';
  fs.writeFileSync(tmp, req.body.csv);
  const sql = csvToUsersSql(tmp);
  await pool.query('BEGIN');
  try {
    await pool.query(sql);
    await pool.query('COMMIT');
    res.json({ ok: true });
  } catch (e) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: 'import failed', detail: e.message });
  } finally {
    fs.unlinkSync(tmp);
  }
});

io.on('connection', (socket) => {
  socket.on('join_batch', ({ batch_id }) => {
    socket.join('batch_' + batch_id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log('Server listening on', PORT));
