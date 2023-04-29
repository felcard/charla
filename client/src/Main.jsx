import io from "socket.io-client";
import React, { useState, useEffect } from "react";
//import Cloud from "./Cloud";
import Filter from "bad-words";

const filter = new Filter();

const socket = io("socket-fel.koyeb.app/", {
  transports: ["websocket", "xhr-polling"],
});

const fonts = () => {
  const fontArr = [
    "Rancho",
    "Lakki Reddy",
    "Righteous",
    "Space Mono",
    "Rancho",
    "Lakki Reddy",
    "Righteous",
    "Space Mono",
  ];
  const fontInd = Math.floor(Math.random() * 7);
  return fontArr[fontInd];
};

export default function Main() {
  const [roomTitle, setRoomTitle] = useState("MAIN ROOM");
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [inputRoom, setInputRoom] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    socket.on("room", (msg) => {
      console.log(msg);
      socket.on("joined", (msg) => console.log(msg));
    });

    socket.on("message", (data) => {
      setMessages((prevMessages) => {
        console.log(data);
        console.log(prevMessages);
        const cloudEl = {
          text: data,
          count: 5,
          font: fonts(),
          color: `hsl(${Math.floor(Math.random() * 359)}, 100%, 60%)`,
        };
        return [...prevMessages, cloudEl];
      });
    });

    return () => {
      socket.off("message");
    };
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (filter.clean(inputValue).includes("*")) {
      alert("Dont use that kind of language please!");
      setInputValue("");
    } else {
      socket.emit("message", inputValue);
      setInputValue("");
    }
  };

  const handleRoom = (event) => {
    event.preventDefault();
    const cleanRoom = filter.clean(inputRoom);
    const cleanCode = filter.clean(inputCode);
    if ((cleanRoom + cleanCode).includes("*")) {
      alert("Dont use that kind of language please!");
      setInputRoom("");
      setInputCode("");
    } else {
      socket.emit("room", { name: inputRoom, code: inputCode });
      setRoomTitle(inputRoom);
      setInputRoom("");
      setInputCode("");
      setAnimate(true);
    }
  };

  return (
    <div id="main-chat">
      <h1 style={{ fontFamily: "nabla", fontSize: "3em" }}>{roomTitle}</h1>
      <div id="main-forms">
        <form style={{ marginRight: "1em" }} onSubmit={handleSubmit}>
          <input
            style={{ width: "0px", border: "none" }}
            className={animate ? "expand" : ""}
            type="text"
            placeholder="Type your message here"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <br />
        </form>
        <br />
        <form className={animate ? "main-room" : ""} onSubmit={handleRoom}>
          <input
            type="text"
            placeholder="Enter room name"
            value={inputRoom}
            onChange={(e) => setInputRoom(e.target.value)}
          />
          <br />
          <input
            style={{ marginTop: "0.5em" }}
            type="text"
            placeholder="room code"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
          />
          <br />
          <button type="submit">Submit</button>
        </form>
      </div>
      <ul>
        {messages.map((msg, ind) => {
          return (
            <li
              style={{
                fontFamily: msg.font,
                fontSize: "2em",
                color: msg.color,
              }}
              key={ind}
            >
              {msg.text}
            </li>
          );
        })}
      </ul>
      {/* <Cloud words={messages} /> */}
    </div>
  );
}
