
const express = require('express');
const cors = require('cors');
const todoRoutes = require('./routes/todoRoutes');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/todos', todoRoutes);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
