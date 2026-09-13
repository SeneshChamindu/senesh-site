const boardElement = document.getElementById("chessBoard");
const turnText = document.getElementById("turnText");
const statusText = document.getElementById("statusText");
const message = document.getElementById("message");

const pieces = {
    wK: "♔",
    wQ: "♕",
    wR: "♖",
    wB: "♗",
    wN: "♘",
    wP: "♙",

    bK: "♚",
    bQ: "♛",
    bR: "♜",
    bB: "♝",
    bN: "♞",
    bP: "♟"
};

let board;
let currentTurn = "w";
let selected = null;
let legalMoves = [];
let gameOver = false;

function initialBoard() {
    return [
        ["bR","bN","bB","bQ","bK","bB","bN","bR"],
        ["bP","bP","bP","bP","bP","bP","bP","bP"],
        [null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null],
        ["wP","wP","wP","wP","wP","wP","wP","wP"],
        ["wR","wN","wB","wQ","wK","wB","wN","wR"]
    ];
}

function resetGame() {
    board = initialBoard();
    currentTurn = "w";
    selected = null;
    legalMoves = [];
    gameOver = false;

    statusText.textContent = "Game Active";
    message.textContent = "";

    renderBoard();
}

function renderBoard() {
    boardElement.innerHTML = "";

    turnText.textContent =
        currentTurn === "w" ? "White" : "Black";

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {

            const square = document.createElement("div");

            square.className =
                "square " +
                ((row + col) % 2 === 0 ? "light" : "dark");

            if (
                selected &&
                selected.row === row &&
                selected.col === col
            ) {
                square.classList.add("selected");
            }

            const move = legalMoves.find(
                m => m.row === row && m.col === col
            );

            if (move) {
                if (board[row][col]) {
                    square.classList.add("capture");
                } else {
                    square.classList.add("possible");
                }
            }

            const piece = board[row][col];

            if (piece) {
                square.textContent = pieces[piece];
            }

            square.onclick = () =>
                handleSquareClick(row, col);

            boardElement.appendChild(square);
        }
    }
}

function handleSquareClick(row, col) {
    if (gameOver) return;

    const piece = board[row][col];

    if (selected) {

        const move = legalMoves.find(
            m => m.row === row && m.col === col
        );

        if (move) {
            makeMove(
                selected.row,
                selected.col,
                row,
                col
            );
            return;
        }
    }

    if (
        piece &&
        piece[0] === currentTurn
    ) {

        selected = { row, col };

        legalMoves =
            getLegalMoves(row, col);

    } else {

        selected = null;
        legalMoves = [];
    }

    renderBoard();
}

function makeMove(fromRow, fromCol, toRow, toCol) {

    const movingPiece = board[fromRow][fromCol];

    const testBoard =
        board.map(row => [...row]);

    testBoard[toRow][toCol] =
        movingPiece;

    testBoard[fromRow][fromCol] =
        null;

    if (
        isKingInCheck(currentTurn, testBoard)
    ) {
        message.textContent =
            "You cannot leave your king in check.";

        selected = null;
        legalMoves = [];

        renderBoard();
        return;
    }

    board = testBoard;

    /* Pawn Promotion */

    if (
        movingPiece === "wP" &&
        toRow === 0
    ) {
        board[toRow][toCol] = "wQ";
    }

    if (
        movingPiece === "bP" &&
        toRow === 7
    ) {
        board[toRow][toCol] = "bQ";
    }

    selected = null;
    legalMoves = [];

    currentTurn =
        currentTurn === "w" ? "b" : "w";

    updateGameStatus();

    renderBoard();
}

function getLegalMoves(row, col) {

    const possible =
        getPseudoMoves(
            row,
            col,
            board
        );

    return possible.filter(move => {

        const testBoard =
            board.map(r => [...r]);

        testBoard[move.row][move.col] =
            testBoard[row][col];

        testBoard[row][col] = null;

        return !isKingInCheck(
            currentTurn,
            testBoard
        );
    });
}

function getPseudoMoves(row, col, boardState) {

    const piece = boardState[row][col];

    if (!piece) return [];

    const color = piece[0];
    const type = piece[1];

    let moves = [];

    const inside = (r, c) =>
        r >= 0 &&
        r < 8 &&
        c >= 0 &&
        c < 8;

    const addSliding = directions => {

        directions.forEach(([dr, dc]) => {

            let r = row + dr;
            let c = col + dc;

            while (inside(r, c)) {

                if (!boardState[r][c]) {

                    moves.push({
                        row: r,
                        col: c
                    });

                } else {

                    if (
                        boardState[r][c][0] !== color
                    ) {
                        moves.push({
                            row: r,
                            col: c
                        });
                    }

                    break;
                }

                r += dr;
                c += dc;
            }
        });
    };

    if (type === "P") {

        const direction =
            color === "w" ? -1 : 1;

        const startRow =
            color === "w" ? 6 : 1;

        const nextRow =
            row + direction;

        if (
            inside(nextRow, col) &&
            !boardState[nextRow][col]
        ) {

            moves.push({
                row: nextRow,
                col
            });

            const doubleRow =
                row + direction * 2;

            if (
                row === startRow &&
                !boardState[doubleRow][col]
            ) {

                moves.push({
                    row: doubleRow,
                    col
                });
            }
        }

        [-1, 1].forEach(dc => {

            const r =
                row + direction;

            const c =
                col + dc;

            if (
                inside(r, c) &&
                boardState[r][c] &&
                boardState[r][c][0] !== color
            ) {

                moves.push({
                    row: r,
                    col: c
                });
            }
        });
    }

    if (type === "N") {

        const offsets = [
            [-2,-1],[-2,1],
            [-1,-2],[-1,2],
            [1,-2],[1,2],
            [2,-1],[2,1]
        ];

        offsets.forEach(([dr, dc]) => {

            const r = row + dr;
            const c = col + dc;

            if (
                inside(r, c) &&
                (
                    !boardState[r][c] ||
                    boardState[r][c][0] !== color
                )
            ) {

                moves.push({
                    row: r,
                    col: c
                });
            }
        });
    }

    if (type === "B") {

        addSliding([
            [-1,-1],
            [-1,1],
            [1,-1],
            [1,1]
        ]);
    }

    if (type === "R") {

        addSliding([
            [-1,0],
            [1,0],
            [0,-1],
            [0,1]
        ]);
    }

    if (type === "Q") {

        addSliding([
            [-1,-1],
            [-1,1],
            [1,-1],
            [1,1],
            [-1,0],
            [1,0],
            [0,-1],
            [0,1]
        ]);
    }

    if (type === "K") {

        const offsets = [
            [-1,-1],[-1,0],[-1,1],
            [0,-1],        [0,1],
            [1,-1],[1,0],[1,1]
        ];

        offsets.forEach(([dr, dc]) => {

            const r = row + dr;
            const c = col + dc;

            if (
                inside(r, c) &&
                (
                    !boardState[r][c] ||
                    boardState[r][c][0] !== color
                )
            ) {

                moves.push({
                    row: r,
                    col: c
                });
            }
        });
    }

    return moves;
}

function findKing(color, boardState) {

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            if (
                boardState[row][col] ===
                color + "K"
            ) {

                return {
                    row,
                    col
                };
            }
        }
    }

    return null;
}

function isKingInCheck(color, boardState) {

    const king =
        findKing(color, boardState);

    if (!king) return true;

    const enemy =
        color === "w" ? "b" : "w";

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const piece =
                boardState[row][col];

            if (
                !piece ||
                piece[0] !== enemy
            ) continue;

            const moves =
                getAttackMoves(
                    row,
                    col,
                    boardState
                );

            if (
                moves.some(
                    move =>
                        move.row === king.row &&
                        move.col === king.col
                )
            ) {
                return true;
            }
        }
    }

    return false;
}

function getAttackMoves(row, col, boardState) {

    const piece =
        boardState[row][col];

    if (!piece) return [];

    const color = piece[0];

    if (piece[1] === "P") {

        const direction =
            color === "w" ? -1 : 1;

        return [-1, 1]
            .map(dc => ({
                row: row + direction,
                col: col + dc
            }))
            .filter(
                m =>
                    m.row >= 0 &&
                    m.row < 8 &&
                    m.col >= 0 &&
                    m.col < 8
            );
    }

    return getPseudoMoves(
        row,
        col,
        boardState
    );
}

function playerHasMoves(color) {

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const piece =
                board[row][col];

            if (
                piece &&
                piece[0] === color
            ) {

                const previousTurn =
                    currentTurn;

                currentTurn = color;

                const moves =
                    getLegalMoves(row, col);

                currentTurn =
                    previousTurn;

                if (moves.length) {
                    return true;
                }
            }
        }
    }

    return false;
}

function updateGameStatus() {

    const check =
        isKingInCheck(
            currentTurn,
            board
        );

    const hasMoves =
        playerHasMoves(currentTurn);

    if (!hasMoves) {

        gameOver = true;

        if (check) {

            const winner =
                currentTurn === "w"
                    ? "Black"
                    : "White";

            statusText.textContent =
                "Checkmate";

            message.textContent =
                `${winner} wins by checkmate!`;

        } else {

            statusText.textContent =
                "Stalemate";

            message.textContent =
                "Draw by stalemate.";
        }

        return;
    }

    if (check) {

        statusText.textContent =
            "Check";

        message.textContent =
            `${
                currentTurn === "w"
                    ? "White"
                    : "Black"
            } king is in check.`;

    } else {

        statusText.textContent =
            "Game Active";

        message.textContent = "";
    }
}

resetGame();
