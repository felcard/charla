// Checks for messages coming from clients. Anything can be sent over the socket,
// not only what our own client sends, so game messages are checked before use.

// The client offers boards from 3x3 up to 12x12.
const MIN_SIZE = 3;
const MAX_SIZE = 12;

const isSize = (value) => {
    const n = Number(value);
    return Number.isInteger(n) && n >= MIN_SIZE && n <= MAX_SIZE;
};

// A finished board: square, within size limits, every cell taken by X or O.
const isFullBoard = (board) =>
    Array.isArray(board) &&
    isSize(board.length) &&
    board.every(
        (row) =>
            Array.isArray(row) &&
            row.length === board.length &&
            row.every((cell) => cell === 'X' || cell === 'O')
    );

const isMove = (move) =>
    move !== null &&
    typeof move === 'object' &&
    Number.isInteger(move.rowInd) && move.rowInd >= 0 && move.rowInd < MAX_SIZE &&
    Number.isInteger(move.colInd) && move.colInd >= 0 && move.colInd < MAX_SIZE &&
    (move.item === 'X' || move.item === 'O') &&
    typeof move.id === 'string';

module.exports = { isSize, isFullBoard, isMove };
