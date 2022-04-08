let gameRows;
let gameCols;
let progress = [];

let game = parseGameString(gameData);
loadGameProgress();
loadOverview();

function loadOverview() {
    let overViewDiv = document.createElement("div");
    overViewDiv.id = "overview";
    document.body.appendChild(overViewDiv);

    let headerDiv = document.createElement("div");
    headerDiv.id = "header";
    overViewDiv.appendChild(headerDiv);

    let progressDiv = document.createElement("div");
    progressDiv.id = "progress";
    headerDiv.appendChild(progressDiv);

    let finishedTiles = 0;
    progress.forEach(row => row.forEach(field => finishedTiles += field ? 1 : 0));
    let percentage = `${(100 * finishedTiles / (gameCols * gameRows)).toFixed(1)}%`;

    let progressBar = document.createElement("div");
    progressBar.id = "progressBar";
    progressBar.style.width = percentage;
    progressDiv.appendChild(progressBar);

    let progressInfo = document.createElement("div");
    progressInfo.id = "progressInfo";
    progressInfo.innerHTML = percentage;
    progressDiv.appendChild(progressInfo);

    let gamePreviewsDiv = document.createElement("div");
    gamePreviewsDiv.id = "gamePreviews";
    overViewDiv.appendChild(gamePreviewsDiv);

    const stylesheet = document.styleSheets[0];
    for (let i = 0; i < stylesheet.cssRules.length; i++) {
        if (stylesheet.cssRules[i].selectorText == '.gamePreview') {
            let size = `min(${80 / gameCols}vw,${70 / gameRows}vh)`;
            stylesheet.cssRules[i].style.width = size;
            stylesheet.cssRules[i].style.height = size;
            break;
        }
    }

    for (let row = 0; row < gameRows; row++) {
        let gamePreviewRow = document.createElement("div");
        gamePreviewRow.classList.add("gamePreviewRow");
        gamePreviewsDiv.appendChild(gamePreviewRow);

        for (let col = 0; col < gameCols; col++) {
            let gamePreviewDiv = document.createElement("div");
            gamePreviewDiv.classList.add("gamePreview");
            gamePreviewDiv.addEventListener("click", _ => {
                clickedPreview(row, col);
            });
            gamePreviewRow.appendChild(gamePreviewDiv);

            if (!progress[row][col]) {
                continue;
            }
            gamePreviewDiv.classList.add("gamePreviewSolved");
            let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("viewBox", `0,0,${dimensionSize},${dimensionSize}`);
            gamePreviewDiv.appendChild(svg);

            for (let tileRow = 0; tileRow < dimensionSize; tileRow++) {
                for (let tileCol = 0; tileCol < dimensionSize; tileCol++) {
                    if (!game[row][col][tileRow][tileCol]) {
                        continue;
                    }
                    let node = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                    node.setAttribute("width", "1");
                    node.setAttribute("height", "1");
                    node.setAttribute("x", tileCol);
                    node.setAttribute("y", tileRow);
                    node.style.fill = "#666";
                    node.style.strokeWidth = 0;
                    node.style.shapeRendering = "optimizeSpeed";
                    svg.appendChild(node);
                }
            }
        }
    }
}

function clickedPreview(row, col) {
    //let board = parseBoardString("BwACAA4APgA4BVUO7hVUO7nd3f/z/+f/3////4");
    //let board = parseBoardString("DfAeZBj5cWPHZ4NOA/gFZAeYH3D0B+we2Hwf6A");
    //let board = parseBoardString("A+AIfAHWAMcBw+eMexIGLwh7+eGeZhhIMJCQkA");

    document.body.innerHTML = "";
    gameState = getDefaultGameState();
    loadNumberStates(game[row][col]);
    loadGame((finished) => {
        if (finished) {
            progress[row][col] = true;
        }
        document.body.innerHTML = "";
        loadOverview();
    });
}

function loadGameProgress() {
    progress = [];
    for (let row = 0; row < gameRows; row++) {
        progress.push([]);
        for (let col = 0; col < gameCols; col++) {
            if (game[row][col].some(x => x.some(y => y))) {
                progress[row].push(false);
            } else {
                progress[row].push(true);
            }
        }
    }
}

function parseGameString(data) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    let index = data.indexOf(';');
    gameCols = parseInt(data.substring(0, index));
    gameRows = parseInt(data.substring(index + 1, data.indexOf(';', index + 1)));
    index = data.indexOf(';', index + 1) + 1;

    let fields = [];
    for (let i = index; i < data.length; i++) {
        let val = chars.indexOf(data[i]);
        fields.push((val & 32) > 0);
        fields.push((val & 16) > 0);
        fields.push((val & 8) > 0);
        fields.push((val & 4) > 0);
        fields.push((val & 2) > 0);
        fields.push((val & 1) > 0);
    }

    if (fields.length < gameCols * gameRows * dimensionSize * dimensionSize) {
        throw "Game string too short";
    }

    let rowSize = gameCols * dimensionSize;
    let game = [];
    for (let row = 0; row < gameRows; row++) {
        game.push([]);
        for (let col = 0; col < gameCols; col++) {

            let offset = row * dimensionSize * rowSize + col * dimensionSize;
            let board = [];
            for (let i = 0; i < dimensionSize; i++) {
                board.push([]);
                for (let j = 0; j < dimensionSize; j++) {
                    board[i].push(fields[offset + i * rowSize + j]);
                }
            }
            game[row].push(board);
        }
    }
    return game;
}
