const express = require('express');
const pool = require('./db');

const router = express.Router();
const fields = ['name', 'email', 'department', 'semester', 'cgpa'];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateStudent(body, { partial = false } = {}) {
  const errors = [];
  for (const field of fields) {
    if (!(field in body)) {
      if (!partial) errors.push(`${field} is required`);
      continue;
    }
    const value = body[field];
    if (field === 'semester' || field === 'cgpa') {
      if (value === '' || value === null || !Number.isFinite(Number(value))) {
        errors.push(`${field} must be a number`);
      } else if (field === 'semester' && (!Number.isInteger(Number(value)) || Number(value) < 1 || Number(value) > 12)) {
        errors.push('semester must be an integer between 1 and 12');
      } else if (field === 'cgpa' && (Number(value) < 0 || Number(value) > 10)) {
        errors.push('cgpa must be between 0 and 10');
      }
    } else if (typeof value !== 'string' || !value.trim()) {
      errors.push(`${field} must be a non-empty string`);
    } else if (field === 'email' && !emailPattern.test(value.trim())) {
      errors.push('email must be a valid email address');
    }
  }
  return errors;
}

function toStudent(body) {
  return {
    name: body.name.trim(),
    email: body.email.trim().toLowerCase(),
    department: body.department.trim(),
    semester: Number(body.semester),
    cgpa: Number(body.cgpa)
  };
}

function isDuplicateEmail(error) {
  return error && error.code === 'ER_DUP_ENTRY';
}

function handleDatabaseError(error, res, next) {
  if (isDuplicateEmail(error)) {
    return res.status(409).json({ error: 'A student with this email already exists.' });
  }
  return next(error);
}

router.get('/', async (req, res, next) => {
  try {
    const department = typeof req.query.department === 'string' ? req.query.department.trim() : '';
    const [rows] = department
      ? await pool.execute(
          'SELECT student_id, name, email, department, semester, cgpa, created_at, updated_at FROM students WHERE department = ? ORDER BY student_id',
          [department]
        )
      : await pool.execute(
          'SELECT student_id, name, email, department, semester, cgpa, created_at, updated_at FROM students ORDER BY student_id'
        );
    res.json({ data: rows });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'Student ID must be a positive integer.' });
    const [rows] = await pool.execute(
      'SELECT student_id, name, email, department, semester, cgpa, created_at, updated_at FROM students WHERE student_id = ?',
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Student not found.' });
    res.json({ data: rows[0] });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  const errors = validateStudent(req.body);
  if (errors.length) return res.status(400).json({ error: 'Validation failed.', details: errors });
  const student = toStudent(req.body);
  try {
    const [result] = await pool.execute(
      'INSERT INTO students (name, email, department, semester, cgpa) VALUES (?, ?, ?, ?, ?)',
      [student.name, student.email, student.department, student.semester, student.cgpa]
    );
    const [rows] = await pool.execute(
      'SELECT student_id, name, email, department, semester, cgpa, created_at, updated_at FROM students WHERE student_id = ?',
      [result.insertId]
    );
    res.status(201).json({ message: 'Student created.', data: rows[0] });
  } catch (error) {
    handleDatabaseError(error, res, next);
  }
});

router.put('/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'Student ID must be a positive integer.' });
  const errors = validateStudent(req.body);
  if (errors.length) return res.status(400).json({ error: 'Validation failed.', details: errors });
  const student = toStudent(req.body);
  try {
    const [existing] = await pool.execute('SELECT student_id FROM students WHERE student_id = ?', [id]);
    if (!existing.length) return res.status(404).json({ error: 'Student not found.' });
    await pool.execute(
      'UPDATE students SET name = ?, email = ?, department = ?, semester = ?, cgpa = ? WHERE student_id = ?',
      [student.name, student.email, student.department, student.semester, student.cgpa, id]
    );
    const [rows] = await pool.execute(
      'SELECT student_id, name, email, department, semester, cgpa, created_at, updated_at FROM students WHERE student_id = ?',
      [id]
    );
    res.json({ message: 'Student updated.', data: rows[0] });
  } catch (error) {
    handleDatabaseError(error, res, next);
  }
});

router.patch('/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'Student ID must be a positive integer.' });
  const keys = Object.keys(req.body);
  if (!keys.length || keys.some((key) => !fields.includes(key))) {
    return res.status(400).json({ error: 'Provide one or more valid student fields to update.' });
  }
  const errors = validateStudent(req.body, { partial: true });
  if (errors.length) return res.status(400).json({ error: 'Validation failed.', details: errors });
  try {
    const [existing] = await pool.execute('SELECT student_id FROM students WHERE student_id = ?', [id]);
    if (!existing.length) return res.status(404).json({ error: 'Student not found.' });
    const values = {};
    for (const key of keys) values[key] = req.body[key];
    if (values.name !== undefined) values.name = values.name.trim();
    if (values.email !== undefined) values.email = values.email.trim().toLowerCase();
    if (values.department !== undefined) values.department = values.department.trim();
    if (values.semester !== undefined) values.semester = Number(values.semester);
    if (values.cgpa !== undefined) values.cgpa = Number(values.cgpa);
    const assignments = keys.map((key) => `\`${key}\` = ?`).join(', ');
    await pool.execute(`UPDATE students SET ${assignments} WHERE student_id = ?`, [...keys.map((key) => values[key]), id]);
    const [rows] = await pool.execute(
      'SELECT student_id, name, email, department, semester, cgpa, created_at, updated_at FROM students WHERE student_id = ?',
      [id]
    );
    res.json({ message: 'Student updated.', data: rows[0] });
  } catch (error) {
    handleDatabaseError(error, res, next);
  }
});

router.delete('/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'Student ID must be a positive integer.' });
  try {
    const [result] = await pool.execute('DELETE FROM students WHERE student_id = ?', [id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Student not found.' });
    res.status(200).json({ message: 'Student deleted.', student_id: id });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

