import io from "socket.io-client";
import React, { useState, useEffect } from "react";

const socket = io("http://localhost:8000/", {
  transports: ["websocket", "xhr-polling"],
});

export default function Main() {
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

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

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
          onChange={handleInputChange}
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
