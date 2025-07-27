
const db = require('../db');

exports.getAllTodos = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM todos');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.createTodo = async (req, res) => {
  try {
    const { description } = req.body;
    const { rows } = await db.query(
      'INSERT INTO todos (description) VALUES ($1) RETURNING *',
      [description]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getTodoById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT * FROM todos WHERE id = $1', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Todo not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, completed } = req.body;
    const { rows } = await db.query(
      'UPDATE todos SET description = $1, completed = $2 WHERE id = $3 RETURNING *',
      [description, completed, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Todo not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('DELETE FROM todos WHERE id = $1 RETURNING *', [
      id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Todo not found' });
    }
    res.json({ msg: 'Todo deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
