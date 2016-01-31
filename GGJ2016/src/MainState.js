/*
for (y = 0; y < 10; y++) {
    boxes.push([]);
    for (x = 0; x < 10; x++) {
        boxes[y].push(document.getElementById("box" + x + "_" + y));

        boxes[y][x].left = document.getElementById("box" + (x - 1) + "_" + y);
        boxes[y][x].right = document.getElementById("box" + (x + 1) + "_" + y);
        boxes[y][x].top = document.getElementById("box" + x + "_" + (y - 1));
        boxes[y][x].bottom = document.getElementById("box" + x + "_" + (y + 1));

    }
}

var fase = "COLORE_INIZIALE";

function azione(x, y) {
    if (fase == "COLORE_INIZIALE")
        return true;

    if (fase == "CERCA_CONTORNO") {
        // la casella su cui ci troviamo va prima colorata:
        boxes[y][x].checked = true;
        var i, contorno = cerca_contorno(x, y);
        var r = [];
        for (i = 0; i < contorno.length; i++)
            r.push(contorno[i].id);
        alert(r.join());
        return false;
    }

    return false;
}


function cerca_contorno(orig_x, orig_y) {
    for (y = 0; y < 10; y++)
        for (x = 0; x < 10; x++)
            boxes[y][x].visited = false;

    var pila = [boxes[orig_y][orig_x]];
    boxes[orig_y][orig_x].prev = null;

    while (pila.length != 0) {
        var curr = pila.pop();
 
        // marca come visitato
        curr.visited = true;

        if (curr.prev != boxes[orig_y][orig_x] &&
            (curr.left == boxes[orig_y][orig_x] ||
                curr.right == boxes[orig_y][orig_x] ||
                curr.top == boxes[orig_y][orig_x] ||
                curr.bottom == boxes[orig_y][orig_x])) {
            // ciclo trovato!
            var ciclo = [curr];
            while (ciclo[ciclo.length - 1].prev != null)
                ciclo.push(ciclo[ciclo.length - 1].prev);
            return ciclo;
        }

        if (curr.left && curr.left.checked && !curr.left.visited) {
            curr.left.prev = curr;
            pila.push(curr.left);
        }

        if (curr.right && curr.right.checked && !curr.right.visited) {
            curr.right.prev = curr;
            pila.push(curr.right);
        }

        if (curr.top && curr.top.checked && !curr.top.visited) {
            curr.top.prev = curr;
            pila.push(curr.top);
        }

        if (curr.bottom && curr.bottom.checked && !curr.bottom.visited) {
            curr.bottom.prev = curr;
            pila.push(curr.bottom);
        }
    }

    return null;
}
*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
    function Box(pos, gameState) {
        this.gameState = gameState;
        this.gameState = gameState;
        this.pos = new Phaser.Point(pos.x + 35, pos.y + 2);
        this.spriteBlank = this.gameState.add.sprite(pos.x, pos.y, 'tile_blank');
        this.spriteBlue = this.gameState.add.sprite(pos.x, pos.y, 'tile_blue');
        this.spriteBlue.alpha = 0;
        this.spriteRed = this.gameState.add.sprite(pos.x, pos.y, 'tile_red');
        this.spriteRed.alpha = 0;
        this.flag = ActorFlag.blank;
    }
    Box.prototype.changeActor = function (index) {
        if (index == 0) {
            this.flag = ActorFlag.red;
            this.spriteRed.alpha = 1;
            this.spriteBlue.alpha = 0;
        }
        if (index == 1) {
            this.flag = ActorFlag.blue;
            this.spriteRed.alpha = 0;
            this.spriteBlue.alpha = 1;
        }
    };
    return Box;
})();
var GridBoxes = (function () {
    function GridBoxes(size, gameState) {
        this.gameState = gameState;
        this.initTiles = new Phaser.Point(128, 256);
        this.initPlayers = new Phaser.Point(163, 258);
        this.boxes = [];
        for (var i = 0; i < size.x; ++i) {
            this.boxes.push(new Array());
            for (var j = 0; j < size.y; ++j) {
                this.boxes[i].push(new Box(new Phaser.Point(this.initTiles.x + (i * 64), this.initTiles.y + (j * (64 - 12))), gameState));
            }
        }
    }
    GridBoxes.prototype.getNext = function (playerPos, dir, index) {
        var r = Math.ceil((playerPos.y - this.initPlayers.y) / 52);
        var c = Math.ceil((playerPos.x - this.initPlayers.x) / 64);
        this.boxes[c][r].changeActor(index);
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
// Sample usage: var first: ActorState = ActorState.idle;
var GameActor = (function () {
    function GameActor(sprite, gameState) {
        this.sprite = sprite;
        this.gameState = gameState;
        this.fireType = 0;
        this.walkDir = new Phaser.Point(0, 0);
        this.newDir = new Phaser.Point(0, 0);
        this.gameState.physics.arcade.enable(this.sprite);
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
    return GameActor;
})();
var Player = (function (_super) {
    __extends(Player, _super);
    function Player(sprite, index, gameState) {
        _super.call(this, sprite, gameState);
        this.gameState.physics.arcade.enable(this.sprite);
        this.index = index;
        this.sprite.animations.add('idleDef', [0, 1, 2, 3], 5, true);
        this.sprite.animations.add('walkRight', [10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 10, true);
        this.sprite.animations.add('walkLeft', [20, 21, 22, 23, 24, 25, 26, 27, 28, 29], 10, true);
        this.sprite.animations.add('walkDown', [30, 31, 32, 33, 34, 35, 36, 37, 38, 39], 10, true);
        this.sprite.animations.add('walkUp', [40, 41, 42, 43, 44, 45, 46, 47, 48, 49], 10, true);
        if (index == 0) {
            this.keys = this.gameState.input.keyboard.addKeys({
                'SPACEBAR': Phaser.Keyboard.SPACEBAR,
                'W': Phaser.Keyboard.W, 'A': Phaser.Keyboard.A, 'S': Phaser.Keyboard.S, 'D': Phaser.Keyboard.D,
            });
        }
        else {
            this.keys = this.gameState.input.keyboard.addKeys({
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
        if (!this.gameState.start && (this.keys.SPACEBAR && this.keys.SPACEBAR.isDown)) {
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
                this.gameState.add.tween(this.sprite).to(p, 500, "Linear", true).onComplete.add(this.touchTile, this);
            }
        }
    };
    Player.prototype.touchTile = function () {
        this.setState(ActorState.canChangeDir);
    };
    return Player;
})(GameActor);
var MainState = (function (_super) {
    __extends(MainState, _super);
    function MainState(game) {
        _super.call(this);
        this.game = game;
        this.start = false;
    }
    MainState.prototype.gameResized = function () { };
    MainState.prototype.init = function () {
        this.input.maxPointers = 1;
        this.game.renderer.renderSession.roundPixels = true;
        this.world.setBounds(0, 0, 1280, 720);
        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.physics.arcade.gravity.y = 0;
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        this.scale.forceOrientation(false, true);
        this.scale.setResizeCallback(this.gameResized, this);
        this.scale.refresh();
    };
    MainState.prototype.preload = function () {
        this.load.image('background', 'assets/background.png');
        this.load.spritesheet('player_red', 'assets/player_red.png', 64, 64);
        this.load.spritesheet('player_blue', 'assets/player_blue.png', 64, 64);
        this.load.spritesheet('tile_red', 'assets/tile_red.png', 64, 64);
        this.load.spritesheet('tile_blue', 'assets/tile_blue.png', 64, 64);
        this.load.spritesheet('tile_blank', 'assets/tile_blank.png', 64, 64);
    };
    MainState.prototype.create = function () {
        this.add.sprite(0, 0, 'background');
        this.boxes = new GridBoxes(new Phaser.Point(16, 7), this);
        this.players = [];
        var p1 = this.boxes.getCoords(0, 3);
        this.players.push(new Player(this.add.sprite(p1.x, p1.y, 'player_red'), 0, this));
        var p2 = this.boxes.getCoords(15, 3);
        this.players.push(new Player(this.add.sprite(p2.x, p2.y, 'player_blue'), 1, this));
    };
    MainState.prototype.play = function () {
        this.start = true;
        for (var i = 0; i < this.players.length; ++i) {
            if (this.players[i].state === ActorState.idle) {
                if (i == 0)
                    this.players[i].setNewDir(new Phaser.Point(1, 0));
                else
                    this.players[i].setNewDir(new Phaser.Point(-1, 0));
                this.players[i].setState(ActorState.canChangeDir);
            }
        }
    };
    MainState.prototype.update = function () {
        this.players[0].update();
        this.players[1].update();
    };
    return MainState;
})(Phaser.State);
//# sourceMappingURL=MainState.js.map