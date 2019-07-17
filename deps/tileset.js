class Tileset {
    constructor (img, tileW, tileH, names) {
        this.img = img;
        this.tileW = tileW;
        this.tileH = tileH;
        this.names = names;
        this.tiles = [];

        // create tile "blocks" for tileCount tiles
        for (let i = 0; i < names.length; i++) {
            this.tiles.push({name : names[i], xOff: 0, yOff: i * tileH});
        }
    }

    drawTile(tName, x, y, w = this.tileW, h = this.tileH) {
        for (let i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i].name == tName) {
                image(this.img, x, y, w, h, this.tiles[i].xOff, this.tiles[i].yOff, this.tileW, this.tileH);
            }
        }
    }
}
