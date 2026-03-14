require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const bcrypt     = require('bcrypt');
const jwt        = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const pool       = require('./db');

const app = express();
app.use(cors({ origin: ['http://localhost:8080', 'http://localhost:5173'] }));
app.use(express.json());

const SALT_ROUNDS = 12;
const JWT_SECRET  = process.env.JWT_SECRET;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// ── Signup ────────────────────────────────────────────────────────────────────
app.post('/api/signup', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role)
    return res.status(400).json({ error: 'All fields are required.' });
  if (!['Inventory Manager', 'Warehouse Staff'].includes(role))
    return res.status(400).json({ error: 'Invalid role.' });
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0)
      return res.status(409).json({ error: 'Email already registered.' });
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
      [name, email, hashed, role]
    );
    res.status(201).json({ message: 'Account created.', user: result.rows[0] });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── Login ─────────────────────────────────────────────────────────────────────
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required.' });
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0)
      return res.status(401).json({ error: 'Invalid credentials.' });
    const user  = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ error: 'Invalid credentials.' });
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── Send OTP ──────────────────────────────────────────────────────────────────
app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ error: 'Email is required.' });

  try {
    const result = await pool.query('SELECT id, name FROM users WHERE email = $1', [email]);
    // Always respond the same way to prevent user enumeration
    if (result.rows.length === 0)
      return res.json({ message: 'If that email is registered, an OTP has been sent.' });

    const user    = result.rows[0];
    const otp     = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
    const expires = new Date(Date.now() + 10 * 60 * 1000);               // 10 minutes

    await pool.query(
      'UPDATE users SET otp = $1, otp_expires = $2 WHERE id = $3',
      [otp, expires, user.id]
    );

    await transporter.sendMail({
      from: `"CoreInventory" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Password Reset OTP',
      html: `
        <div style="font-family:monospace;max-width:420px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:4px">
          <h2 style="margin:0 0 8px">CORE<span style="color:#dc2626">INVENTORY</span></h2>
          <p>Hi ${user.name},</p>
          <p>Use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.</p>
          <div style="font-size:32px;font-weight:bold;letter-spacing:10px;color:#dc2626;margin:20px 0;text-align:center">
            ${otp}
          </div>
          <p style="color:#6b7280;font-size:12px">If you didn't request this, ignore this email.</p>
        </div>
      `,
    });

    res.json({ message: 'If that email is registered, an OTP has been sent.' });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── Verify OTP & Reset Password ───────────────────────────────────────────────
app.post('/api/verify-otp', async (req, res) => {
  const { email, otp, password } = req.body;
  if (!email || !otp || !password)
    return res.status(400).json({ error: 'Email, OTP, and new password are required.' });

  try {
    const result = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND otp = $2 AND otp_expires > NOW()',
      [email, otp]
    );
    if (result.rows.length === 0)
      return res.status(400).json({ error: 'Invalid or expired OTP.' });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    await pool.query(
      'UPDATE users SET password = $1, otp = NULL, otp_expires = NULL WHERE id = $2',
      [hashed, result.rows[0].id]
    );

    res.json({ message: 'Password reset successfully.' });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
