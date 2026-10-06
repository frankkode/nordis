const path = require('path');
const express = require('express');
const data = require('./data');

const app = express();
const messages = [];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (req, res) => res.json({ ok: true, name: 'nordis' }));
app.get('/api/services', (req, res) => res.json(data.services));
app.get('/api/case-studies', (req, res) => res.json(data.caseStudies));
app.get('/api/posts', (req, res) => res.json(data.posts));
app.get('/api/jobs', (req, res) => res.json(data.jobs));
app.get('/api/team', (req, res) => res.json(data.team));

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body || {};
  const errors = {};
  if (typeof name !== 'string' || !name.trim()) errors.name = 'Name is required';
  if (typeof email !== 'string' || !EMAIL_RE.test(email)) errors.email = 'A valid email is required';
  if (typeof message !== 'string' || message.trim().length < 10) errors.message = 'Message must be at least 10 characters';
  if (Object.keys(errors).length) return res.status(400).json({ errors });
  messages.push({ name: name.trim(), email: email.trim(), message: message.trim(), at: new Date().toISOString() });
  res.status(201).json({ ok: true });
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));
app.use(express.static(path.join(__dirname, '..', 'frontend'), { extensions: ['html'] }));

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Nordis running on http://localhost:${port}`));
}

module.exports = app;
