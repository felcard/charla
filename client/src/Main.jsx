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
  console.log(socket.id);
  const [roomTitle, setRoomTitle] = useState("MAIN ROOM");
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [inputName, setInputName] = useState("");
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
        // console.log(data);
        // console.log(prevMessages);
        const cloudEl = {
          text: data,
          count: 5,
          font: fonts(),
          color: `hsl(${Math.floor(Math.random() * 359)}, 100%, 60%)`,
        };
        return [cloudEl, ...prevMessages];
      });
    });

    return () => {
      socket.off("message");
    };
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (filter.clean(inputValue + inputName).includes("*")) {
      alert("Dont use that kind of language please!");
      setInputValue("");
      setInputName("");
    } else {
      socket.emit("message", `${inputName}: ${inputValue}`);
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
      setInputName("");
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
      <div id="nav">
        <h1 style={{ fontFamily: "nabla", fontSize: "3em" }}>{roomTitle}</h1>
        <div id="main-forms">
          <br />
          <form className={animate ? "main-room" : ""} onSubmit={handleRoom}>
            <input
              type="text"
              placeholder="enter your name"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
            />
            <br />
            <input
              type="text"
              placeholder="enter a room name"
              value={inputRoom}
              onChange={(e) => setInputRoom(e.target.value)}
            />
            <br />
            <input
              type="text"
              placeholder="and a room code"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
            />
            <br />
            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
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
      <div
        style={{
          overflowY: "auto",
          scrollBehavior: "smooth",
          display: "flex",
          flexDirection: "column-reverse",
          alignItems: "flex-start",
          height: "90vh",
          paddingLeft: "3vw",
        }}
      >
        {messages.map((msg, ind) => {
          return (
            <div
              style={{
                fontFamily: msg.font,
                lineHeight: "1em",
                fontSize: "2em",
                color: msg.color,
              }}
              key={ind}
            >
              {msg.text}
            </div>
          );
        })}
      </div>

      {/* <Cloud words={messages} /> */}
    </div>
  );
}
