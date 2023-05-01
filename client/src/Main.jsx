import io from "socket.io-client";
import React, { useState, useEffect, useRef } from "react";
import { bad } from "./rude";

//socket-fel.koyeb.app/
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

const color = () => {
  return `hsl(${Math.floor(Math.random() * 359)}, 100%, 60%)`;
};

export default function Main() {
  const [roomTitle, setRoomTitle] = useState("MAIN ROOM");
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [inputName, setInputName] = useState("");
  const [inputRoom, setInputRoom] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [animate, setAnimate] = useState("main-forms");

  const h1Ref = useRef(null);
  const chatRef = useRef(null);
  const inputFocus = useRef(null);

  useEffect(() => {
    socket.on("room", (msg) => {
      console.log(msg);
      socket.on("joined", (msg) => console.log(msg));
    });

    socket.on("message", (data) => {
      setMessages((prevMessages) => {
        const cloudEl = {
          text: data.msg,
          user: data.user,
          count: 5,
          font: fonts(),
          msgColor: color(),
          userColor: color(),
        };
        return [cloudEl, ...prevMessages];
      });
    });

    return () => {
      socket.off("message");
    };
  }, []);

  const handleMsgSubmit = (event) => {
    event.preventDefault();
    const profane = bad.filter((word) => inputValue.includes(word));
    if (profane.length) {
      alert("Dont use that kind of language please! - No diga grocerias!");
      setInputValue("");
    } else {
      socket.emit("message", inputValue);
      setInputValue("");
    }
  };

  const handleRoomSubmit = (event) => {
    event.preventDefault();
    const profane = bad.filter((word) =>
      [inputRoom, inputCode, inputName].includes(word)
    );
    if (profane.length) {
      alert("Dont use that kind of language please! - No diga grocerias!");
      setInputRoom("");
      setInputCode("");
      setInputName("");
    } else {
      socket.emit("room", {
        user: inputName,
        name: inputRoom,
        code: inputCode,
      });
      setRoomTitle(inputRoom);
      setInputRoom("");
      setInputCode("");
      setAnimate("main-room");
    }
  };
  let size;
  if (animate === "disappear") {
    size =
      window.innerHeight -
      h1Ref.current?.clientHeight -
      chatRef.current?.clientHeight -
      5;
  }

  return (
    <div id="cont">
      <div id="nav">
        <h1 ref={h1Ref} style={{ fontFamily: "nabla", fontSize: "3em" }}>
          {roomTitle}
        </h1>
        <div
          className={animate}
          onAnimationEnd={() => setAnimate("disappear")}
          onSubmit={handleRoomSubmit}
        >
          <br />
          <form>
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

      <div
        id="chat"
        style={{
          overflowY: "auto",
          scrollBehavior: "smooth",
          display: "flex",
          flexDirection: "column-reverse",
          alignItems: "flex-start",
          height: size ? size : "0",
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
              }}
              key={ind}
            >
              <span style={{ color: msg.userColor }}>{msg.user}: </span>
              <span style={{ color: msg.msgColor }}>{msg.text}</span>
            </div>
          );
        })}
      </div>
      <form ref={chatRef} style={{ width: "100vw" }} onSubmit={handleMsgSubmit}>
        <input
          ref={inputFocus}
          style={{
            width: "0px",
            border: "solid 1px transparent",
            fontSize: "1.3em",
          }}
          className={animate === "main-forms" ? "" : "expand"}
          onAnimationEnd={() => inputFocus.current.focus()}
          type="text"
          placeholder="Type your message here"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <br />
      </form>
    </div>
  );
}
