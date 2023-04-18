import './App.css';

import React, { useState } from "react";

function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");


  const handleSubmit = (event) => {
    event.preventDefault();
    setMessages([...messages, inputValue]);
    setInputValue("");
  };


  return (
    <div id="main-chat">
      <h1>MAIN ROOM</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type your message here"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;

