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
    function Box(sprite, gameState) {
        this.sprite = sprite;
        this.gameState = gameState;
    }
    return Box;
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
        this.speed = 0; // va da 0 a maxSpeed
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
        this.sprite.play(this.state.toString() + facing);
    };
    GameActor.prototype.setWalkDir = function (walkDir) {
        this.walkDir = walkDir;
    };
    GameActor.prototype.setNewDir = function (newDir) {
        this.newDir = newDir;
    };
    GameActor.prototype.setSpeed = function (speed) {
        if (speed >= 0 && speed <= this.maxSpeed) {
            this.speed = speed;
        }
    };
    GameActor.prototype.footstep = function () {
        if (this.state === ActorState.walk) {
            this.sprite.body.velocity.x = this.walkDir.x * this.speed;
            this.sprite.body.velocity.y = this.walkDir.y * this.speed;
        }
    };
    GameActor.prototype.walk = function () {
        this.footstep();
        this.playFrames();
    };
    GameActor.prototype.update = function () {
    };
    return GameActor;
})();
var Player = (function (_super) {
    __extends(Player, _super);
    function Player(sprite, gameState) {
        _super.call(this, sprite, gameState);
        this.gameState.physics.arcade.enable(this.sprite);
        this.sprite.animations.add('idleDef', [0, 1, 2, 3], 4, true);
        //this.sprite.animations.add('idleDef', [4, 5, 6, 7, 8, 9, 10, 11, 22, 13], 6, true);
        this.keys = this.gameState.input.keyboard.addKeys({
            'E': Phaser.Keyboard.E, 'Q': Phaser.Keyboard.Q,
            'W': Phaser.Keyboard.W, 'A': Phaser.Keyboard.A, 'S': Phaser.Keyboard.S, 'D': Phaser.Keyboard.D,
            'left': Phaser.Keyboard.LEFT, 'right': Phaser.Keyboard.RIGHT, 'up': Phaser.Keyboard.UP, 'down': Phaser.Keyboard.DOWN
        });
        this.lastInputTime = this.gameState.game.time.time;
    }
    Player.prototype.update = function () {
        // Debug: Input check
        if (this.gameState.game.time.time > this.lastInputTime + 100 && (this.keys.E.isDown || this.keys.Q.isDown)) {
            if (this.state !== ActorState.debug) {
                this.state = ActorState.debug;
                this.sprite.animations.stop(null, false);
            }
            if (this.keys.E.isDown)
                this.sprite.frame = +this.sprite.frame + 1;
            else
                this.sprite.frame = +this.sprite.frame - 1;
            this.lastInputTime = this.gameState.game.time.time;
        }
        // Controllo se il personaggio è ancora vivo
        if (this.state !== ActorState.die && this.state !== ActorState.debug) {
            // Check nuova direzione 
            var newDir = new Phaser.Point();
            if (this.keys.W.isDown) {
                newDir.y = -1;
            }
            else if (this.keys.S.isDown) {
                newDir.y = +1;
            }
            if (this.keys.A.isDown) {
                newDir.x = -1;
            }
            else if (this.keys.D.isDown) {
                newDir.x = +1;
            }
            // Se ha scelto una nuova direzione la cambio
            if (newDir.x !== 0 || newDir.y !== 0) {
                this.setNewDir(newDir);
            }
            if (this.state === ActorState.idle) {
                this.setState(ActorState.walk);
                this.setWalkDir(this.newDir);
            }
            else {
            }
            this.walk();
        }
    };
    return Player;
})(GameActor);
var MainState = (function (_super) {
    __extends(MainState, _super);
    function MainState(game) {
        _super.call(this);
        this.game = game;
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
        this.load.spritesheet('tile_base', 'assets/tile_blank.png', 64, 64);
    };
    MainState.prototype.create = function () {
        //this.game.stage.backgroundColor = '#509F00';
        this.add.sprite(0, 0, 'background');
        this.player = new Player(this.add.sprite(150, 250, 'player'), this);
        this.frameText = this.add.text(20, 20, 'Player Frame: ' + this.player.sprite.frame, { fontSize: '16px', fill: '#000' });
    };
    MainState.prototype.update = function () {
        this.player.update();
        this.frameText.text = 'Player Frame: ' + this.player.sprite.frame;
    };
    return MainState;
})(Phaser.State);
//# sourceMappingURL=MainState.js.map