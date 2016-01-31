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
    };
    return Box;
})();
var GridBoxes = (function () {
    function GridBoxes(size, gameState) {
        this.gameState = gameState;
        this.initTiles = new Phaser.Point(128, 256);
        this.initPlayers = new Array();
        this.initPlayers.push(new Phaser.Point(163, 258));
        this.boxes = [];
        for (var i = 0; i < size.x; ++i) {
            this.boxes.push(new Array());
            for (var j = 0; j < size.y; ++j) {
                this.boxes[i].push(new Box(new Phaser.Point(this.initTiles.x + (i * 64), this.initTiles.y + (j * (64 - 12))), gameState));
            }
        }
    }
    /*touch(playerPos: Phaser.Point, index: number): Phaser.Point {
        var r = Math.ceil((playerPos.x - this.initPlayers[index].x) / 64);
        var c = Math.ceil((playerPos.y - this.initPlayers[index].y) / 52);
        let bp = this.boxes[r][c].pos;
        let pp = playerPos;
        if ((bp.x > playerPos.x - 5 && bp.x < playerPos.x + 5) && (bp.y > playerPos.y - 5 && bp.y < playerPos.y + 5)) {
            this.boxes[r][c].changeActor(ActorFlag.red);
            return bp;
        }
        return null;
    }*/
    GridBoxes.prototype.getNext = function (playerPos, dir, index) {
        var r = Math.ceil((playerPos.y - this.initPlayers[index].y) / 52);
        var c = Math.ceil((playerPos.x - this.initPlayers[index].x) / 64);
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
        console.log("r:" + r + ", c:" + c);
        return this.boxes[c][r].pos;
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
        this.speed = 100; // va da 0 a maxSpeed
        this.maxSpeed = 100;
        this.fireType = 0;
        this.walkDir = new Phaser.Point(0, 0);
        this.newDir = new Phaser.Point(0, 0);
        this.state = ActorState.idle;
        this.gameState.physics.arcade.enable(this.sprite);
        this.sprite.anchor.set(0.5);
    }
    GameActor.prototype.die = function () {
        // L'attore cadrà a terrà e non potrà più muoversi
    };
    GameActor.prototype.setState = function (state) {
        this.state = state;
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
    /*setSpeed(speed: number):void {
        if (speed >= 0 && speed <= this.maxSpeed) {
            this.speed = speed;
        }
    }

    footstep():void {
        if (this.state === ActorState.walk) {
            this.sprite.body.velocity.x = this.walkDir.x * this.speed;
            this.sprite.body.velocity.y = this.walkDir.y * this.speed;
        } else {
            this.sprite.body.velocity.x = this.sprite.body.velocity.y = 0;
        }
    }*/
    /*walk(): void {
        //this.footstep();
        this.playFrames();
    }*/
    GameActor.prototype.update = function () {
    };
    return GameActor;
})();
var Player = (function (_super) {
    __extends(Player, _super);
    function Player(sprite, gameState) {
        _super.call(this, sprite, gameState);
        this.gameState.physics.arcade.enable(this.sprite);
        this.sprite.animations.add('idleDef', [0, 1, 2, 3], 5, true);
        this.sprite.animations.add('walkRight', [10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 10, true);
        this.sprite.animations.add('walkLeft', [20, 21, 22, 23, 24, 25, 26, 27, 28, 29], 10, true);
        this.sprite.animations.add('walkDown', [30, 31, 32, 33, 34, 35, 36, 37, 38, 39], 10, true);
        this.sprite.animations.add('walkUp', [40, 41, 42, 43, 44, 45, 46, 47, 48, 49], 10, true);
        this.keys = this.gameState.input.keyboard.addKeys({
            'E': Phaser.Keyboard.E, 'Q': Phaser.Keyboard.Q, 'SPACEBAR': Phaser.Keyboard.SPACEBAR,
            'W': Phaser.Keyboard.W, 'A': Phaser.Keyboard.A, 'S': Phaser.Keyboard.S, 'D': Phaser.Keyboard.D,
            'left': Phaser.Keyboard.LEFT, 'right': Phaser.Keyboard.RIGHT, 'up': Phaser.Keyboard.UP, 'down': Phaser.Keyboard.DOWN
        });
        this.lastInputTime = this.gameState.game.time.time;
    }
    Player.prototype.getDirection = function () {
        // Check nuova direzione 
        var newDir = new Phaser.Point();
        if (this.keys.W.isDown || this.keys.up.isDown) {
            newDir.y = -1;
        }
        else if (this.keys.S.isDown || this.keys.down.isDown) {
            newDir.y = +1;
        }
        if (newDir.y == 0)
            if (this.keys.A.isDown || this.keys.left.isDown) {
                newDir.x = -1;
            }
            else if (this.keys.D.isDown || this.keys.right.isDown) {
                newDir.x = +1;
            }
        return newDir;
    };
    /*touchTiles(): boolean {
        let pos: Phaser.Point;
        pos = this.gameState.boxes.touch(new Phaser.Point(this.sprite.x, this.sprite.y), 0);
        console.log(pos);
        console.log("x:" + this.sprite.x+", y:"+this.sprite.y);
        if (pos) {
            this.sprite.x = pos.x;
            this.sprite.y = pos.y;
            return true;
        }
        return false;
    }*/
    Player.prototype.update = function () {
        // Debug: Input check
        if (this.gameState.game.time.time > this.lastInputTime + 100 && (this.keys.E.isDown || this.keys.Q.isDown)) {
            if (this.state !== ActorState.debug) {
                this.state = ActorState.debug;
                this.sprite.animations.stop(null, false);
            }
            var p;
            if (this.keys.E.isDown)
                this.sprite.frame = +this.sprite.frame + 1;
            if (this.keys.Q.isDown)
                this.sprite.frame = +this.sprite.frame - 1;
            this.lastInputTime = this.gameState.game.time.time;
        }
        // Debug: START GAME
        if (!this.gameState.start && this.keys.SPACEBAR.isDown) {
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
                var p = this.gameState.boxes.getNext(new Phaser.Point(this.sprite.x, this.sprite.y), this.walkDir, 0);
                this.gameState.add.tween(this.sprite).to(p, 500, "Linear", true).onComplete.add(this.touchTile, this);
            }
        }
        this.playFrames();
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
        this.load.spritesheet('player', 'assets/player_red.png', 64, 64);
        this.load.spritesheet('player', 'assets/player_blue.png', 64, 64);
        this.load.spritesheet('tile_red', 'assets/tile_red.png', 64, 64);
        this.load.spritesheet('tile_blue', 'assets/tile_blue.png', 64, 64);
        this.load.spritesheet('tile_blank', 'assets/tile_blank.png', 64, 64);
    };
    MainState.prototype.create = function () {
        //this.game.stage.backgroundColor = '#509F00';
        this.add.sprite(0, 0, 'background');
        this.boxes = new GridBoxes(new Phaser.Point(16, 7), this);
        this.player = new Player(this.add.sprite(163, 258, 'player'), this);
        this.frameText = this.add.text(20, 20, 'Player Frame: ' + this.player.sprite.frame, { fontSize: '16px', fill: '#000' });
    };
    MainState.prototype.play = function () {
        if (this.player.state === ActorState.idle) {
            this.player.setNewDir(new Phaser.Point(1, 0));
            this.player.setState(ActorState.canChangeDir);
        }
    };
    MainState.prototype.update = function () {
        this.player.update();
        this.frameText.text = 'Player Frame: ' + this.player.sprite.frame;
    };
    return MainState;
})(Phaser.State);
//# sourceMappingURL=MainState.js.map