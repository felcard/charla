import io from "socket.io-client";
import React, { useState, useEffect, useRef } from "react";
import { fonts, color, isRude } from "./tools/fx";
import { bad } from "./tools/rude";
import soundFile from "./ring.mp3";
const audio = new Audio(soundFile);
//socket-fel.koyeb.app/
const socket = io("socket-fel.koyeb.app/", {
  transports: ["websocket", "xhr-polling"],
}); //io() initiates socket connection. But connection is async so to get socket.id needs to be done inside socket.on('connect',()=>console.log(socket.id))

export default function Main() {
  const [roomTitle, setRoomTitle] = useState("CHARLA");
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [inputName, setInputName] = useState("");
  const [inputRoom, setInputRoom] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [roomFormAnimate, setRoomFormAnimate] = useState("room-form-start");
  const [finalSize, setFinalSize] = useState(0);
  const [plugged, setPlugged] = useState(true);

  const [notification, setNotification] = useState(Notification.permission);
  //for calculating the size of the messages area
  const h1Ref = useRef(null);
  const chatRef = useRef(null);
  //focus cursor on chant input box
  const inFocusRef = useRef(null);

  useEffect(() => {
    //request permition if haven't been granted
    //notification once granted by the client's browser it will remain active fo a long period until the user will have to re-grant at some point
    if (Notification.permission !== "granted") {
      Notification.requestPermission().then((permission) => {
        setNotification(permission);
      });
    }
    //create function to avoid repeating code below
    const roomMonitor = (socket) => {
      const sessionRoom = JSON.parse(sessionStorage.getItem("sessionRoom"));
      socket.on("room", (msg) => {
        console.log("Message from server", msg);
        socket.on("joined", (msg) => console.log(msg));
      });
      socket.on("message", (data) => {
        if (
          typeof data?.user !== "undefined" &&
          typeof sessionRoom?.user !== "undefined"
        ) {
          if (notification === "granted" && sessionRoom.user !== data.user) {
            audio.play();
          }
        }

        //if server sends keyword in a message means the user left
        const userGone = data.msg === "k@t@n@";
        setMessages((prevMessages) => {
          const socketMsg = {
            text: userGone ? "🏃💨LEFT THE ROOM🏃💨" : data.msg,
            user: data.user,
            font: userGone ? "Space Mono" : fonts(),
            msgColor: userGone ? "magenta" : color(),
            userColor: userGone ? "magenta" : color(),
          };
          return [socketMsg, ...prevMessages];
        });
      });
    };
    roomMonitor(socket);

    socket.on("connect_error", () => {
      //this listener handls the issue when the internet connection is lost even before the socket can stablishes a connection or other issues so the disconnect event may not trigger
      console.log("CONNECTION ERROR");
      socket.disconnect();
      setPlugged(false);
    });

    socket.on("disconnect", () => {
      console.log("DISCONNECTED");
      socket.disconnect();
      setPlugged(false);
      //NOTE: socket.connected to monitor the state of the socket connection was not reliable since it was giving 'true' when the connection was in fact lost after the browser being minimised for long time or the compurter in sleep mode.
      //this listener handles disconnection from the socket and uses the inital room details which are stored in the sessionStorage to re-establish a connection to the socket. In theory, with this logic the connection will be on until the browser is closed
      //when socket disconnects either due to browser minimasing for long, or computer hybernation etc.
      //the code below executes but when the app gains focus again not sure how the code having executed after disconnection how will the code still be present since when the app gains focus again a new instance of a socket gets created...maybe in buffer/cache?

      //roomMonitor(socket);
    });

    return () => {
      console.log("CLEAN UP FUNCTION");
      //remove the socket listeners that are not needed when the component is unmounted and in this case we dont need the connection since the app only has one component
      socket.off("room");
      socket.off("message");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, [notification]);

  const handleMsgSubmit = (event) => {
    console.log(plugged);
    if (!plugged) {
      socket.connect();
      const sessionRoom = JSON.parse(sessionStorage.getItem("sessionRoom"));
      console.log("RE-CONNECTING ");
      socket.emit("room", {
        //coalescing operator (??) assigns empty string if keys null or undefined.
        user: sessionRoom.user ?? "",
        name: sessionRoom.name ?? "",
        code: sessionRoom.code ?? "",
      });
      setPlugged(true);
    }
    event.preventDefault();
    const trimmed = inputValue.trim();
    if (isRude(bad, trimmed)) {
      alert("Dont use that kind of language please! - No diga grocerias!");
      setInputValue("");
    } else {
      socket.emit("message", trimmed);
      setInputValue("");
    }
  };

  const handleRoomSubmit = (event) => {
    event.preventDefault();
    const totValues = inputName + " " + inputRoom + " " + inputCode;
    if (isRude(bad, totValues)) {
      alert("Dont use that kind of language please! - No diga groserias!");
      setInputRoom("");
      setInputCode("");
      setInputName("");
    } else {
      //we conditionally emit events if the socket is not connected
      //since if it is not connected the events will still be buffered
      //and will add up to the events being emitted in the hanleMsgSubmit function that deals with re-connection after period of inactivity creating two connections and broadcasting double events.
      const roomArr = [inputName.trim(), inputRoom.trim(), inputCode.trim()];
      sessionStorage.setItem(
        "sessionRoom",
        JSON.stringify({
          user: roomArr[0],
          name: roomArr[1],
          code: roomArr[2],
        })
      );
      socket.emit("room", {
        user: roomArr[0],
        name: roomArr[1],
        code: roomArr[2],
      });
      setRoomTitle(inputRoom);
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
      <div id="nav">
        <h1 ref={h1Ref}>{roomTitle}</h1>
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
            <button type="submit">JOIN</button>
            <br />
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
                fontSize: msg.font === "Rancho" ? "2.5em" : "2em",
                textAlign: "left",
                textShadow: `${
                  msg.msgColor === "magenta" ? "0px 0px 10px magenta" : ""
                }`,
              }}
              key={ind}
            >
              <span style={{ color: msg.userColor }}>{msg.user}: </span>
              <br />
              <span style={{ color: msg.msgColor }}>{msg.text}</span>
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
          //we take 2px off the width to account for borders since
          //100vw on its own does not include borders so if we set
          //the width of an element to 100vw and also add borders then the
          //elemnt's width will overflow!!
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
          autoComplete="off"
          onChange={(e) => setInputValue(e.target.value)}
        />
      </form>
    </div>
  );
}
