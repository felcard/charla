import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('https://socket-fel.koyeb.app', { transports: ['websocket', 'xhr-polling'] }); // connect to the "chat" namespace

function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    // Listen for incoming messages
    socket.on('message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    // Clean up event listeners when component unmounts
    return () => {
      socket.off('message');
    };
  }, []);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const newMessage = { text: inputValue };
    socket.emit('message', newMessage); // send the message to the server
    setInputValue('');
  };

  return (
    <div>
      <h1>Chat App</h1>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message.text}</li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type your message here"
          value={inputValue}
          onChange={handleInputChange}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default App;

