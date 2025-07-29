import { useState, useEffect, useRef } from 'react';
import { FiEdit2, FiTrash2, FiCheck } from 'react-icons/fi';

function TodoItem({ _id: id, title, completed, updateTodo, removeTodo }) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputTitle, setInputTitle] = useState(title);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(0, 0); // Set cursor to the beginning
    }
  }, [isEditing]);

  function handleCompleted(e) {
    if (e.target.tagName === 'LI' || e.target.tagName === 'SPAN') {
      updateTodo({ id, title, completed: !completed });
    }
  }

  function handleRemove() {
    removeTodo(id);
  }

  function handleTitleChange(e) {
    setInputTitle(e.target.value);
  }

  function handleSave() {
    updateTodo({ id, title: inputTitle, completed });
    setIsEditing(false);
  }

  return (
    <li
      onClick={handleCompleted}
      className="flex justify-between items-center bg-gray-100 p-4 my-2 rounded-lg shadow-md"
    >
      {!isEditing ? (
        <span
          className={`hover:cursor-default flex-grow text-lg ${
            completed ? 'line-through' : ''
          }`}
        >
          {title}
        </span>
      ) : (
        <input
          ref={inputRef}
          value={inputTitle}
          onChange={handleTitleChange}
          onBlur={handleSave}
          type="text"
          className="focus:ring-0 border-none outline-none flex-grow p-0 bg-gray-100 text-lg"
        />
      )}
      <div className="flex space-x-2">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`p-2 rounded-full shadow-md transition duration-300 text-white ${
            isEditing ? 'bg-yellow-500' : 'bg-orange-500 hover:bg-orange-600'
          }`}
        >
          {isEditing ? <FiCheck /> : <FiEdit2 />}
        </button>
        <button
          onClick={handleRemove}
          className="p-2 rounded-full shadow-md transition duration-300 bg-red-500 hover:bg-red-600 text-white"
        >
          <FiTrash2 />
        </button>
      </div>
    </li>
  );
}

export default TodoItem;
