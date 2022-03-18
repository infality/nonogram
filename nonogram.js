let dimensionSize = 15;
let fields = []
let colNumberCols = [];
let rowNumberCols = [];

// States: 0 = empty, 1 = filled, 2 = cross
let fieldStates = [];
let colNumberStates = [];
let rowNumberStates = [];

let isDragging = false;
let isCreating = false;
let dragFieldState = 0;
let dragStartRow = null;
let dragStartCol = null;
let hasChosenDirection = false;
let isDragHorizontal = false;
let lastDragDistance = 0;
let dragDistance = 0;

let board = parseGameString("QulgPDUmIURbdFhaR1I5YlNcfWwqQWxMczVCc0");

loadNumberStates(board);

loadGame();


function loadNumberStates(board) {
    for (let i = 0; i < 15; i++) {
        let col = [];
        for (let j = 0; j < 15; j++) {
            col.push(board[j][i]);
        }
        let nums = getSequenceNumbers(col);
        colNumberStates.push([]);
        nums.forEach(num => {
            colNumberStates[i].push({ num: num, striked: false });
        });

        nums = getSequenceNumbers(board[i]);
        rowNumberStates.push([]);
        nums.forEach(num => {
            rowNumberStates[i].push({ num: num, striked: false });
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
    if (count > 0) {
        nums.push(count);
    }
    return nums;
}

function loadGame() {
    let gameDiv = document.createElement("div");
    gameDiv.id = "game";
    document.body.appendChild(gameDiv);

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
        colNumberCols.push(colNumbersColDiv);

        for (let i = 0; i < colNumberStates[col].length; i++) {
            let numberDiv = document.createElement("div");
            numberDiv.classList.add("number");
            numberDiv.classList.add("colNumber");
            numberDiv.innerHTML = colNumberStates[col][i].num;
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
        rowNumberCols.push(rowNumbersColDiv);

        for (let i = 0; i < rowNumberStates[row].length; i++) {
            let numberDiv = document.createElement("div");
            numberDiv.classList.add("number");
            numberDiv.classList.add("rowNumber");
            numberDiv.innerHTML = rowNumberStates[row][i].num;
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
        fields.push(rowFields);
    }

    for (let row = 0; row < dimensionSize; row++) {
        let rowStates = []
        for (let col = 0; col < dimensionSize; col++) {
            rowStates.push(0);
        }
        fieldStates.push(rowStates);
    }

    document.addEventListener("mouseup", _ => {
        isDragging = false;
        /* for (let i = 0; i < dimensionSize; i++) {
            fieldStates[dragStartRow][i] = getState(dragStartRow, i);;
            fieldStates[i][dragStartCol] = getState(i, dragStartCol);;
            updateNumberStates(i, i);
        } */
        if (isDragHorizontal) {
            for (let col = Math.min(dragStartCol, dragStartCol + dragDistance); col <= Math.max(dragStartCol, dragStartCol + dragDistance); col++) {
                fieldStates[dragStartRow][col] = getState(dragStartRow, col);
                updateNumberStates(dragStartRow, col);
            }
        } else {
            for (let row = Math.min(dragStartRow, dragStartRow + dragDistance); row <= Math.max(dragStartRow, dragStartRow + dragDistance); row++) {
                fieldStates[row][dragStartCol] = getState(row, dragStartCol);
                updateNumberStates(row, dragStartCol);
            }
        }
    });

    Array.from(document.getElementsByClassName("field")).forEach(x => {
        x.addEventListener("mouseenter", e => {
            let fieldRect = fields[0][0].getBoundingClientRect();
            let currentRow = Math.floor((e.clientY - fieldRect.y) / fieldRect.height);
            let currentCol = Math.floor((e.clientX - fieldRect.x) / fieldRect.width);

            rowNumberCols[currentRow].classList.add("gameHighlight");
            colNumberCols[currentCol].classList.add("gameHighlight");
            for (let row = 0; row < 15; row++) {
                if (row == currentRow) {
                    continue;
                }
                fields[row][currentCol].classList.add("gameHighlight");
            }

            for (let col = 0; col < 15; col++) {
                if (col == currentCol) {
                    continue;
                }
                fields[currentRow][col].classList.add("gameHighlight");
            }
        });

        x.addEventListener("mouseleave", _ => {
            for (let row of fields) {
                for (let field of row) {
                    field.classList.remove("gameHighlight");
                }
            }
            for (let rowNumberCol of rowNumberCols) {
                rowNumberCol.classList.remove("gameHighlight");
            }
            for (let colNumberCol of colNumberCols) {
                colNumberCol.classList.remove("gameHighlight");
            }
        });

        x.addEventListener("mousedown", e => {
            if (isDragging || (e.button != 0 && e.button != 2)) {
                return;
            }
            let fieldRect = fields[0][0].getBoundingClientRect();
            if (e.clientX < fieldRect.x || e.clientY < fieldRect.y
                || e.clientX >= fieldRect.x + dimensionSize * fieldRect.width
                || e.clientY >= fieldRect.y + dimensionSize * fieldRect.height) {
                return;
            }

            let currentRow = Math.floor((e.clientY - fieldRect.y) / fieldRect.height);
            let currentCol = Math.floor((e.clientX - fieldRect.x) / fieldRect.width);

            if (e.button == 0) {
                if (fields[currentRow][currentCol].classList.contains("cross")) {
                    return;
                }
                if (fields[currentRow][currentCol].classList.contains("square")) {
                    unfillField(currentRow, currentCol);
                    isCreating = false;
                } else {
                    fillField(currentRow, currentCol);
                    isCreating = true;
                }
                dragFieldState = 1;
            } else if (e.button == 2) {
                if (fields[currentRow][currentCol].classList.contains("square")) {
                    return;
                }
                if (fields[currentRow][currentCol].classList.contains("cross")) {
                    uncrossField(currentRow, currentCol);
                    isCreating = false;
                } else {
                    crossField(currentRow, currentCol);
                    isCreating = true;
                }
                dragFieldState = 2;
            }

            isDragging = true;
            dragStartRow = currentRow;
            dragStartCol = currentCol;
            hasChosenDirection = false;
            lastDragDistance = 0;
            dragDistance = 0;
        });

        x.addEventListener("mousemove", e => {
            if (!isDragging || (e.button != 0 && e.button != 2)) {
                return;
            }
            let fieldRect = fields[0][0].getBoundingClientRect();
            if (e.clientX < fieldRect.x || e.clientY < fieldRect.y
                || e.clientX >= fieldRect.x + dimensionSize * fieldRect.width
                || e.clientY >= fieldRect.y + dimensionSize * fieldRect.height) {
                return;
            }

            let currentRow = Math.floor((e.clientY - fieldRect.y) / fieldRect.height);
            let currentCol = Math.floor((e.clientX - fieldRect.x) / fieldRect.width);

            if (!hasChosenDirection) {
                if (dragStartCol != currentCol) {
                    isDragHorizontal = true;
                    hasChosenDirection = true;
                } else if (dragStartRow != currentRow) {
                    isDragHorizontal = false;
                    hasChosenDirection = true;
                } else {
                    return;
                }
            }

            if (isDragHorizontal) {
                dragDistance = currentCol - dragStartCol;
            } else {
                dragDistance = currentRow - dragStartRow;
            }

            if (dragDistance != lastDragDistance) {
                let j = lastDragDistance;
                if (Math.sign(lastDragDistance) != Math.sign(dragDistance)) {
                    j = 0;
                } else if (Math.abs(lastDragDistance) - Math.abs(dragDistance) > 0) {
                    j = dragDistance;
                }

                let i = lastDragDistance;
                while (i != j) {
                    if (isDragHorizontal) {
                        if (isCreating) {
                            if (fieldStates[dragStartRow][dragStartCol + i] != dragFieldState) {
                                fields[dragStartRow][dragStartCol + i].classList.remove(getStateClass(dragFieldState));
                            }
                        } else {
                            if (fieldStates[dragStartRow][dragStartCol + i] == dragFieldState) {
                                fields[dragStartRow][dragStartCol + i].classList.add(getStateClass(dragFieldState));
                            }
                        }
                    } else {
                        if (isCreating) {
                            if (fieldStates[dragStartRow + i][dragStartCol] != dragFieldState) {
                                fields[dragStartRow + i][dragStartCol].classList.remove(getStateClass(dragFieldState));
                            }
                        } else {
                            if (fieldStates[dragStartRow + i][dragStartCol] == dragFieldState) {
                                fields[dragStartRow + i][dragStartCol].classList.add(getStateClass(dragFieldState));
                            }
                        }
                    }

                    if (i < j) {
                        i += 1;
                    } else {
                        i -= 1;
                    }
                }

                i = lastDragDistance;
                if (Math.sign(lastDragDistance) != Math.sign(dragDistance)) {
                    i = 0;
                } else {
                    if (Math.abs(lastDragDistance) - Math.abs(dragDistance) > 0) {
                        i = dragDistance; // Do not create any fields
                    }
                }
                while (i != dragDistance) {
                    if (i < dragDistance) {
                        i += 1;
                    } else {
                        i -= 1;
                    }

                    if (isDragHorizontal) {
                        if (isCreating) {
                            if (fieldStates[dragStartRow][dragStartCol + i] == 0) {
                                fields[dragStartRow][dragStartCol + i].classList.add(getStateClass(dragFieldState));
                            }
                        } else {
                            if (fieldStates[dragStartRow][dragStartCol + i] == dragFieldState) {
                                fields[dragStartRow][dragStartCol + i].classList.remove(getStateClass(dragFieldState));
                            }
                        }
                    } else {
                        if (isCreating) {
                            if (fieldStates[dragStartRow + i][dragStartCol] == 0) {
                                fields[dragStartRow + i][dragStartCol].classList.add(getStateClass(dragFieldState));
                            }
                        } else {
                            if (fieldStates[dragStartRow + i][dragStartCol] == dragFieldState) {
                                fields[dragStartRow + i][dragStartCol].classList.remove(getStateClass(dragFieldState));
                            }
                        }
                    }
                }

                if (dragDistance == 0) {
                    hasChosenDirection = false;
                }
                lastDragDistance = dragDistance;
            }
        });
    });
}

function updateNumberStates(row, col) {
    // Column
    let sequence = [];
    for (let i = 0; i < 15; i++) {
        sequence.push(fieldStates[i][col] == 1);
    }
    let nums = getSequenceNumbers(sequence);

    let lastIndex = nums.length;
    for (let i = 0; i < colNumberStates[col].length; i++) { // Forwards
        if (i < nums.length && nums[i] == colNumberStates[col][i].num) {
            strikeColNumber(col, i);
        } else {
            lastIndex = i;
            break;
        }
    }
    let numLength = colNumberStates[col].length;
    let matching = true;
    for (let i = 0; i < numLength - lastIndex; i++) { // Backwards
        if (matching && i < nums.length - lastIndex && nums[nums.length - i - 1] == colNumberStates[col][numLength - i - 1].num) {
            strikeColNumber(col, numLength - i - 1);
        } else {
            unstrikeColNumber(col, numLength - i - 1);
            matching = false;
        }
    }

    // Row
    sequence = [];
    for (let i = 0; i < 15; i++) {
        sequence.push(fieldStates[row][i] == 1);
    }
    nums = getSequenceNumbers(sequence);

    lastIndex = nums.length;
    for (let i = 0; i < rowNumberStates[row].length; i++) { // Forwards
        if (i < nums.length && nums[i] == rowNumberStates[row][i].num) {
            strikeRowNumber(row, i);
        } else {
            lastIndex = i;
            break;
        }
    }
    numLength = rowNumberStates[row].length;
    matching = true;
    for (let i = 0; i < numLength - lastIndex; i++) { // Backwards
        if (matching && i < nums.length - lastIndex && nums[nums.length - i - 1] == rowNumberStates[row][numLength - i - 1].num) {
            strikeRowNumber(row, numLength - i - 1);
        } else {
            unstrikeRowNumber(row, numLength - i - 1);
            matching = false;
        }
    }
}

function strikeColNumber(col, index) {
    colNumberStates[col][index].striked = true;
    colNumberCols[col].childNodes[index].classList.add("striked");
}

function unstrikeColNumber(col, index) {
    colNumberStates[col][index].striked = false;
    colNumberCols[col].childNodes[index].classList.remove("striked");
}

function strikeRowNumber(row, index) {
    rowNumberStates[row][index].striked = true;
    rowNumberCols[row].childNodes[index].classList.add("striked");
}

function unstrikeRowNumber(row, index) {
    rowNumberStates[row][index].striked = false;
    rowNumberCols[row].childNodes[index].classList.remove("striked");
}

function fillField(row, col) {
    fields[row][col].classList.add("square");
    fieldStates[row][col] = 1;
}

function crossField(row, col) {
    fields[row][col].classList.add("cross");
    fieldStates[row][col] = 2;
}

function unfillField(row, col) {
    fields[row][col].classList.remove("square");
    fieldStates[row][col] = 0;
}

function uncrossField(row, col) {
    fields[row][col].classList.remove("cross");
    fieldStates[row][col] = 0;
}

function getState(row, col) {
    if (fields[row][col].classList.contains("square")) {
        return 1;
    }
    if (fields[row][col].classList.contains("cross")) {
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

function parseGameString(base64) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    let fields = [];
    for (let i = 0; i < base64.length; i++) {
        let val = chars.indexOf(base64[i]);
        fields.push((val & 32) > 0);
        fields.push((val & 16) > 0);
        fields.push((val & 8) > 0);
        fields.push((val & 4) > 0);
        fields.push((val & 2) > 0);
        fields.push((val & 1) > 0);
    }

    if (fields.length < 225) {
        throw "Game string too short";
    }

    let board = [];
    for (let i = 0; i < 15; i++) {
        board.push([]);
        for (let j = 0; j < 15; j++) {
            board[i][j] = fields[i * 15 + j];
        }
    }
    console.log(board);
    return board;
}
