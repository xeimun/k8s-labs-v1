import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  // 백엔드 API 주소 설정 (환경 변수가 없으면 기본값 사용)
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/todos';

  // 컴포넌트가 처음 렌더링될 때 할 일 목록을 가져옵니다.
  useEffect(() => {
    fetchTodos();
  }, []);

  // 할 일 목록 가져오기
  const fetchTodos = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('서버에서 데이터를 가져오는 데 실패했습니다.');
      }
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // 새로운 할 일 추가
  const addTodo = async () => {
    if (!input.trim()) return;
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: input }),
      });
      if (!response.ok) {
        throw new Error('할 일을 추가하는 데 실패했습니다.');
      }
      const newTodo = await response.json();
      setTodos([...todos, newTodo]);
      setInput('');
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // 할 일 완료/미완료 처리
  const toggleTodo = async (id, description, completed) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description, completed: !completed }),
      });
      if (!response.ok) {
        throw new Error('할 일 상태를 업데이트하는 데 실패했습니다.');
      }
      const updatedTodo = await response.json();
      setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)));
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };


  // 할 일 삭제
  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
       if (!response.ok) {
        throw new Error('할 일을 삭제하는 데 실패했습니다.');
      }
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Todo List</h1>
        <div className="todo-input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            placeholder="새로운 할 일을 입력하세요..."
          />
          <button onClick={addTodo}>추가</button>
        </div>
        <ul className="todo-list">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className={`todo-item ${todo.completed ? 'completed' : ''}`}
            >
              <span onClick={() => toggleTodo(todo.id, todo.description, todo.completed)}>
                {todo.description}
              </span>
              <button className="delete-btn" onClick={() => deleteTodo(todo.id)}>삭제</button>
            </li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;