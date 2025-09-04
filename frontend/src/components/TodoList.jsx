import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTodoStore } from "../store/useTodoStore";

const TodoList = () => {
  const {
    todos,
    getTodos,
    addTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    isLoading,
  } = useTodoStore();

  const [text, setText] = useState("");
  const [completeBy, setCompleteBy] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [editingCompleteBy, setEditingCompleteBy] = useState("");

  useEffect(() => {
    getTodos();
  }, [getTodos]);

  const submitAdd = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await addTodo(text.trim(), completeBy || null);
    setText("");
    setCompleteBy("");
  };

  const startEdit = (todo) => {
    setEditingId(todo._id);
    setEditingText(todo.text);
    setEditingCompleteBy(
      todo.completeBy ? new Date(todo.completeBy).toISOString().slice(0, 16) : ""
    );
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
    setEditingCompleteBy("");
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editingText.trim()) return;

    const updateData = { text: editingText.trim() };
    updateData.completeBy = editingCompleteBy || null;

    await updateTodo(editingId, updateData);
    cancelEdit();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "No deadline";
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOverdue = (todo) => {
    if (todo.completed || !todo.completeBy) return false;
    return new Date(todo.completeBy) < new Date();
  };

  const getTimeStatus = (todo) => {
    if (todo.completed) return "completed";
    if (isOverdue(todo)) return "overdue";
    if (todo.completeBy) return "scheduled";
    return "pending";
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">Task Chat</h1>
              <p className="text-blue-100 text-sm">
                {todos.length} {todos.length === 1 ? "task" : "tasks"}
                {todos.filter((t) => !t.completed).length > 0 &&
                  ` • ${todos.filter((t) => !t.completed).length} pending`}
              </p>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-2 self-end sm:self-auto">
            <Link
              to="/"
              className="px-3 py-1 bg-white text-blue-600 rounded-md hover:bg-gray-100 transition text-sm sm:text-base"
            >
              ← Back to Chat
            </Link>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : todos.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm max-w-md mx-auto">
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No tasks yet
              </h3>
              <p className="text-gray-500">
                Start by adding your first task below 👇
              </p>
            </div>
          </div>
        ) : (
          todos.map((t) => (
            <div key={t._id} className="flex items-start gap-3">
              {/* Checkbox */}
              <div className="flex-shrink-0 mt-1">
                {editingId === t._id ? (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    ✏️
                  </div>
                ) : (
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => toggleTodo(t._id)}
                    className="h-5 w-5 text-blue-600 rounded cursor-pointer mt-1"
                  />
                )}
              </div>

              {/* Task Bubble */}
              <div className="flex-1 min-w-0">
                {editingId === t._id ? (
                  <form
                    onSubmit={submitEdit}
                    className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200"
                  >
                    <input
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 text-sm sm:text-base"
                      autoFocus
                      placeholder="Edit task..."
                    />
                    <input
                      type="datetime-local"
                      value={editingCompleteBy}
                      onChange={(e) => setEditingCompleteBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 text-sm sm:text-base"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm sm:text-base"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm sm:text-base"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div
                    className={`rounded-lg p-3 ${
                      t.completed ? "bg-gray-100" : "bg-white"
                    } shadow-sm border border-gray-200`}
                  >
                    <div className="flex justify-between items-start">
                      <p
                        className={`text-sm sm:text-base ${
                          t.completed
                            ? "line-through text-gray-500"
                            : "text-gray-800"
                        }`}
                      >
                        {t.text}
                      </p>
                      <div className="flex gap-2 ml-2">
                        {!t.completed && (
                          <button
                            onClick={() => startEdit(t)}
                            className="text-blue-500 text-xs sm:text-sm"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => deleteTodo(t._id)}
                          className="text-red-500 text-xs sm:text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {t.completeBy && (
                      <div
                        className={`mt-2 text-xs ${
                          getTimeStatus(t) === "overdue"
                            ? "text-red-500"
                            : getTimeStatus(t) === "completed"
                            ? "text-green-500"
                            : "text-gray-500"
                        }`}
                      >
                        Due: {formatDateTime(t.completeBy)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-3 sm:p-4">
        <form onSubmit={submitAdd} className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 flex flex-col sm:flex-row gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a new task..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm sm:text-base"
            />
            <input
              type="datetime-local"
              value={completeBy}
              onChange={(e) => setCompleteBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-full px-4 py-2 text-sm sm:text-base mt-2 sm:mt-0"
            disabled={!text.trim()}
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
};

export default TodoList;