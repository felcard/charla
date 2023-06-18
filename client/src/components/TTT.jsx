import "./TTT.css";
import { useState, useRef, useEffect } from "react";
import { arrCrawler } from "./tools/utils";
const playground = [];
let playerMoveCount = 0;
let playerId;

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
  const cols = useRef([]);

  const cellSize = (boardRef.current?.offsetWidth - 5 * (col - 1)) / col;

  useEffect(() => {
    //set max board size options dependeing on device
    let arrLength;
    window.innerHeight > window.innerWidth || window.innerHeight < 800
      ? (arrLength = 6)
      : (arrLength = 10);
    cols.current = Array(arrLength)
      .fill("")
      .map((_, ind) => ind + 3);
  }, []);

  const handleReset = () => {
    socket.emit("colChange", col);
    // playerMoveCount = 0;
    // setPlayerScores({ playerO: "", playerX: "" });
    // for (let i = 0; i < col; i++) {
    //   playground[i] = [];
    //   for (let j = 0; j < col; j++) {
    //     playground[i][j] = "";
    //   }
    // }
  };

  const handleColsChange = (e) => {
    if (parseInt(e.target.value) < winLineLength) {
      alert("Score Line cant be bigger than Board Size");
      return;
    }
    socket.emit("colChange", e.target.value);
    //setPlayerScores({ playerO: "", playerX: "" });
    //setCols(e.target.value);
    //playerMoveCount = 0;
  };
  const handleWinLine = (e) => {
    if (parseInt(e.target.value) > parseInt(col)) {
      alert("Score Line cant be bigger than Board Size");
      setWinLineLength(3);
      return;
    }
    socket.emit("winLineChange", e.target.value);
    //setWinLineLength(parseInt(e.target.value));
  };

  useEffect(() => {
    setPlayerScores({ playerO: "", playerX: "" });
    playground.length = 0;
    playerMoveCount = 0;
    //playground = Array.from({ length: col }, () => Array(col).fill(''));
    for (let i = 0; i < col; i++) {
      playground[i] = [];
      for (let j = 0; j < col; j++) {
        playground[i][j] = "";
      }
    }
  }, [col]);

  useEffect(() => {
    socket.on("playerMove", ({ rowInd, colInd, item, id }) => {
      playerId = id;
      playerMoveCount++;
      playground[rowInd][colInd] = item;
      if (playerMoveCount === col * col) {
        setPlayerScores(arrCrawler(parseInt(winLineLength), playground));
      }
      setMove(item);
    });

    socket.on("colChange", (col) => {
      setCols(parseInt(col));
      setPlayerScores({ playerO: "", playerX: "" });
      playerMoveCount = 0;
      playground.length = 0;
      //playground = Array.from({ length: col }, () => Array(col).fill(''));
      for (let i = 0; i < col; i++) {
        playground[i] = [];
        for (let j = 0; j < col; j++) {
          playground[i][j] = "";
        }
      }
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

  const playerMove = (rowInd, colInd) => {
    if (playerId !== socket.id) {
      if (move === "O" && playground[rowInd][colInd] === "") {
        socket.emit("playerMove", { rowInd, colInd, item: "X", id: socket.id });
        //playground[rowInd][colInd] = "X";
        //setMove("X");
      } else {
        if (playground[rowInd][colInd] === "") {
          socket.emit("playerMove", {
            rowInd,
            colInd,
            item: "O",
            id: socket.id,
          });
          //playground[rowInd][colInd] = "O";
          //setMove("O");
        }
      }
    }
  };
  // useEffect(() => {
  //   //5px is the grid gap. num of columns -1 = num of gaps
  //   setCellSize((boardRef.current?.offsetWidth - 5 * (col - 1)) / col);
  // }, [col]);

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
            {cols.current.map((column) => {
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
            {cols.current.map((winLine) => {
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
          {playground.map((row, rowInd) => {
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
                  className="board-cell"
                  key={rowInd + colInd}
                  onClick={() => playerMove(rowInd, colInd)}
                  style={{
                    color: `${
                      playground[rowInd][colInd] === "X"
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
            order: cols.current.length === 6 ? "3" : "",
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
