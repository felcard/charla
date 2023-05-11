import io from "socket.io-client";
import React, { useState, useEffect, useRef } from "react";
import { fonts, color, isRude } from "./tools/fx";
import { bad } from "./tools/rude";
import soundFile from "./ring.mp3";
const audio = new Audio(soundFile);
audio.load(); //for tests not sure if needed
//socket-fel.koyeb.app/
const socket = io("socket-fel.koyeb.app/", {
  transports: ["websocket", "xhr-polling"],
}); //When you create a socket object using the io() constructor, it automatically attempts to establish a connection to the server using the specified transport options. If the connection is successful, the 'connect' event is emitted, and you can listen for it using the socket.on() method.If the socket object is disconnected from the server, any subsequent calls to socket.emit() will not automatically start a new connection. Instead, the emit() method will try to send the data over the existing disconnected socket, which will result in an error. To establish a new connection, you'll need to call the connect() method on the socket object.

//When you create a new socket instance using the io() constructor, the instance establishes a connection to the server and is assigned a unique socket ID. If the connection is lost, and you reconnect to the same server using the same socket instance, a new connection with a different socket ID will be established.
//So even though the socket instance remains the same, the underlying connection is a new connection with a new socket ID. Any listeners registered on the socket instance before the disconnection will still be active on the new connection, and any new listeners registered on the socket instance after the reconnection will only be active on the new connection.
//SO ensure listeners are declared only once and removed (socket.off) before declaring them again. Ideally placed in a useEffect that only runs once when the component mounts

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

  //when the browser is refreshed by the user, the react component is re-mounted but the sessionStorage prev values remain. If we declared a variable inside the useEffect where the messages socket listener is, to obtain the value from sessionStorage, the current value of sessionStorage will be stored. When the user enter the new room details via the submithandler, and thsese replaced the current values stored in sessionStorage, the variable would not be updated since the useEffect will not run again. If we declared the variable outside the useEffect, then we would need to add it as a dep to the array causing the uesEffect to re-render more then once and re-declaring socket event listener which is undesireable. The solution is to wrap the variable in a useRef to be able to use the variable inside the useEffect without needing to make it a dependency. When the browser is refreshed the component re-mounted and the component function re-render the ref variable will be assinged the new value of the room details after user input and the value inside the useEffect will be up to date. And to make this feature more efficient, we place the logic of extracting and parsing the data from the sessionStorahge inside another useEffect so it does not execute with every render unnecesarily, and as a dependency, we use the roomTitle variable which causes a re-render only once after the user submits room details and the title of the app gets epdated.

  const localUser = useRef(null);
  useEffect(() => {
    localUser.current = JSON.parse(sessionStorage.getItem("sessionRoom"));
  }, [roomTitle]);

  //wrap function in userRef so can be included in useEffect without making it a dependency and also function can be used outside useEffect
  const socketListeners = useRef((socket, chatMsg, room, joined) => {
    socket.on(room, (msg) => {
      console.log("Message from server => ", msg);
      socket.on(joined, (msg) => console.log(`user: ${socket.id} ${msg}`));
    });

    socket.on(chatMsg, (data) => {
      //msg sound notification logic
      if (data?.user) {
        if (
          notification === "granted" &&
          localUser.current?.user !== data.user
        ) {
          audio.currentTime = 0;
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
    socket.on("connect_error", () => {
      //this listener handls the issue when the internet connection is lost even before the socket can stablishes a connection or other issues so the disconnect event may not trigger
      console.log("CONNECTION ERROR");
      //IF USING socket.removeAllListeners(); it also removes the error listeners so they need to be added again other option is to remove all listeners individually
      socket.removeAllListeners();
      socket.disconnect(); //there could be times where for a glitch the server can emit a 'connect_error' event and the socket could still be connected, if we did not have the socket.disconnect then the msgSubmit handler will be creating a new connection since 'plugged' state will be 'false'
      setPlugged(false);
    });
    socket.on("disconnect", () => {
      console.log("DISCONNECTED");
      socket.removeAllListeners();
      socket.disconnect(); //same as above disconnect events can be triggered even when socket is still on
      setPlugged(false);
      //NOTE: socket.connected to monitor the state of the socket connection was not reliable since it was giving 'true' when the connection was in fact lost after the browser being minimised for long time or the compurter in sleep mode, or for other reasons.. so 'disconnect' + 'connect_error' approach seems to work better
    });
  });

  useEffect(() => {
    //request permition if haven't been granted
    //notification once granted by the client's browser it will remain active fo a long period until the user will have to re-grant at some point
    if (Notification.permission !== "granted") {
      Notification.requestPermission().then((permission) => {
        setNotification(permission);
      });
    }
    //socket listeners need to be in a useEffect so they are only declared once, otherwise we get multiple listeners listening for the same event resulting in double actions like rendering messages two times

    socketListeners.current(socket, "message", "room", "joined");

    return () => {
      console.log("CLEAN UP FUNCTION");
      //remove the socket listeners that are not needed when the component is unmounted and in this case we dont need the connection since the app only has one component so we can do socket.disconnect()
      //we use socket.offAny() to remove all listeners and this method work when listeners are anonymous functions but if we wanted to individually remove listeners we would need to use NAMED functions
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [notification]);

  const handleMsgSubmit = (event) => {
    event.preventDefault();
    //if cocket disconnects plugged turns 'false' and room details stored in session storage are sent to the server to re-join the room
    if (!plugged) {
      socket.connect();
      //on disconnection the socket listeners need to be removed to avoid re-connecting and having the listener listen to two connections. So if the listeners are removed thery need to be re-declared on re-connection so the new connection have listeners and hence the socketListeners function re attaches listener to the new connection
      socketListeners.current(socket, "message", "room", "joined");
      console.log("RE-CONNECTING ");
      socket.emit("room", {
        //coalescing operator (??) assigns empty string if keys null or undefined.
        user: localUser.current.user ?? "",
        name: localUser.current.name.toLowerCase() ?? "",
        code: localUser.current.code ?? "",
      });
      setPlugged(true);
    }
    const trimmed = inputValue.trim();
    if (isRude(bad, trimmed)) {
      alert("Unaccepted word found! - Contiene palabra invalida!");
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
      alert("Unaccepted word found! - Contiene palabra invalida!");
      setInputRoom("");
      setInputCode("");
      setInputName("");
    } else {
      const roomArr = [inputName.trim(), inputRoom.trim(), inputCode.trim()];
      sessionStorage.setItem(
        "sessionRoom",
        JSON.stringify({
          user: roomArr[0],
          name: roomArr[1].toLocaleLowerCase(),
          code: roomArr[2],
        })
      );
      //we conditionally emit events if the socket is not disconnected
      //since if it is disconnected the events will still be buffered
      //and wneh the socket re-gains connection this event will be in the queue and the user will be emiting room details twice: initially creating the room as per the server logic, and secondly via the handleMsgSubmit since 'plugged' state will be false and room details will be emitted this time joining the room; resulting in the user having joined the room twice in the server getting the messages back two times!
      if (!socket.disconnected) {
        socket.emit("room", {
          user: roomArr[0],
          name: roomArr[1].toLowerCase(),
          code: roomArr[2],
        });
      }
      setRoomTitle(inputRoom.toLowerCase());
      setRoomFormAnimate("main-room");
    }
  };
  useEffect(() => {
    const screenResizer = () => {
      setFinalSize(
        window.visualViewport.height -
          h1Ref.current?.clientHeight -
          chatRef.current?.clientHeight -
          window.visualViewport.height * 0.03
      );
    };
    window.addEventListener("resize", screenResizer);

    return () => window.removeEventListener("resize", screenResizer);
  }, []);
  //onExpandAnimationEnd listens for the end of the final animation so the elements ar
  //all in place and we can calculate their sizes correctly
  const onExpandAnimationEnd = () => {
    //add a bit of difference to allow separation from the
    //messages area and the input chat box with 0.02 of screen height
    setFinalSize(
      window.visualViewport.height -
        h1Ref.current?.clientHeight -
        chatRef.current?.clientHeight -
        window.visualViewport.height * 0.03
    );
    inFocusRef.current.focus();
  };
  return (
    <div id="cont">
      <h1 ref={h1Ref}>{roomTitle}</h1>
      <div id="nav">
        <div
          id="room-form-cont"
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
          //marginTop equals the height of the title plus 1vh (window.innerHeight * 0.01) which is the title's top margin
          marginTop: h1Ref.current
            ? h1Ref.current.clientHeight + window.innerHeight * 0.01
            : 0,
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
          position: "fixed",
          top:
            finalSize !== 0
              ? h1Ref.current.clientHeight +
                finalSize +
                window.visualViewport.height * 0.02
              : window.visualViewport.height - 30,
          visibility: "hidden",
          //we take 2px off the width to account for borders since
          //100vw on its own does not include borders so if we set
          //the width of an element to 100vw and also add borders then the
          //elemnt's width will overflow although initially hidden can cause horizontal scroll bar to appear!!
          width: "calc(100vw - 2px)",
        }}
        className={roomFormAnimate === "room-form-start" ? "" : "expand"}
        onAnimationEnd={onExpandAnimationEnd}
        onSubmit={handleMsgSubmit}
      >
        <input
          ref={inFocusRef}
          style={
            {
              // width: "0px",
              // border: "solid 1px transparent",
              // fontSize: "1.3em",
            }
          }
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
