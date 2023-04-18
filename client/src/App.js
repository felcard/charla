import './App.css';
import io from "socket.io-client";
import React, { useState, useEffect } from "react";

const socket = io("socket-fel.koyeb.app/", {
  transports: ["websocket", "xhr-polling"],
});

function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");



  useEffect(() => {
    // Listen for incoming messages
    socket.on("message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    // Clean up event listener when component unmounts
    return () => {
      socket.off("message");
    };
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const newMessage = { text: inputValue };
    socket.emit("message", newMessage); // send the message to the server
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
          <li key={index}>{message.text}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;

