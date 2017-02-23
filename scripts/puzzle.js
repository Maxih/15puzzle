class Tile {
  constructor(val = 0, row = 0, col = 0) {
    this.val = val;
    this.row = row;
    this.col = col;

    this.$el = this.createElement();
  }

  createElement() {
    let element = $("<span>");

    element.attr("id", this.val);

    return element;
  }

  updatePos(col = this.col, row = this.row) {
    this.col = col;
    this.row = row;

    let xPos = col * this.$el.outerWidth(true);
    let yPos = row * this.$el.outerHeight(true);

    this.$el.css({top:yPos,left:xPos});
  }

  select() {
    this.$el.addClass("highlighted");
  }

  deselect() {
    this.$el.removeClass("highlighted");
  }

  setBlank() {
    this.$el.addClass("blank");
  }
}

class Puzzle {
  constructor(container, size = 4) {
    this.$container = container;
    this.size = size;
    this.emptyTile = null;
    this.board = this.createBoard();
    this.playable = false;

    this.initializeBoard();

    this.$container.mouseover((el) => {
      if(!this.playable) return;

      const targetId = el.target.id - 1;

      this.highlightNeighbors(this.board[targetId]);
    })

    this.$container.mouseout((el) => {
      if(!this.playable) return;

      this.resetBoard();
    })

    this.$container.click((el) => {
      if(!this.playable) return;

      const targetId = el.target.id - 1;

      this.makeMove(this.board[targetId]);
    });
  }

  play() {
    this.playable = false;
    this.$container.addClass("setup");
    this.shuffleBoard();
  }

  enableBoard() {
    this.playable = true;
    this.$container.removeClass("setup");
  }

  makeMove(tile) {
    if(tile === undefined) return;

    if(tile.row !== this.emptyTile.row && tile.col !== this.emptyTile.col) return;

    let neighbors = this.tilesBetween(tile);
    let deltas = this.movementDelta(tile);

    neighbors.forEach((tile) => {
      let newCol = tile.col + deltas.x;
      let newRow = tile.row + deltas.y;
      tile.updatePos(newCol, newRow);
      tile.deselect();
    });

    let newCol = this.emptyTile.col - deltas.x * neighbors.length;
    let newRow = this.emptyTile.row - deltas.y * neighbors.length;

    this.emptyTile.updatePos(newCol, newRow);
  }

  movementDelta(tile) {
    let deltaX = this.emptyTile.col - tile.col;
    let deltaY = this.emptyTile.row - tile.row;

    const deltas = {
      x: 0,
      y: 0
    };

    if(deltaX > 0) deltas.x = 1;
    else if(deltaX < 0) deltas.x = -1;

    if(deltaY > 0) deltas.y = 1;
    else if(deltaY < 0) deltas.y = -1;

    return deltas;
  }

  highlightNeighbors(tile) {
    if(tile === undefined)
      return;

    if(tile.row !== this.emptyTile.row && tile.col !== this.emptyTile.col)
      return;

    let neighbors = this.tilesBetween(tile);

    neighbors.forEach((tile) => {
      tile.select();
    });
  }

  resetBoard() {
    this.board.forEach((tile) => {
      tile.deselect();
    });
  }

  tilesBetween(tile1) {
    let tile2 = this.emptyTile;
    let leftCol = tile1.col <= tile2.col ? tile1.col : tile2.col;
    let rightCol = tile1.col <= tile2.col ? tile2.col : tile1.col;
    let leftRow = tile1.row <= tile2.row ? tile1.row : tile2.row;
    let rightRow = tile1.row <= tile2.row ? tile2.row : tile1.row;
    return this.board.filter((tile) => {
      return (tile.col >= leftCol && tile.col <= rightCol) &&
              (tile.row >= leftRow && tile.row <= rightRow) &&
              (tile.row === tile2.row || tile.col === tile2.col) &&
              (tile.row !== tile2.row || tile.col !== tile2.col);
    });
  }

  shuffleBoard() {
    let randomTimes = 50 + Math.floor(100 * Math.random());

    setIntervalTimes(() => {
      let tiles = this.board.filter((tile) => {
        return (tile.col === this.emptyTile.col || tile.row === this.emptyTile.row) &&
                (tile.col !== this.emptyTile.col || tile.row !== this.emptyTile.row);
      });

      let randomTileIdx = Math.floor(Math.random() * this.board.length);
      this.makeMove(tiles[randomTileIdx]);

    }, 25, randomTimes, this.enableBoard.bind(this));
  }

  initializeBoard() {
    this.board.forEach((tile) => {
      tile.updatePos();
    });
  }

  createBoard() {
    const board = [];

    for(let i = 0; i < this.size ** 2; i++) {
      let row = Math.floor(i / this.size);
      let col = i % this.size;
      board[i] = new Tile(i + 1, row, col);

      this.$container.append(board[i].$el);
    }

    this.emptyTile = board[this.size ** 2 - 1];
    this.emptyTile.setBlank();

    return board;
  }
}

function setIntervalTimes(callback, speed, times, completedCallback) {
  let iteration = 0;
  let intervalID = window.setInterval(() => {
    callback();

    if(++iteration === times) {
      completedCallback();
      window.clearInterval(intervalID);
    }
  }, speed);
}

$(() => {
  let test = new Puzzle($("#puzzle"));
  test.play();

  $(".shuffle").click(() => {
    test.play();
  })
})
