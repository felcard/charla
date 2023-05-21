import io from "socket.io-client";
import React, { useState, useEffect, useRef } from "react";
import { fonts, color, isRude, abcRandom } from "./tools/fx";
import { bad } from "./tools/rude";
import soundFile from "./ring.mp3";
const audio = new Audio(soundFile);
audio.load(); //for tests not sure if needed
//socket-fel.koyeb.app/
const socket = io("socket-fel.koyeb.app/", {
  transports: ["websocket", "xhr-polling"],
}); //When you create a socket object using the io() constructor, it automatically attempts to establish/initiate a connection to the server using the specified transport options. If the connection is successful, the 'connect' event is emitted, and you can listen for it using the socket.on() method.If the socket object is disconnected from the server, any subsequent calls to socket.emit() will not automatically start a new connection. Instead, the emit() method will try to send the data over the existing disconnected socket, which will result in an error. Socket.io will attempt to periodically re-connect after a disconnection so calling the socket.connect() method simmultaneously will cause conflict.

//When you create a new socket instance using the io() constructor, the instance establishes a connection to the server and is assigned a unique socket ID. If the connection is lost, and you reconnect to the same server using the same socket instance, a new connection with a different socket ID will be established.
//So even though the socket instance remains the same, the underlying connection is a new connection with a new socket ID. Any listeners registered on the socket instance before the disconnection will still be active on the new connection, and any new listeners registered on the socket instance after the reconnection will only be active on the new connection.
//SO ensure listeners are declared only once and removed (socket.off) before declaring them again. Ideally placed in a useEffect that only runs once when the component mounts

function letterForUser() {
  //use closure for the alphabet array and the user names object
  const arr = "abcdefghijklmnopqrstuvwxyz".split("");
  const users = {};
  //return a function that generates a unique letter for each new user
  //when an existent user name is given the same letter is returned
  return function (user) {
    if (users[user]) {
      return users[user].toUpperCase();
    } else {
      const arrEl = arr[Math.floor(Math.random() * arr.length)];
      arr.splice(arr.indexOf(arrEl), 1);
      users[user] = arrEl;
      return users[user].toUpperCase();
    }
  };
}

const makeFace = letterForUser();

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
  const [faceRefLoaded, setFaceRefLoaded] = useState(false);
  //notification permision not needed for just playing sound on user submitting messages
  //const [notification, setNotification] = useState(Notification.permission);
  const h1Ref = useRef(null);
  //for calculating the size of the messages area
  const chatRef = useRef(null);
  //focus cursor on chant input box
  const inFocusRef = useRef(null);

  const faceRef = useRef(null);

  //when the browser is refreshed by the user, the react component is re-mounted but the sessionStorage prev values remain. If we declared a variable inside the useEffect where the messages socket listener is, and stored the value from sessionStorage, the current value of sessionStorage would be stored. When the user enters new room details via the submithandler, and these replaced the current values stored in sessionStorage, the variable would not be updated since the useEffect will not run again. If we declared the variable outside the useEffect to use it inside, then we would need to add it as a dep to the array causing the uesEffect to re-render more then once and re-declaring socket event listeners which is undesireable. The solution is to wrap the variable in a useRef outside the useEffect where it needs to be used without needing to make it a dependency. When the browser is refreshed, the component re-mounted and the component function re-renders the ref variable will be assinged the new value of the room details after user input and the value inside the useEffect will be up to date. And to make this feature more efficient, we place the logic of extracting and parsing the data from the sessionStorahge inside another useEffect so it does not execute with every render unnecesarily, and as a dependency, we use the roomTitle variable which causes a re-render only once after the user submits room details and the title of the app gets epdated.
  //we store the room details in sessionStorage instead of useState to implement a feature where the app will check if there are room setails in session storage and in case of user refreshing the page the chat will remain in view instead of starting all over from landing page

  const localUser = useRef(null);
  useEffect(() => {
    localUser.current = JSON.parse(sessionStorage.getItem("sessionRoom"));
  }, [roomTitle]);

  useEffect(() => {
    //request permition if haven't been granted
    //notification once granted by the client's browser it will remain active fo a long period until the user will have to re-grant at some point
    // if (Notification.permission !== "granted") {
    //   Notification.requestPermission().then((permission) => {
    //     setNotification(permission);
    //   });
    // }
    //socket listeners need to be in a useEffect so they are only declared once, otherwise we get multiple listeners listening for the same event resulting in double actions like rendering messages two times

    socket.on("room", (msg) => {
      console.log("Message from server => ", msg);
      socket.on("joined", (msg) => console.log(`user: ${socket.id} ${msg}`));
    });

    socket.on("message", (data) => {
      //msg sound notification logic
      if (data?.user) {
        if (
          //only in cases where using push notifications not for user interaction real time sound notification
          //notification === "granted" &&
          localUser.current?.user !== data.user
        ) {
          audio.currentTime = 0;
          audio.play();
        }
      }

      //if server sends keyword in a message means the user left
      const userGone = data.msg === "k@t@n@";
      setMessages((prevMessages) => {
        const time = new Date();
        const socketMsg = {
          text: userGone ? "🏃💨LEFT THE ROOM🏃💨" : data.msg,
          user: data.user,
          font: userGone ? "Space Mono" : fonts(),
          msgColor: userGone ? "magenta" : color(),
          userColor: userGone ? "magenta" : color(),
          time: ` ${time.getHours()}:${time
            .getMinutes()
            .toString()
            .padStart(2, "0")}`,
        };
        return [socketMsg, ...prevMessages];
      });
    });
    socket.on("connect_error", () => {
      //this listener triggers when the connection cannot be established
      console.log("CONNECTION ERROR");
      //IF USING socket.removeAllListeners(); it also removes the error listeners so they need to be added again other option is to remove all listeners individually
    });
    socket.on("disconnect", () => {
      console.log("DISCONNECTED");
      setPlugged(false);
      //NOTE: socket.connected to monitor the state of the socket connection was not reliable since it was giving 'true' when the connection was in fact lost after the browser being minimised for long time or the compurter in sleep mode, or for other reasons.. so 'disconnect' + 'connect_error' approach seems to work better
    });
    ////////////////////////NOTE/////////////////
    //When the socket loses connection event listenters don't get removed by default.
    //If you want to remove all event listeners when the socket disconnects, including the "disconnect" event listener itself, you can use socket.removeAllListeners() within the "disconnect" event handler
    ///////////////////////

    return () => {
      console.log("CLEAN UP FUNCTION");
      //remove the socket listeners that are not needed when the component is unmounted and in this case we dont need the connection since the app only has one component so we can do socket.disconnect()
      //we use socket.offAny() to remove all listeners and this method work when listeners are anonymous functions but if we wanted to individually remove listeners we would need to use NAMED functions
      socket.removeAllListeners();
      socket.disconnect();
    }; //when using push notifications 'notification' variable needs to go in the dep array
  }, []);

  const handleMsgSubmit = (event) => {
    event.preventDefault();
    //if socket disconnects plugged turns 'false' room details stored in session storage are sent to the server to re-join the room
    //also use the value of finalSize for cases where state resets but the component does not re-render; thogh not sure if this error can ever occur???
    if (!plugged || finalSize === 0) {
      //socket.connect();//this is not needed since socket.io will periodically attempt to re-connect. Room re-joining does not happen automatically socket.connect() needs to be used when the socket is manually disconnected using socket.disconnect() since in this case socket.io won't attempt to re-connect after
      console.log("RE-CONNECTING ");
      //re-joining the room logic will stay on the buffer untill connection is re-established since when the socket disconnected, it was removed from any room it belonged to.
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
      //we conditionally emit room details if the socket is not disconnected
      //since if it is disconnected the this logic will still be buffered
      //and wneh the socket re-gains connection this event will be in the queue and the user will be emiting room details twice: initially when room is first created, and secondly via the handleMsgSubmit since 'plugged' state will be false and room details will be emitted this time joining the room; resulting in the user having joined the room twice in the server getting the messages back two times!
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
          window.visualViewport.height * 0.1
      );
    };
    window.addEventListener("resize", screenResizer);

    return () => window.removeEventListener("resize", screenResizer);
  }, []);
  //onExpandAnimationEnd listens for the end of the final animation so the elements ar
  //all in place and we can calculate their sizes correctly

  useEffect(() => {
    if (faceRefLoaded) {
      ////////////////////face animation logic///////////
      let animationActive = false;
      const fontLoaded = window
        .getComputedStyle(faceRef.current)
        .getPropertyValue("font-family"); //check if font style has loaded
      const intervalId = setInterval(() => {
        animationActive
          ? (faceRef.current.style.animationPlayState = "running")
          : (faceRef.current.style.animationPlayState = "paused");
        animationActive = !animationActive;
        if (fontLoaded.includes("cara")) {
          //if font is loaded then execute the code
          faceRef.current.textContent = abcRandom();
        }
      }, 400);
      /////////////////////////////////////////////////////
      return () => clearInterval(intervalId); //clear interval for face animation
    }
  }, [faceRefLoaded]);

  const onExpandAnimationEnd = () => {
    //add a bit of difference to allow separation from the
    //messages area and the input chat box with 0.02 of screen height
    setFinalSize(
      window.visualViewport.height -
        h1Ref.current?.clientHeight -
        chatRef.current?.clientHeight -
        window.visualViewport.height * 0.1
    );
    inFocusRef.current.focus();
  };
  useEffect(() => {
    setFaceRefLoaded(true);
    //when the javascript (including useEffect blocks) are first loaded all the useRef's .current will be undefined since the comnponent hasn't rendered any html yet so this useEffect is a flag that will turn true after the javascript have loaded and the component rendered for the first time allowing useRef variables to get a current value and avoid undefined errors especially in cases where the .? operator cant be used since although avoids throwing an error it returns undefined which in somecases casues error anyway. So in the useEffect blocks where useRef elements are used we add as dependency the flag so there is a second rendered where useRef elements would be usable/defined. NOT SURE Whether this approach is the best?????
  }, []);
  return (
    <div id="cont">
      <div id="mask">
        <span
          id="face"
          ref={faceRef}
          style={{
            display:
              roomFormAnimate !== "room-form-disappear" ? "block" : "none",
          }}
        ></span>
      </div>
      <h1 className="unselect" ref={h1Ref}>
        {roomTitle}
      </h1>
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
            ? h1Ref.current.clientHeight + window.visualViewport.height * 0.08
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
              <span className="user-face">{makeFace(msg.user)}</span>
              <span style={{ color: msg.userColor }}>{msg.user}: </span>
              <br />
              <span style={{ color: msg.msgColor }}>{msg.text}</span>
              <span
                style={{
                  fontFamily: "space mono",
                  fontSize: "0.7rem",
                  color: "silver",
                }}
              >
                {msg.time}
              </span>
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
                window.visualViewport.height * 0.09
              : window.visualViewport.height - 40,
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
      <section
        id="author"
        style={{
          display: roomFormAnimate !== "room-form-disappear" ? "block" : "none",
        }}
      >
        by fel NC
      </section>
    </div>
  );
}
