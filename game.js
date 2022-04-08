const dimensionSize = 15;
let gameState = {};

function getDefaultGameState() {
    let state = {};
    state.startDate = new Date().getTime();
    state.timer = null;
    state.fields = []
    state.colNumberCols = [];
    state.rowNumberCols = [];

    // States: 0 = empty, 1 = filled, 2 = cross
    state.fieldStates = [];
    state.colNumberStates = [];
    state.rowNumberStates = [];

    state.isDragging = false;
    state.isCreating = false;
    state.dragFieldState = 0;
    state.dragStartRow = null;
    state.dragStartCol = null;
    state.hasChosenDirection = false;
    state.isDragHorizontal = false;
    state.lastDragDistance = 0;
    state.dragDistance = 0;
    return state;
}


function solve() {
    let colCandidates = [];
    let rowCandidates = [];
    let queue = [];
    for (let i = 0; i < dimensionSize; i++) {
        colCandidates.push(getColCandidates(i));
        rowCandidates.push(getRowCandidates(i));
        queue.push({ isRow: false, index: i });
        queue.push({ isRow: true, index: i });
    }

    while (queue.length > 0) {
        let q = queue.shift();
        if (q.isRow) {
            cleanAndOverlapRowCandidates(rowCandidates, q.index, queue);
        } else {
            cleanAndOverlapColCandidates(colCandidates, q.index, queue);
        }
    }
    if (rowCandidates.some(x => x.length == 0) || colCandidates.some(x = x.length == 0)) {
        alert("No solution found");
    }
    if (rowCandidates.some(x => x.length > 1) || colCandidates.some(x = x.length > 1)) {
        alert("More than one solution found");
    }
}

function cleanAndOverlapColCandidates(colCandidates, col, queue) {
    for (let row = 0; row < dimensionSize; row++) {
        let bitPosition = dimensionSize - row - 1;
        if (gameState.fieldStates[row][col] == 1) {
            colCandidates[col] = colCandidates[col].filter(x => getBit(x, bitPosition));
        } else if (gameState.fieldStates[row][col] == 2) {
            colCandidates[col] = colCandidates[col].filter(x => !getBit(x, bitPosition));
        }
    }

    for (let row = 0; row < dimensionSize; row++) {
        if (gameState.fieldStates[row][col] != 0) {
            continue;
        }

        let bitPosition = dimensionSize - row - 1;
        let state = getBit(colCandidates[col][0], bitPosition);
        let allEqual = true;
        for (let i = 1; i < colCandidates[col].length; i++) {
            if (getBit(colCandidates[col][i], bitPosition) != state) {
                allEqual = false;
                break;
            }
        }

        if (allEqual) {
            gameState.fieldStates[row][col] = state ? 1 : 2;
            gameState.fields[row][col].classList.add(state ? "square" : "cross");
            if (!queue.some(x => x.isRow && x.index == row)) {
                queue.push({ isRow: true, index: row });
            }
        }
    }
}

function cleanAndOverlapRowCandidates(rowCandidates, row, queue) {
    for (let col = 0; col < dimensionSize; col++) {
        let bitPosition = dimensionSize - col - 1;
        if (gameState.fieldStates[row][col] == 1) {
            rowCandidates[row] = rowCandidates[row].filter(x => getBit(x, bitPosition));
        } else if (gameState.fieldStates[row][col] == 2) {
            rowCandidates[row] = rowCandidates[row].filter(x => !getBit(x, bitPosition));
        }
    }

    for (let col = 0; col < dimensionSize; col++) {
        if (gameState.fieldStates[row][col] != 0) {
            continue;
        }

        let bitPosition = dimensionSize - col - 1;
        let state = getBit(rowCandidates[row][0], bitPosition);
        let allEqual = true;
        for (let i = 1; i < rowCandidates[row].length; i++) {
            if (getBit(rowCandidates[row][i], bitPosition) != state) {
                allEqual = false;
                break;
            }
        }

        if (allEqual) {
            gameState.fieldStates[row][col] = state ? 1 : 2;
            gameState.fields[row][col].classList.add(state ? "square" : "cross");
            if (!queue.some(x => !x.isRow && x.index == col)) {
                queue.push({ isRow: false, index: col });
            }
        }
    }
}

function getBit(num, position) {
    return (num & Math.pow(2, position)) > 0;
}

function getColCandidates(col) {
    let candidates = [];
    if (gameState.colNumberStates[col].length == 1 && gameState.colNumberStates[col][0] == 0) {
        candidates.push(0);
        return;
    }

    let colSum = 0;
    gameState.colNumberStates[col].forEach(s => {
        colSum += s.num;
    });
    let borders = new Array(gameState.colNumberStates[col].length).fill(1);
    borders[0] = 0;

    let lastReset = borders.length;
    while (true) {
        let borderSum = 0;
        borders.forEach(b => {
            borderSum += b;
        });

        if (colSum + borderSum <= dimensionSize) {
            // Store candidate as binary flags in form of number
            let candidate = 0;
            let offset = 0;
            for (let i = 0; i < borders.length; i++) {
                offset += borders[i];

                let n = gameState.colNumberStates[col][i].num;
                candidate |= (Math.pow(2, n) - 1) << (dimensionSize - offset - n);
                offset += n;
            }
            candidates.push(candidate);
            lastReset = borders.length;
            borders[borders.length - 1]++;

        } else {
            if (lastReset == 1) {
                break;
            }
            lastReset--;
            borders[lastReset] = 1;
            borders[lastReset - 1]++;
        }
    }
    return candidates;
}

function getRowCandidates(row) {
    let candidates = [];
    if (gameState.rowNumberStates[row].length == 1 && gameState.rowNumberStates[row][0] == 0) {
        candidates.push(0);
        return;
    }

    let rowSum = 0;
    gameState.rowNumberStates[row].forEach(s => {
        rowSum += s.num;
    });
    let borders = new Array(gameState.rowNumberStates[row].length).fill(1);
    borders[0] = 0;

    let lastReset = borders.length;
    while (true) {
        let borderSum = 0;
        borders.forEach(b => {
            borderSum += b;
        });

        if (rowSum + borderSum <= dimensionSize) {
            // Store candidate as binary flags in form of number
            let candidate = 0;
            let offset = 0;
            for (let i = 0; i < borders.length; i++) {
                offset += borders[i];

                let n = gameState.rowNumberStates[row][i].num;
                candidate |= (Math.pow(2, n) - 1) << (dimensionSize - offset - n);
                offset += n;
            }
            candidates.push(candidate);
            lastReset = borders.length;
            borders[borders.length - 1]++;

        } else {
            if (lastReset == 1) {
                break;
            }
            lastReset--;
            borders[lastReset] = 1;
            borders[lastReset - 1]++;
        }
    }
    return candidates;
}

function loadNumberStates(board) {
    for (let i = 0; i < dimensionSize; i++) {
        let col = [];
        for (let j = 0; j < dimensionSize; j++) {
            col.push(board[j][i]);
        }
        let nums = getSequenceNumbers(col);
        gameState.colNumberStates.push([]);
        nums.forEach(num => {
            gameState.colNumberStates[i].push({ num: num, striked: false });
        });

        nums = getSequenceNumbers(board[i]);
        gameState.rowNumberStates.push([]);
        nums.forEach(num => {
            gameState.rowNumberStates[i].push({ num: num, striked: false });
        });
    }
}

function getSequenceNumbers(array) {
    let nums = [];
    let count = 0;
    array.forEach(field => {
        if (field) {
            count++;
        } else {
            if (count > 0) {
                nums.push(count);
                count = 0;
            }
        }
    });
    if (count > 0 || nums.length == 0) {
        nums.push(count);
    }
    return nums;
}

function loadGame(exitFn) {
    let outerBlockDiv = document.createElement("div");
    outerBlockDiv.id = "outerBlock";
    document.body.appendChild(outerBlockDiv);

    // Controls header
    let controlsHeaderDiv = document.createElement("div");
    controlsHeaderDiv.id = "controlsHeader";
    outerBlockDiv.appendChild(controlsHeaderDiv);

    let backButton = document.createElement("button");
    backButton.id = "backButton";
    backButton.innerHTML = "← Back";
    backButton.addEventListener("click", () => {
        exitFn(false);
    });
    controlsHeaderDiv.appendChild(backButton);

    let gameProgressDiv = document.createElement("div");
    gameProgressDiv.id = "gameProgress";
    gameProgressDiv.innerHTML = "52%";
    controlsHeaderDiv.appendChild(gameProgressDiv);

    let timerDiv = document.createElement("div");
    timerDiv.id = "timer";
    timerDiv.innerHTML = "0:00";
    gameState.timer = setInterval(() => {
        let now = new Date().getTime();
        let diff = now - gameState.startDate;

        let hours = Math.floor(diff / (1000 * 60 * 60));
        let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((diff % (1000 * 60)) / 1000);

        timerDiv.innerHTML = `${hours < 1 ? "" : hours.toString() + ":"}${hours < 1 ? minutes : minutes.toString().padStart(2, 0)}:${seconds.toString().padStart(2, 0)}`;
    });
    controlsHeaderDiv.appendChild(timerDiv);

    // Game
    let gameDiv = document.createElement("div");
    gameDiv.id = "game";
    outerBlockDiv.appendChild(gameDiv);

    // Top
    let topPartDiv = document.createElement("div");
    topPartDiv.id = "topPart";
    gameDiv.appendChild(topPartDiv);

    // Column numbers
    let colNumbersDiv = document.createElement("div");
    colNumbersDiv.id = "colNumbers";
    topPartDiv.appendChild(colNumbersDiv);

    for (let col = 0; col < 15; col++) {
        let colNumbersColDiv = document.createElement("div");
        colNumbersColDiv.classList.add("colNumbersCol");
        colNumbersDiv.appendChild(colNumbersColDiv);
        gameState.colNumberCols.push(colNumbersColDiv);

        for (let i = 0; i < gameState.colNumberStates[col].length; i++) {
            let numberDiv = document.createElement("div");
            numberDiv.classList.add("number");
            numberDiv.classList.add("colNumber");
            numberDiv.innerHTML = gameState.colNumberStates[col][i].num;
            colNumbersColDiv.appendChild(numberDiv);
        }
    }

    // Bottom
    let bottomPartDiv = document.createElement("div");
    bottomPartDiv.id = "bottomPart";
    gameDiv.appendChild(bottomPartDiv);

    // Row numbers
    let rowNumbersDiv = document.createElement("div");
    rowNumbersDiv.id = "rowNumbers";
    bottomPartDiv.appendChild(rowNumbersDiv);

    for (let row = 0; row < 15; row++) {
        let rowNumbersColDiv = document.createElement("div");
        rowNumbersColDiv.classList.add("rowNumbersCol");
        rowNumbersDiv.appendChild(rowNumbersColDiv);
        gameState.rowNumberCols.push(rowNumbersColDiv);

        for (let i = 0; i < gameState.rowNumberStates[row].length; i++) {
            let numberDiv = document.createElement("div");
            numberDiv.classList.add("number");
            numberDiv.classList.add("rowNumber");
            numberDiv.innerHTML = gameState.rowNumberStates[row][i].num;
            rowNumbersColDiv.appendChild(numberDiv);
        }
    }


    // Board
    let boardDiv = document.createElement("div");
    boardDiv.id = "board";
    bottomPartDiv.appendChild(boardDiv);

    for (let row = 0; row < 15; row++) {
        if (row % 5 == 0 && row > 0) {
            let rowDivider = document.createElement("div");
            rowDivider.classList.add("divider");
            rowDivider.classList.add("rowDivider");
            boardDiv.appendChild(rowDivider);
        }

        let rowDiv = document.createElement("div");
        rowDiv.classList.add("row");
        boardDiv.appendChild(rowDiv);
        let rowFields = [];
        for (let col = 0; col < 15; col++) {
            if (col % 5 == 0 && col > 0) {
                let colDivider = document.createElement("div");
                colDivider.classList.add("divider");
                colDivider.classList.add("colDivider");
                rowDiv.appendChild(colDivider);
            }

            let fieldDiv = document.createElement("div");
            fieldDiv.classList.add("field");
            rowDiv.appendChild(fieldDiv);
            rowFields.push(fieldDiv);
        }
        gameState.fields.push(rowFields);
    }

    for (let row = 0; row < dimensionSize; row++) {
        let rowStates = []
        for (let col = 0; col < dimensionSize; col++) {
            rowStates.push(0);
        }
        gameState.fieldStates.push(rowStates);
    }

    document.addEventListener("mouseup", _ => {
        if (!gameState.isDragging) {
            return;
        }
        gameState.isDragging = false;
        /* for (let i = 0; i < dimensionSize; i++) {
            gameState.fieldStates[gameState.dragStartRow][i] = getState(gameState.dragStartRow, i);;
            gameState.fieldStates[i][gameState.dragStartCol] = getState(i, gameState.dragStartCol);;
            updateNumberStates(i, i);
        } */
        if (gameState.isDragHorizontal) {
            for (let col = Math.min(gameState.dragStartCol, gameState.dragStartCol + gameState.dragDistance); col <= Math.max(gameState.dragStartCol, gameState.dragStartCol + gameState.dragDistance); col++) {
                gameState.fieldStates[gameState.dragStartRow][col] = getState(gameState.dragStartRow, col);
                updateNumberStates(gameState.dragStartRow, col);
            }
        } else {
            for (let row = Math.min(gameState.dragStartRow, gameState.dragStartRow + gameState.dragDistance); row <= Math.max(gameState.dragStartRow, gameState.dragStartRow + gameState.dragDistance); row++) {
                gameState.fieldStates[row][gameState.dragStartCol] = getState(row, gameState.dragStartCol);
                updateNumberStates(row, gameState.dragStartCol);
            }
        }
    });

    Array.from(document.getElementsByClassName("field")).forEach(x => {
        x.addEventListener("mouseenter", e => {
            let fieldRect = gameState.fields[0][0].getBoundingClientRect();
            let currentRow = Math.floor((e.clientY - fieldRect.y) / fieldRect.height);
            let currentCol = Math.floor((e.clientX - fieldRect.x) / fieldRect.width);

            gameState.rowNumberCols[currentRow].classList.add("gameHighlight");
            gameState.colNumberCols[currentCol].classList.add("gameHighlight");
            for (let row = 0; row < 15; row++) {
                if (row == currentRow) {
                    continue;
                }
                gameState.fields[row][currentCol].classList.add("gameHighlight");
            }

            for (let col = 0; col < 15; col++) {
                if (col == currentCol) {
                    continue;
                }
                gameState.fields[currentRow][col].classList.add("gameHighlight");
            }
        });

        x.addEventListener("mouseleave", _ => {
            for (let row of gameState.fields) {
                for (let field of row) {
                    field.classList.remove("gameHighlight");
                }
            }
            for (let rowNumberCol of gameState.rowNumberCols) {
                rowNumberCol.classList.remove("gameHighlight");
            }
            for (let colNumberCol of gameState.colNumberCols) {
                colNumberCol.classList.remove("gameHighlight");
            }
        });

        x.addEventListener("mousedown", e => {
            if (gameState.isDragging || (e.button != 0 && e.button != 2)) {
                return;
            }
            let fieldRect = gameState.fields[0][0].getBoundingClientRect();
            if (e.clientX < fieldRect.x || e.clientY < fieldRect.y
                || e.clientX >= fieldRect.x + dimensionSize * fieldRect.width
                || e.clientY >= fieldRect.y + dimensionSize * fieldRect.height) {
                return;
            }

            let currentRow = Math.floor((e.clientY - fieldRect.y) / fieldRect.height);
            let currentCol = Math.floor((e.clientX - fieldRect.x) / fieldRect.width);

            if (e.button == 0) {
                if (gameState.fields[currentRow][currentCol].classList.contains("cross")) {
                    return;
                }
                if (gameState.fields[currentRow][currentCol].classList.contains("square")) {
                    unfillField(currentRow, currentCol);
                    gameState.isCreating = false;
                } else {
                    fillField(currentRow, currentCol);
                    gameState.isCreating = true;
                }
                gameState.dragFieldState = 1;
            } else if (e.button == 2) {
                if (gameState.fields[currentRow][currentCol].classList.contains("square")) {
                    return;
                }
                if (gameState.fields[currentRow][currentCol].classList.contains("cross")) {
                    uncrossField(currentRow, currentCol);
                    gameState.isCreating = false;
                } else {
                    crossField(currentRow, currentCol);
                    gameState.isCreating = true;
                }
                gameState.dragFieldState = 2;
            }

            gameState.isDragging = true;
            gameState.dragStartRow = currentRow;
            gameState.dragStartCol = currentCol;
            gameState.hasChosenDirection = false;
            gameState.lastDragDistance = 0;
            gameState.dragDistance = 0;
        });

        x.addEventListener("mousemove", e => {
            if (!gameState.isDragging || (e.button != 0 && e.button != 2)) {
                return;
            }
            let fieldRect = gameState.fields[0][0].getBoundingClientRect();
            if (e.clientX < fieldRect.x || e.clientY < fieldRect.y
                || e.clientX >= fieldRect.x + dimensionSize * fieldRect.width
                || e.clientY >= fieldRect.y + dimensionSize * fieldRect.height) {
                return;
            }

            let currentRow = Math.floor((e.clientY - fieldRect.y) / fieldRect.height);
            let currentCol = Math.floor((e.clientX - fieldRect.x) / fieldRect.width);

            if (!gameState.hasChosenDirection) {
                if (gameState.dragStartCol != currentCol) {
                    gameState.isDragHorizontal = true;
                    gameState.hasChosenDirection = true;
                } else if (gameState.dragStartRow != currentRow) {
                    gameState.isDragHorizontal = false;
                    gameState.hasChosenDirection = true;
                } else {
                    return;
                }
            }

            if (gameState.isDragHorizontal) {
                gameState.dragDistance = currentCol - gameState.dragStartCol;
            } else {
                gameState.dragDistance = currentRow - gameState.dragStartRow;
            }

            if (gameState.dragDistance != gameState.lastDragDistance) {
                let j = gameState.lastDragDistance;
                if (Math.sign(gameState.lastDragDistance) != Math.sign(gameState.dragDistance)) {
                    j = 0;
                } else if (Math.abs(gameState.lastDragDistance) - Math.abs(gameState.dragDistance) > 0) {
                    j = gameState.dragDistance;
                }

                let i = gameState.lastDragDistance;
                while (i != j) {
                    if (gameState.isDragHorizontal) {
                        if (gameState.isCreating) {
                            if (gameState.fieldStates[gameState.dragStartRow][gameState.dragStartCol + i] != gameState.dragFieldState) {
                                gameState.fields[gameState.dragStartRow][gameState.dragStartCol + i].classList.remove(getStateClass(gameState.dragFieldState));
                            }
                        } else {
                            if (gameState.fieldStates[gameState.dragStartRow][gameState.dragStartCol + i] == gameState.dragFieldState) {
                                gameState.fields[gameState.dragStartRow][gameState.dragStartCol + i].classList.add(getStateClass(gameState.dragFieldState));
                            }
                        }
                    } else {
                        if (gameState.isCreating) {
                            if (gameState.fieldStates[gameState.dragStartRow + i][gameState.dragStartCol] != gameState.dragFieldState) {
                                gameState.fields[gameState.dragStartRow + i][gameState.dragStartCol].classList.remove(getStateClass(gameState.dragFieldState));
                            }
                        } else {
                            if (gameState.fieldStates[gameState.dragStartRow + i][gameState.dragStartCol] == gameState.dragFieldState) {
                                gameState.fields[gameState.dragStartRow + i][gameState.dragStartCol].classList.add(getStateClass(gameState.dragFieldState));
                            }
                        }
                    }

                    if (i < j) {
                        i += 1;
                    } else {
                        i -= 1;
                    }
                }

                i = gameState.lastDragDistance;
                if (Math.sign(gameState.lastDragDistance) != Math.sign(gameState.dragDistance)) {
                    i = 0;
                } else {
                    if (Math.abs(gameState.lastDragDistance) - Math.abs(gameState.dragDistance) > 0) {
                        i = gameState.dragDistance; // Do not create any fields
                    }
                }
                while (i != gameState.dragDistance) {
                    if (i < gameState.dragDistance) {
                        i += 1;
                    } else {
                        i -= 1;
                    }

                    if (gameState.isDragHorizontal) {
                        if (gameState.isCreating) {
                            if (gameState.fieldStates[gameState.dragStartRow][gameState.dragStartCol + i] == 0) {
                                gameState.fields[gameState.dragStartRow][gameState.dragStartCol + i].classList.add(getStateClass(gameState.dragFieldState));
                            }
                        } else {
                            if (gameState.fieldStates[gameState.dragStartRow][gameState.dragStartCol + i] == gameState.dragFieldState) {
                                gameState.fields[gameState.dragStartRow][gameState.dragStartCol + i].classList.remove(getStateClass(gameState.dragFieldState));
                            }
                        }
                    } else {
                        if (gameState.isCreating) {
                            if (gameState.fieldStates[gameState.dragStartRow + i][gameState.dragStartCol] == 0) {
                                gameState.fields[gameState.dragStartRow + i][gameState.dragStartCol].classList.add(getStateClass(gameState.dragFieldState));
                            }
                        } else {
                            if (gameState.fieldStates[gameState.dragStartRow + i][gameState.dragStartCol] == gameState.dragFieldState) {
                                gameState.fields[gameState.dragStartRow + i][gameState.dragStartCol].classList.remove(getStateClass(gameState.dragFieldState));
                            }
                        }
                    }
                }

                if (gameState.dragDistance == 0) {
                    gameState.hasChosenDirection = false;
                }
                gameState.lastDragDistance = gameState.dragDistance;
            }
        });
    });
}

function updateNumberStates(row, col) {
    // Column
    let sequence = [];
    for (let i = 0; i < 15; i++) {
        sequence.push(gameState.fieldStates[i][col] == 1);
    }
    let nums = getSequenceNumbers(sequence);

    let lastIndex = nums.length;
    for (let i = 0; i < gameState.colNumberStates[col].length; i++) { // Forwards
        if (i < nums.length && nums[i] == gameState.colNumberStates[col][i].num) {
            strikeColNumber(col, i);
        } else {
            lastIndex = i;
            break;
        }
    }
    let numLength = gameState.colNumberStates[col].length;
    let matching = true;
    for (let i = 0; i < numLength - lastIndex; i++) { // Backwards
        if (matching && i < nums.length - lastIndex && nums[nums.length - i - 1] == gameState.colNumberStates[col][numLength - i - 1].num) {
            strikeColNumber(col, numLength - i - 1);
        } else {
            unstrikeColNumber(col, numLength - i - 1);
            matching = false;
        }
    }

    // Row
    sequence = [];
    for (let i = 0; i < 15; i++) {
        sequence.push(gameState.fieldStates[row][i] == 1);
    }
    nums = getSequenceNumbers(sequence);

    lastIndex = nums.length;
    for (let i = 0; i < gameState.rowNumberStates[row].length; i++) { // Forwards
        if (i < nums.length && nums[i] == gameState.rowNumberStates[row][i].num) {
            strikeRowNumber(row, i);
        } else {
            lastIndex = i;
            break;
        }
    }
    numLength = gameState.rowNumberStates[row].length;
    matching = true;
    for (let i = 0; i < numLength - lastIndex; i++) { // Backwards
        if (matching && i < nums.length - lastIndex && nums[nums.length - i - 1] == gameState.rowNumberStates[row][numLength - i - 1].num) {
            strikeRowNumber(row, numLength - i - 1);
        } else {
            unstrikeRowNumber(row, numLength - i - 1);
            matching = false;
        }
    }
}

function strikeColNumber(col, index) {
    gameState.colNumberStates[col][index].striked = true;
    gameState.colNumberCols[col].childNodes[index].classList.add("striked");
}

function unstrikeColNumber(col, index) {
    gameState.colNumberStates[col][index].striked = false;
    gameState.colNumberCols[col].childNodes[index].classList.remove("striked");
}

function strikeRowNumber(row, index) {
    gameState.rowNumberStates[row][index].striked = true;
    gameState.rowNumberCols[row].childNodes[index].classList.add("striked");
}

function unstrikeRowNumber(row, index) {
    gameState.rowNumberStates[row][index].striked = false;
    gameState.rowNumberCols[row].childNodes[index].classList.remove("striked");
}

function fillField(row, col) {
    gameState.fields[row][col].classList.add("square");
    gameState.fieldStates[row][col] = 1;
}

function crossField(row, col) {
    gameState.fields[row][col].classList.add("cross");
    gameState.fieldStates[row][col] = 2;
}

function unfillField(row, col) {
    gameState.fields[row][col].classList.remove("square");
    gameState.fieldStates[row][col] = 0;
}

function uncrossField(row, col) {
    gameState.fields[row][col].classList.remove("cross");
    gameState.fieldStates[row][col] = 0;
}

function getState(row, col) {
    if (gameState.fields[row][col].classList.contains("square")) {
        return 1;
    }
    if (gameState.fields[row][col].classList.contains("cross")) {
        return 2;
    }
    return 0;
}

function getStateClass(state) {
    if (state == 1) {
        return "square";
    }
    if (state == 2) {
        return "cross";
    }
    throw "Unknown state";
}
