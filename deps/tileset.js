class MapTile {
    constructor(name) {
        this.name = name;
        this.neighbours = [];
        this.f = 0;
        this.g = 0;
        this.h = 0;
    }

    resetPathCost() {
        this.f = 0;
        this.g = 0;
        this.h = 0;
    }
}

class Tileset {
    constructor (img, tileW, tileH, names) {
        this.img = loadImage(img);
        this.tileW = tileW;
        this.tileH = tileH;
        this.names = names;
        this.tiles = [];
        this.selected = names[0];
        this.hide = true;
        this.map = [];
        this.blockedList = [];

        // create tile "blocks" for tileCount tiles
        for (let i = 0; i < names.length; i++) {
            this.tiles.push({name : names[i], xOff: 0, yOff: i * tileH});
        }
    }

    /* Draw a tile on the canvas */
    drawTile(tName, x, y, w = this.tileW, h = this.tileH) {
        for (let i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i].name == tName) {
                image(this.img, x, y, w, h, this.tiles[i].xOff, this.tiles[i].yOff, this.tileW, this.tileH);
            }
        }
    }

    setMap(pmap) {
        this.map = [];
        console.log(pmap.length);
        console.log(pmap[0].length);
        for (let i = 0; i < pmap.length; i++) {
            let row = [];
            for (let j = 0; j < pmap[0].length; j++) {
                console.log(i, j);
                row.push(new MapTile(pmap[i][j]));
            }
            this.map.push(row);
        }
    }


    /* Create a tilemap */
    creatorMode() {
        // create an empty tilemap, fill it with the first tileset image
        for (let y = 0; y < round(height / this.tileH); y++) {
            let row = [];
            for (let x = 0; x < round(width / this.tileW); x++) {
                row.push(new MapTile(this.selected));
            }
            this.map.push(row);
        }
        this.hide = false;
    }

    /* Select a tile to paint with in the creator mode by clicking a tile from the tool bar */
    handleClick() {
        if (this.hide)
            return;
        // clicking hide on the toolbar should hide the toolbar
        let r = 0;
        if (dist(mouseX, mouseY, width - this.tileW + (this.tileW / 2), height - (this.tileH / 2)) < this.tileW / 2) {
            this.hide = true;
            this.exportMapToText();
            return;
        }
        // check which tile was clicked
        for (let i = 0; i < this.tiles.length; i++) {
            let x = i * this.tileW + i;
            let y = height - this.tileH;
            let w = this.tileW;
            let h = this.tileH;
            if ((mouseX + r > x) && (mouseX - r < x + w) && (mouseY + r > y) && (mouseY - r < y + h)) {
                // tile to paint with is the clicked tile
                this.selected = this.tiles[i].name;
                return;
            }
        }
        // toolbar element was not clicked, try to draw
        this.handleDrag();
    }

    /* Dragging the mouse with a tile will add the tile to the tilemap */
    handleDrag() {
        if (!this.hide && mouseY > height - this.tileH)
            return;
        // draw the tile on the grid.
        let x = round(mouseX / this.tileW);
        let y = round(mouseY / this.tileH);
        this.map[y][x].name = this.selected;
    }

    /* Render map, and the toolbar if it's hidden */
    displayMap() {
        // show the toolbar by pressing H.
        if (keys[keyH]) {
            if (this.map.length == 0)
                this.creatorMode();
            this.hide = false;
        }
        // draw tiles from the tilemap on the canvas
        if (this.map.length == 0)
            return;
        for (let y = 0; y < round(height / this.tileH); y++) {
            for (let x = 0; x < round(width / this.tileW); x++) {
                this.drawTile(this.map[y][x].name, x * this.tileW, y * this.tileH);
            }
        }
        // display toolbar if it's not in hidden mode
        if (this.hide)
            return;
        stroke(0, 0, 0);
        fill(0);
        rect(0, height - this.tileH, width, this.tileH);
        for (let i = 0; i < this.tiles.length; i++) {
            image(this.img, i * this.tileW + i, height - this.tileH, this.tileW, this.tileH,
                this.tiles[i].xOff, this.tiles[i].yOff, this.tileW, this.tileH);
        }
        fill(255);
        rect(width - this.tileW, height - this.tileH, this.tileW, this.tileH);
        fill(255, 0, 0);
        textAlign(CENTER);
        textSize(this.tileW / 3);
        text("hide", width - this.tileW + (this.tileW / 2), height - (this.tileH / 2));
        // draw grid lines
        for (let i = 0; i < round(height / this.tileH); i++) {
            line(0, i * this.tileH, width, i * this.tileH);
        }
        for (let i = 0; i < round(width / this.tileW); i++) {
            line(i * this.tileW, 0, i * this.tileW, height - this.tileH);
        }
        noFill();
        stroke(255, 0, 0);
        strokeWeight(2);
        try {
            rect(round(mouseX / this.tileW) * this.tileW, round(mouseY / this.tileH) * this.tileH, this.tileW, this.tileH);
        } catch (err) {
            console.log("mouse out of canvas. - indicator unshown.");
        }
        stroke(0);
        strokeWeight(1);
    }

    exportMapToText() {
        let strDisp = "var worldMap = [\n";
        for (let y = 0; y < round(height / this.tileH); y++) {
            strDisp += "[";
            for (let x = 0; x < round(width / this.tileW); x++) {
                if ((x + 1) == round(width / this.tileW))
                    strDisp += '"' + this.map[y][x].name + '"';
                else
                    strDisp += '"' + this.map[y][x].name + '"' + ", ";
            }
            strDisp += "],\n";
        }
        strDisp += "];";
        console.log(strDisp);
        strDisp += "\n\n// Don't forget to do: tileset.setMap(worldMap);";
        let answer = prompt("Would you like to export a text fire for the current map?");
        if (answer == "y" || answer == "Y" || answer == "yes" || answer == "Yes" || answer == "YES") {
            let blob = new Blob([strDisp], { type: "text/plain;charset=utf-8" });
            saveAs(blob, "tilemap.js");
        }
    }

    // create a list of blocked tile IDs that entities can't move through
    initBlockedList(blocked) {
        this.blockedList = blocked;
    }

    initNeighbours() {

    }

    // A* path finding algorithm
    shortestPath() {

    }



}
