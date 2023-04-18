import io from "socket.io-client";
import React, { useState, useEffect } from "react";

const socket = io("socket-fel.koyeb.app/login", {
  transports: ["websocket", "xhr-polling"],
  auth: { token: "codigo" },
});

export default function Dos() {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    socket.on("code", (data) => {
      setMsg(data);
    });
    return () => {
      socket.off("code");
    };
  }, []);

  return (
    <div id="dos-chat">
      <h1>ROOM DOS</h1>
      <p style={{ fontSize: "4em", color: "brown" }}>{msg || "UNAUTHORISED"}</p>
    </div>
  );
}
