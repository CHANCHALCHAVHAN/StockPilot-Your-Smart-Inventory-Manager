require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const bcrypt     = require('bcrypt');
const jwt        = require('jsonwebtoken');
const crypto     = require('crypto');
const nodemailer = require('nodemailer');
const pool       = require('./db');

const app = express();
app.use(cors({ origin: ['http://localhost:8080', 'http://localhost:5173'] }));
app.use(express.json());

const SALT_ROUNDS  = 12;
const JWT_SECRET   = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// ── Auth middleware ───────────────────────────────────────────────────────────
function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token provided.' });
  try {
    req.user = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token.' });
  }
}

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

// ── Forgot Password ───────────────────────────────────────────────────────────
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ error: 'Email is required.' });

  try {
    const result = await pool.query('SELECT id, name FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0)
      return res.json({ message: 'If that email exists, a reset link has been sent.' });

    const user    = result.rows[0];
    const token   = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
      [token, expires, user.id]
    );

    const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"CoreInventory" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family:monospace;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:4px">
          <h2 style="color:#dc2626">CORE<span style="color:#111">INVENTORY</span></h2>
          <p>Hi ${user.name},</p>
          <p>Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
          <a href="${resetLink}"
             style="display:inline-block;margin:16px 0;padding:10px 20px;background:#dc2626;color:#fff;text-decoration:none;border-radius:4px;font-weight:bold">
            Reset Password
          </a>
          <p style="color:#6b7280;font-size:12px">If you didn't request this, ignore this email.</p>
        </div>
      `,
    });

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── Reset Password ────────────────────────────────────────────────────────────
app.post('/api/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password)
    return res.status(400).json({ error: 'Token and new password are required.' });

  try {
    const result = await pool.query(
      'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
      [token]
    );
    if (result.rows.length === 0)
      return res.status(400).json({ error: 'Reset link is invalid or has expired.' });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    await pool.query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [hashed, result.rows[0].id]
    );

    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── Products ──────────────────────────────────────────────────────────────────
app.get('/api/products', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, sku, name, category, unit_of_measure as "unitOfMeasure",
       stock, location, created_at, updated_at
       FROM products WHERE user_id = $1 ORDER BY name`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

app.post('/api/products', verifyToken, async (req, res) => {
  const { sku, name, category, unitOfMeasure, stock = 0, location } = req.body;
  if (!sku || !name || !category || !unitOfMeasure)
    return res.status(400).json({ error: 'SKU, name, category, unitOfMeasure required.' });

  try {
    const result = await pool.query(
      `INSERT INTO products (sku, name, category, unit_of_measure, stock, location, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [sku, name, category, unitOfMeasure, stock, location, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

app.put('/api/products/:id', verifyToken, async (req, res) => {
  const { sku, name, category, unitOfMeasure, stock, location } = req.body;
  try {
    const result = await pool.query(
      `UPDATE products SET sku = $1, name = $2, category = $3, unit_of_measure = $4,
       stock = $5, location = $6, updated_at = NOW()
       WHERE id = $7 AND user_id = $8 RETURNING *`,
      [sku, name, category, unitOfMeasure, stock || 0, location, req.params.id, req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Product not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

app.delete('/api/products/:id', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Product not found.' });
    res.json({ message: 'Product deleted.' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
