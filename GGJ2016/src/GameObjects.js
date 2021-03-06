var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var GameObjects;
(function (GameObjects) {
    var ActorFlag = (function () {
        // boilerplate
        function ActorFlag(value) {
            this.value = value;
        }
        ActorFlag.prototype.toString = function () {
            return this.value;
        };
        // values 
        ActorFlag.blank = new ActorFlag("blank");
        ActorFlag.red = new ActorFlag("red");
        ActorFlag.blue = new ActorFlag("blue");
        return ActorFlag;
    })();
    var Box = (function () {
        function Box(pos) {
            this.pos = new Phaser.Point(pos.x + 35, pos.y + 2);
            this.spriteBlank = TitoloGioco.Globals.game.add.sprite(pos.x, pos.y, 'tile_blank');
            this.spriteBlue = TitoloGioco.Globals.game.add.sprite(pos.x, pos.y, 'tile_blue');
            this.spriteBlue.alpha = 0;
            this.spriteRed = TitoloGioco.Globals.game.add.sprite(pos.x, pos.y, 'tile_red');
            this.spriteRed.alpha = 0;
            this.flag = ActorFlag.blank;
        }
        Box.prototype.changeActor = function (index) {
            if (index == 0) {
                this.flag = ActorFlag.red;
                this.spriteRed.alpha = 1;
                this.spriteBlue.alpha = 0;
            }
            else if (index == 1) {
                this.flag = ActorFlag.blue;
                this.spriteRed.alpha = 0;
                this.spriteBlue.alpha = 1;
            }
            else {
                this.flag = ActorFlag.blank;
                this.spriteRed.alpha = 0;
                this.spriteBlue.alpha = 0;
            }
        };
        return Box;
    })();
    var GridBoxes = (function () {
        function GridBoxes(size) {
            this.initTiles = new Phaser.Point(128, 256);
            this.initPlayers = new Phaser.Point(163, 258);
            this.boxes = [];
            for (var i = 0; i < size.x; ++i) {
                this.boxes.push(new Array());
                for (var j = 0; j < size.y; ++j) {
                    this.boxes[i].push(new Box(new Phaser.Point(this.initTiles.x + (i * 64), this.initTiles.y + (j * (64 - 12)))));
                }
            }
            for (var i = 0; i < size.x; ++i) {
                for (var j = 0; j < size.y; ++j) {
                    if (this.boxes[i - 1] !== undefined)
                        this.boxes[i][j].left = this.boxes[i - 1][j];
                    if (this.boxes[i + 1] !== undefined)
                        this.boxes[i][j].right = this.boxes[i + 1][j];
                    if (this.boxes[i][j - 1] !== undefined)
                        this.boxes[i][j].top = this.boxes[i][j - 1];
                    if (this.boxes[i][j + 1] !== undefined)
                        this.boxes[i][j].bottom = this.boxes[i][j + 1];
                }
            }
        }
        GridBoxes.prototype.checkClosedPath = function (r, c, index) {
            var flagPlayer = (index == 0) ? ActorFlag.red : ActorFlag.blue;
            if (this.boxes[c][r].flag != flagPlayer) {
                this.boxes[c][r].changeActor(index);
                for (var y = 0; y < this.boxes.length; y++)
                    for (var x = 0; x < this.boxes[y].length; x++)
                        this.boxes[y][x].visited = false;
                var pila = [this.boxes[c][r]];
                this.boxes[c][r].prev = null;
                while (pila.length != 0) {
                    var curr = pila.pop();
                    // marca come visitato
                    curr.visited = true;
                    if (curr.prev != this.boxes[c][r] &&
                        (curr.left == this.boxes[c][r] ||
                            curr.right == this.boxes[c][r] ||
                            curr.top == this.boxes[c][r] ||
                            curr.bottom == this.boxes[c][r])) {
                        // ciclo trovato!
                        var ciclo = [curr];
                        while (ciclo[ciclo.length - 1].prev != null)
                            ciclo.push(ciclo[ciclo.length - 1].prev);
                        if (ciclo.length > 7) {
                            for (var i = 0; i < ciclo.length; ++i) {
                                ciclo[i].changeActor(2);
                            }
                            console.log("TROVATO");
                        }
                        break;
                    }
                    if (curr.left && curr.left.flag === flagPlayer && !curr.left.visited) {
                        curr.left.prev = curr;
                        pila.push(curr.left);
                    }
                    if (curr.right && curr.right.flag === flagPlayer && !curr.right.visited) {
                        curr.right.prev = curr;
                        pila.push(curr.right);
                    }
                    if (curr.top && curr.top.flag === flagPlayer && !curr.top.visited) {
                        curr.top.prev = curr;
                        pila.push(curr.top);
                    }
                    if (curr.bottom && curr.bottom.flag === flagPlayer && !curr.bottom.visited) {
                        curr.bottom.prev = curr;
                        pila.push(curr.bottom);
                    }
                }
            }
        };
        GridBoxes.prototype.getNext = function (playerPos, dir, index) {
            var r = Math.ceil((playerPos.y - this.initPlayers.y) / 52);
            var c = Math.ceil((playerPos.x - this.initPlayers.x) / 64);
            this.checkClosedPath(r, c, index);
            r += dir.y;
            c += dir.x;
            if (r < 0)
                r = 0;
            if (c < 0)
                c = 0;
            if (c >= this.boxes.length)
                c = this.boxes.length - 1;
            if (r >= this.boxes[c].length)
                r = this.boxes[c].length - 1;
            return this.boxes[c][r].pos;
        };
        GridBoxes.prototype.getCoords = function (x, y) {
            return this.boxes[x][y].pos;
        };
        return GridBoxes;
    })();
    GameObjects.GridBoxes = GridBoxes;
    var ActorState = (function () {
        // boilerplate 
        function ActorState(value) {
            this.value = value;
        }
        ActorState.prototype.toString = function () {
            return this.value;
        };
        // values 
        ActorState.idle = new ActorState("idle");
        ActorState.walk = new ActorState("walk");
        ActorState.canChangeDir = new ActorState("canChangeDir");
        ActorState.cast = new ActorState("cast");
        ActorState.die = new ActorState("die");
        ActorState.debug = new ActorState("debug");
        return ActorState;
    })();
    GameObjects.ActorState = ActorState;
    // Sample usage: var first: ActorState = ActorState.idle;
    var GameActor = (function () {
        function GameActor(sprite) {
            this.sprite = sprite;
            this.fireType = 0;
            this.walkDir = new Phaser.Point(0, 0);
            this.newDir = new Phaser.Point(0, 0);
            this.sprite.anchor.set(0.5);
        }
        GameActor.prototype.die = function () {
            // L'attore cadrà a terrà e non potrà più muoversi
        };
        GameActor.prototype.setState = function (state) {
            this.state = state;
            this.playFrames();
        };
        GameActor.prototype.playFrames = function () {
            var facing = 'Def';
            if (this.state === ActorState.walk) {
                if (this.walkDir.y !== 0) {
                    switch (this.walkDir.y) {
                        case -1:
                            facing = 'Up';
                            break;
                        case 1:
                            facing = 'Down';
                            break;
                    }
                }
                else {
                    switch (this.walkDir.x) {
                        case -1:
                            facing = 'Left';
                            break;
                        case 1:
                            facing = 'Right';
                            break;
                        case 0:
                            this.state = ActorState.idle;
                            break;
                    }
                }
            }
            if (this.state === ActorState.debug) {
                this.sprite.animations.stop();
            }
            this.sprite.play(this.state.toString() + facing);
        };
        GameActor.prototype.setWalkDir = function (walkDir) {
            this.walkDir = walkDir;
        };
        GameActor.prototype.setNewDir = function (newDir) {
            this.newDir = newDir;
        };
        GameActor.prototype.update = function () {
        };
        GameActor.prototype.isIdle = function () {
            return this.state === ActorState.idle;
        };
        return GameActor;
    })();
    var Player = (function (_super) {
        __extends(Player, _super);
        function Player(sprite, index, gameState) {
            _super.call(this, sprite);
            this.gameState = gameState;
            this.index = index;
            this.gameState = gameState;
            this.sprite.animations.add('idleDef', [0, 1, 2, 3], 5, true);
            this.sprite.animations.add('walkRight', [10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 10, true);
            this.sprite.animations.add('walkLeft', [20, 21, 22, 23, 24, 25, 26, 27, 28, 29], 10, true);
            this.sprite.animations.add('walkDown', [30, 31, 32, 33, 34, 35, 36, 37, 38, 39], 10, true);
            this.sprite.animations.add('walkUp', [40, 41, 42, 43, 44, 45, 46, 47, 48, 49], 10, true);
            if (index == 0) {
                this.keys = TitoloGioco.Globals.game.input.keyboard.addKeys({
                    'SPACEBAR': Phaser.Keyboard.SPACEBAR,
                    'W': Phaser.Keyboard.W, 'A': Phaser.Keyboard.A, 'S': Phaser.Keyboard.S, 'D': Phaser.Keyboard.D,
                });
            }
            else {
                this.keys = TitoloGioco.Globals.game.input.keyboard.addKeys({
                    'left': Phaser.Keyboard.LEFT, 'right': Phaser.Keyboard.RIGHT, 'up': Phaser.Keyboard.UP, 'down': Phaser.Keyboard.DOWN
                });
            }
            this.setState(ActorState.idle);
        }
        Player.prototype.getDirection = function () {
            // Check nuova direzione 
            var newDir = new Phaser.Point();
            if ((this.keys.W && this.keys.W.isDown) || (this.keys.up && this.keys.up.isDown)) {
                newDir.y = -1;
            }
            else if ((this.keys.S && this.keys.S.isDown) || (this.keys.down && this.keys.down.isDown)) {
                newDir.y = +1;
            }
            if (newDir.y == 0)
                if ((this.keys.A && this.keys.A.isDown) || (this.keys.left && this.keys.left.isDown)) {
                    newDir.x = -1;
                }
                else if ((this.keys.D && this.keys.D.isDown) || (this.keys.right && this.keys.right.isDown)) {
                    newDir.x = +1;
                }
            return newDir;
        };
        Player.prototype.update = function () {
            // Debug: START GAME
            if (!TitoloGioco.Globals.start && (this.keys.SPACEBAR && this.keys.SPACEBAR.isDown)) {
                this.gameState.play();
            }
            // Controllo se il personaggio è ancora vivo
            if (this.state !== ActorState.die && this.state !== ActorState.debug) {
                // Controllo se è stata premuta una direzione
                var newDir = this.getDirection();
                // Se ha scelto una nuova direzione la cambio
                if (newDir.x !== 0 || newDir.y !== 0) {
                    this.setNewDir(newDir);
                }
                if (this.state === ActorState.canChangeDir) {
                    this.setWalkDir(this.newDir);
                    this.setState(ActorState.walk);
                    var p = this.gameState.boxes.getNext(new Phaser.Point(this.sprite.x, this.sprite.y), this.walkDir, this.index);
                    this.gameState.add.tween(this.sprite).to(p, 300, "Linear", true).onComplete.add(this.touchTile, this);
                }
            }
        };
        Player.prototype.touchTile = function () {
            this.setState(ActorState.canChangeDir);
        };
        return Player;
    })(GameActor);
    GameObjects.Player = Player;
})(GameObjects || (GameObjects = {}));
//# sourceMappingURL=GameObjects.js.map