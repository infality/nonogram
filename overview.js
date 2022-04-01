let gameRows = 10;
let gameCols = 15;

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

    let progressBar = document.createElement("div");
    progressBar.id = "progressBar";
    progressBar.style.width = "25%";
    progressDiv.appendChild(progressBar);

    let progressInfo = document.createElement("div");
    progressInfo.id = "progressInfo";
    progressInfo.innerHTML = "25%";
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

            if (Math.random() < 0.75) {
                continue;
            }
            let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("viewBox", `0,0,${dimensionSize},${dimensionSize}`);
            gamePreviewDiv.appendChild(svg);

            for (let tileRow = 0; tileRow < dimensionSize; tileRow++) {
                for (let tileCol = 0; tileCol < dimensionSize; tileCol++) {
                    if (Math.random() < 0.6) {
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
    //let board = parseGameString("BwACAA4APgA4BVUO7hVUO7nd3f/z/+f/3////4");
    //let board = parseGameString("DfAeZBj5cWPHZ4NOA/gFZAeYH3D0B+we2Hwf6A");
    let board = parseGameString("A+AIfAHWAMcBw+eMexIGLwh7+eGeZhhIMJCQkA");

    document.body.innerHTML = "";
    loadNumberStates(board);
    loadGame();
}
