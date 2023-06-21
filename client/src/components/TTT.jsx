import "./TTT.css";
import { useState, useRef, useEffect } from "react";
import { arrCrawler } from "./tools/utils";

function TTT({ socket }) {
  const [move, setMove] = useState("X");
  const [playerScores, setPlayerScores] = useState({
    playerO: "",
    playerX: "",
  });
  //const [cellSize, setCellSize] = useState(0);
  const [winLineLength, setWinLineLength] = useState(3);
  const [col, setCols] = useState(3);
  const boardRef = useRef(null);
  const colsSelect = useRef([]);
  const playerMoveCount = useRef(0);
  const playerId = useRef("");
  const playground = useRef([]);
  //5px is the grid gap. num of columns -1 = num of gaps
  const cellSize = (boardRef.current?.offsetWidth - 5 * (col - 1)) / col;
  //the component initially loads with css display:"none" so dom elements
  //will have undefined dimentions

  const noDoublePlayRef = useRef(true); //prevent double play by not allowing a player turn to go through before the other player event has arrived and received by the listener.Specially prevents double click on the board when the condition (id coming from server !== id from the current socket playing)

  const boardInit = useRef((col) => {
    //board initialising func
    playerId.current = "";
    setPlayerScores({ playerO: "", playerX: "" });
    playerMoveCount.current = 0;
    playground.current = Array.from({ length: col }, () =>
      Array.from({ length: col }, () => "")
    );
    //playground.current = Array.from({ length: col }, () => Array(col).fill('')); this does not work since it uses the same array in the callback function 'col' number of times
  });

  useEffect(() => {
    //set max board size options dependeing on device
    let arrLength;
    window.innerHeight > window.innerWidth || window.innerHeight < 800
      ? (arrLength = 6)
      : (arrLength = 10);
    colsSelect.current = Array(arrLength)
      .fill("")
      .map((_, ind) => ind + 3);

    boardInit.current(3); //initialise a 3x3 board
  }, []);

  const handleReset = () => {
    //emit col to transmit reset to other player without needing to create a separate reset logic
    socket.emit("colChange", col);
  };

  const handleColsChange = (e) => {
    if (parseInt(e.target.value) < winLineLength) {
      alert("Score Line cant be bigger than Board Size");
      return;
    }
    socket.emit("colChange", e.target.value);
  };
  const handleWinLine = (e) => {
    if (parseInt(e.target.value) > parseInt(col)) {
      alert("Score Line cant be bigger than Board Size");
      setWinLineLength(3);
      return;
    }
    socket.emit("winLineChange", e.target.value);
  };

  useEffect(() => {
    socket.on("playerMove", ({ rowInd, colInd, item, id }) => {
      noDoublePlayRef.current = true;
      playerId.current = id;
      playerMoveCount.current++;
      playground.current[rowInd][colInd] = item;
      if (playerMoveCount.current === col * col) {
        setPlayerScores(
          arrCrawler(parseInt(winLineLength), playground.current)
        );
      }
      setMove(item);
    });

    socket.on("colChange", (col) => {
      setCols(parseInt(col));
      boardInit.current(col);
    });

    socket.on("winLineChange", (winLine) => {
      setWinLineLength(parseInt(winLine));
    });

    return () => {
      socket.off("playerMove");
      socket.off("colChange");
      socket.off("winLineChange");
    };
  }, [socket, col, winLineLength]);

  const handlePlayerMove = (rowInd, colInd) => {
    if (playerId.current !== socket.id && noDoublePlayRef.current) {
      if (move === "O" && playground.current[rowInd][colInd] === "") {
        socket.emit("playerMove", { rowInd, colInd, item: "X", id: socket.id });
        noDoublePlayRef.current = false;
      } else {
        if (playground.current[rowInd][colInd] === "") {
          socket.emit("playerMove", {
            rowInd,
            colInd,
            item: "O",
            id: socket.id,
          });
          noDoublePlayRef.current = false;
        }
      }
    }
  };

  let winColor;

  /////////////////////////////////replay text effect/////////////////////////////////
  const wordRef = useRef(null);

  useEffect(() => {
    const word = wordRef.current;

    const handleMouseMove = (e) => {
      const rect = word.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const dx = mouseX - centerX;
      const dy = mouseY - centerY;
      const tiltX = (dy / centerY) * -10; // Adjust the skew intensity
      const tiltY = (dx / centerX) * 10; // Adjust the skew intensity
      word.style.transform = `skewX(${tiltX}deg) skewY(${tiltY}deg)`;
    };

    const handleMouseLeave = () => {
      word.style.transform = "none";
    };

    word.addEventListener("mousemove", handleMouseMove);
    word.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      word.removeEventListener("mousemove", handleMouseMove);
      word.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);
  ////////////////////////////////////////////////////////////////
  const handleGameOn = () => {
    document.getElementById("ttt").style.display = "none";
    document.getElementById("ttt-game-on").style.visibility = "hidden";
    //below we target the main component
    document.getElementById("cont").style.display = "block";
    document.getElementById("main-game-on").style.visibility = "visible";
  };
  return (
    <div id="ttt">
      <div id="ttt-game-on" onClick={handleGameOn} className="ttt-onHover">
        CHAT
      </div>
      <h1 className="ttt-title">Tic Tac Toe Twist</h1>
      <br />
      <div id="options">
        <span>
          <label htmlFor="size-options">Board Size: </label>
          <select onChange={handleColsChange} value={col} name="size-options">
            {colsSelect.current.map((column) => {
              return (
                <option value={column} key={column}>
                  {column}
                </option>
              );
            })}
          </select>
        </span>
        <span style={{ marginLeft: "1em" }}>
          <label htmlFor="win-line">Score Line: </label>
          <select
            onChange={handleWinLine}
            value={winLineLength}
            name="win-line"
          >
            {colsSelect.current.map((winLine) => {
              return (
                <option value={winLine} key={`${winLine}+'winLine'`}>
                  {winLine}
                </option>
              );
            })}
          </select>
        </span>
      </div>
      <br />
      <div id="board-cont">
        <div
          id="board"
          style={{
            gridTemplateColumns: `repeat(${col}, 1fr)`,
            gridTemplateRows: `repeat(${col}, 1fr)`,
          }}
          ref={boardRef}
        >
          {playground.current.map((row, rowInd) => {
            return row.map((col, colInd) => {
              if (
                playerScores.winArr &&
                playerScores.winArr[rowInd][colInd][1]
              ) {
                winColor = "50%";
              } else {
                winColor = "70%";
              }
              return (
                <div
                  className="board-cell ttt-unselect"
                  key={rowInd + colInd}
                  onClick={() => handlePlayerMove(rowInd, colInd)}
                  style={{
                    color: `${
                      playground.current[rowInd][colInd] === "X"
                        ? `hsl(310, 100%, ${winColor})`
                        : `hsl(199, 100%, ${winColor})`
                    }`,
                    fontSize: `${cellSize - (cellSize < 60 ? 0 : 11)}px`,
                    textShadow:
                      playerScores.winArr && playerScores.winArr.length
                        ? playerScores.winArr[rowInd][colInd][1]
                          ? "#ce2bff 0px 0px 10px"
                          : ""
                        : "",
                  }}
                >
                  {col}
                </div>
              );
            });
          })}
        </div>
      </div>
      <div
        id="footer"
        style={{
          visibility: playerScores.playerO === "" ? "hidden" : "visible",
        }}
      >
        <span>
          {"Player "}
          <span style={{ fontFamily: "ttt-user", fontSize: "1.3em" }}>O: </span>
          {playerScores.playerO}
        </span>
        <span
          ref={wordRef}
          className="skew-effect"
          style={{
            order: colsSelect.current.length === 6 ? "3" : "",
            fontSize: "1.5em",
          }}
          onClick={handleReset}
        >
          REPLAY
        </span>
        <span>
          {"Player "}
          <span style={{ fontFamily: "ttt-user", fontSize: "1.3em" }}>X: </span>
          {playerScores.playerX}
        </span>
      </div>
    </div>
  );
}

export default TTT;
