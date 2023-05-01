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
  const [roomTitle, setRoomTitle] = useState("CLEAN CHAT");
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [inputName, setInputName] = useState("");
  const [inputRoom, setInputRoom] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [roomFormAnimate, setRoomFormAnimate] = useState("room-form-start");
  const [finalSize, setFinalSize] = useState(0);
  //for calculating the size of the messages area
  const h1Ref = useRef(null);
  const chatRef = useRef(null);
  //focus cursor on chant input box
  const inFocusRef = useRef(null);

  useEffect(() => {
    socket.on("room", (msg) => {
      console.log(msg);
      socket.on("joined", (msg) => console.log(msg));
    });

    socket.on("message", (data) => {
      setMessages((prevMessages) => {
        const socketMsg = {
          text: data.msg,
          user: data.user,
          font: fonts(),
          msgColor: color(),
          userColor: color(),
        };
        return [socketMsg, ...prevMessages];
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
      socket.emit("message", inputValue.trim());
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
        user: inputName.trim(),
        name: inputRoom.trim(),
        code: inputCode.trim(),
      });
      setRoomTitle(inputRoom);
      setInputRoom("");
      setInputCode("");
      setRoomFormAnimate("main-room");
    }
  };

  //expandEnd listens for the end of the final animation so the elements ar
  //all in place and we can calculate their sizes correctly
  const expandEnd = () => {
    //add a bit of difference to allow separation from the
    //messages area and the input chat box with 0.02 of screen height
    setFinalSize(
      window.innerHeight -
        h1Ref.current?.clientHeight -
        chatRef.current?.clientHeight -
        window.innerHeight * 0.02
    );
    inFocusRef.current.focus();
  };
  return (
    <div id="cont">
      <div ref={h1Ref} id="nav">
        <h1>{roomTitle}</h1>
        <div
          id="room-form"
          className={roomFormAnimate}
          onAnimationEnd={() => setRoomFormAnimate("room-form-disappear")}
          onSubmit={handleRoomSubmit}
        >
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
            <button type="submit">CREATE</button>
          </form>
        </div>
      </div>

      <div
        id="chat-messages"
        style={{
          //marginTop of the size og title element
          marginTop: h1Ref.current?.clientHeight,
          overflowY: "auto",
          scrollBehavior: "smooth",
          display: "flex",
          flexDirection: "column-reverse",
          alignItems: "flex-start",
          //and the height calculated at the end of aminmations
          height: finalSize,
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
                textAlign: "left",
              }}
              key={ind}
            >
              <span style={{ color: msg.userColor }}>{msg.user}: </span>
              <br />
              <span style={{ color: "green" }}>{msg.text}</span>
            </div>
          );
        })}
      </div>
      <form
        id="chat-input-form"
        ref={chatRef}
        style={{
          visibility: "hidden",
          border: "solid 1px transparent",
          width: "calc(100vw-2px)",
          fontSize: "1.3em",
        }}
        className={roomFormAnimate === "room-form-start" ? "" : "expand"}
        onAnimationEnd={expandEnd}
        onSubmit={handleMsgSubmit}
      >
        <input
          ref={inFocusRef}
          // style={{
          //   width: "0px",
          //   border: "solid 1px transparent",
          //   fontSize: "1.3em",
          // }}
          //className={roomFormAnimate === "room-form-start" ? "" : "expand"}
          type="text"
          placeholder="Type your message here"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </form>
    </div>
  );
}
