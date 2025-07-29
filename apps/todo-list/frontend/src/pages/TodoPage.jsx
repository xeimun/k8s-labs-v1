import React, { useState, useEffect } from 'react';
import TodoInput from '../components/TodoInput';
import TodoList from '../components/TodoList';
import api from '../api/api';

function TodoPage() {
  const [todos, setTodos] = useState([]);

  const fetchTodos = async () => {
    try {
      const response = await api.get('/api/todos');
      console.log(response.data);
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  function addTodo(title) {
    api
      .post('/api/todos', { title: title, completed: false })
      .then((res) => {
        setTodos([...todos, res.data]);
      })
      .catch((err) => {
        console.error('Error occured on fetching', err);
      });
  }

  function updateTodo(newTodo) {
    api
      .put(`/api/todos/${newTodo.id}`, newTodo)
      .then((response) => {
        setTodos(
          todos.map((todo) => (todo._id == newTodo.id ? response.data : todo))
        );
      })
      .catch((error) => {
        console.error('There was an error updating the todo!', error);
      });
  }

  function removeTodo(id) {
    api
      .delete(`/api/todos/${id}`)
      .then(() => {
        setTodos(todos.filter((todo) => todo._id !== id));
      })
      .catch((error) => {
        console.error('There was an error deleting the todo!', error);
      });
  }

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div className="bg-blue-200 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <h1 className="text-4xl font-bold text-black-600 ml-2">TodoList</h1>
        </div>
        <TodoInput addTodo={addTodo} />
        <TodoList
          todos={todos}
          updateTodo={updateTodo}
          removeTodo={removeTodo}
        />
      </div>
    </div>
  );
}

export default TodoPage;
