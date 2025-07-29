import { FiPlus } from 'react-icons/fi';
import { useRef } from 'react';

function TodoInput({ addTodo }) {
  let inputRef = useRef('');

  function handleSubmit(e) {
    e.preventDefault();
    addTodo(inputRef.current.value);
    inputRef.current.value = '';
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center mt-4 bg-green-100 p-2 rounded-lg shadow-md mb-6"
    >
      <input
        ref={inputRef}
        type="text"
        placeholder="Add your items"
        className="focus:ring-0 border-none outline-none p-2 flex-grow bg-green-100"
      ></input>
      <button
        type="submit"
        className="bg-green-500 rounded-full text-white p-2 shadow-md hover:bg-green-600 transition duration-300 mr-2"
      >
        <FiPlus size={20} />
      </button>
    </form>
  );
}

export default TodoInput;
