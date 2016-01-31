class ActorFlag {
    // boilerplate
    constructor(public value: string) {
    }

    toString() {
        return this.value;
    }

    // values 
    static blank = new ActorFlag("blank");
    static red = new ActorFlag("red");
    static blue = new ActorFlag("blue");
}

class Box {
    pos: Phaser.Point;
    flag: ActorFlag;
    spriteBlank: Phaser.Sprite;
    spriteRed: Phaser.Sprite;
    spriteBlue: Phaser.Sprite;

    constructor(pos: Phaser.Point, protected gameState: MainState) {
        this.gameState = gameState;
        this.pos = new Phaser.Point(pos.x + 35, pos.y + 2);
        this.spriteBlank = this.gameState.add.sprite(pos.x, pos.y, 'tile_blank');
        this.spriteBlue = this.gameState.add.sprite(pos.x, pos.y, 'tile_blue');
        this.spriteBlue.alpha = 0;
        this.spriteRed = this.gameState.add.sprite(pos.x, pos.y, 'tile_red');
        this.spriteRed.alpha = 0;
        this.flag = ActorFlag.blank;
    }

    changeActor(index: number): void {
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
    }
}

class GridBoxes {
    boxes: Box[][];
    initTiles: Phaser.Point;
    initPlayers: Phaser.Point;

    constructor(size: Phaser.Point, protected gameState: MainState) {
        this.initTiles = new Phaser.Point(128, 256);
        this.initPlayers = new Phaser.Point(163, 258);
        
        this.boxes = [];
        for (let i = 0; i < size.x; ++i) {
            this.boxes.push(new Array<Box>());
            for (let j = 0; j < size.y; ++j) {
                this.boxes[i].push(new Box(new Phaser.Point(this.initTiles.x + (i * 64), this.initTiles.y + (j * (64 - 12))), gameState));
            }
        }
    }
    getNext(playerPos: Phaser.Point, dir: Phaser.Point, index: number): Phaser.Point {
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
    }

    getCoords(x:number, y:number): Phaser.Point {
        return this.boxes[x][y].pos;
    }
}

class ActorState {
    // boilerplate 
    constructor(public value: string) {
    }

    toString() {
        return this.value;
    }

    // values 
    static idle = new ActorState("idle");
    static walk = new ActorState("walk");
    static canChangeDir = new ActorState("canChangeDir");
    static cast = new ActorState("cast");
    static die = new ActorState("die");
    static debug = new ActorState("debug");
}
// Sample usage: var first: ActorState = ActorState.idle;

class GameActor {
    health: number;
    walkDir: Phaser.Point; 
    newDir: Phaser.Point; 
    fireType: number = 0;
    fireDir: Phaser.Point; // X e Y valori compresi tra -1 e +1
    state: ActorState;
    pos: Phaser.Point;
    keys: any;

    constructor(public sprite: Phaser.Sprite, protected gameState: MainState) {
        this.walkDir = new Phaser.Point(0, 0);
        this.newDir = new Phaser.Point(0, 0);
        this.gameState.physics.arcade.enable(this.sprite);
        this.sprite.anchor.set(0.5);
    }

    die():void {
        // L'attore cadrà a terrà e non potrà più muoversi
    }

    setState(state: ActorState): void {
        this.state = state;
        this.playFrames();
    }

    playFrames():void {
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
            }else{
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
        this.sprite.play(this.state.toString()+facing);
    }

    setWalkDir(walkDir: Phaser.Point):void {
        this.walkDir = walkDir;
    }

    setNewDir(newDir: Phaser.Point): void {
        this.newDir = newDir;
    }

    update(): void {

    }
}

class Player extends GameActor {
    keys: any;
    index: number;
    // Debug info
    lastInputTime: any;

    constructor(sprite: Phaser.Sprite, index:number, gameState: MainState) {
        super(sprite, gameState);
        this.gameState.physics.arcade.enable(this.sprite);
        this.index = index;
  
        this.sprite.animations.add('idleDef', [0, 1, 2, 3], 5, true);

        this.sprite.animations.add('walkRight', [10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 10, true);
        this.sprite.animations.add('walkLeft', [20, 21, 22, 23, 24, 25, 26, 27, 28, 29], 10, true);
        this.sprite.animations.add('walkDown', [30, 31, 32, 33, 34, 35, 36, 37, 38, 39], 10, true);
        this.sprite.animations.add('walkUp', [40, 41, 42, 43, 44, 45, 46, 47, 48, 49], 10, true);

        if (index == 0) {
            this.keys = this.gameState.input.keyboard.addKeys({
                'E': Phaser.Keyboard.E, 'Q': Phaser.Keyboard.Q, 'SPACEBAR': Phaser.Keyboard.SPACEBAR,
                'W': Phaser.Keyboard.W, 'A': Phaser.Keyboard.A, 'S': Phaser.Keyboard.S, 'D': Phaser.Keyboard.D,
            });
        } else {
            this.keys = this.gameState.input.keyboard.addKeys({
                'left': Phaser.Keyboard.LEFT, 'right': Phaser.Keyboard.RIGHT, 'up': Phaser.Keyboard.UP, 'down': Phaser.Keyboard.DOWN
            });
        }
   
        this.lastInputTime = this.gameState.game.time.time;
        this.setState(ActorState.idle);
    }

    getDirection(): Phaser.Point {
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
    }

    update(): void {
        // Debug: Input check
         /*if (this.gameState.game.time.time > this.lastInputTime + 100 && (this.keys.E.isDown || this.keys.Q.isDown)) {

            if (this.state !== ActorState.debug) {
                this.setState(ActorState.debug);
                this.sprite.animations.stop(null, false);
            }

           if (this.keys.E.isDown)
                this.sprite.frame = +this.sprite.frame + 1;
            if (this.keys.Q.isDown)
                this.sprite.frame = +this.sprite.frame - 1;
            this.lastInputTime = this.gameState.game.time.time;

        }*/
        
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
                let p = this.gameState.boxes.getNext(new Phaser.Point(this.sprite.x, this.sprite.y), this.walkDir, this.index);
                this.gameState.add.tween(this.sprite).to(p, 500, "Linear", true).onComplete.add(this.touchTile, this);
            }
        }
       // this.playFrames();
    }

    touchTile(): void {
        this.setState(ActorState.canChangeDir);
    }
}

class MainState extends Phaser.State {
    tiles: Phaser.Group;
    players: GameActor[];
    start: boolean; 
    boxes: GridBoxes;
    // Debug info
    frameText: Phaser.Text;

	constructor(public game: Phaser.Game) {
        super();
        this.start = false;
    }

	gameResized(): void { }
	init(): void {
		this.input.maxPointers = 1;
		this.game.renderer.renderSession.roundPixels = true
		this.world.setBounds(0, 0, 1280, 720);
		this.physics.startSystem(Phaser.Physics.ARCADE);
		this.physics.arcade.gravity.y = 0;
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVertically = true;
		this.scale.forceOrientation(false, true);
		this.scale.setResizeCallback(this.gameResized, this);
        this.scale.refresh();
    }

    preload(): void {
        this.load.image('background', 'assets/background.png');
        this.load.spritesheet('player_red', 'assets/player_red.png', 64, 64);
        this.load.spritesheet('player_blue', 'assets/player_blue.png', 64, 64);
        this.load.spritesheet('tile_red', 'assets/tile_red.png', 64, 64);
        this.load.spritesheet('tile_blue', 'assets/tile_blue.png', 64, 64);
        this.load.spritesheet('tile_blank', 'assets/tile_blank.png', 64, 64);
	}

	create(): void {
        this.add.sprite(0, 0, 'background');

        this.boxes = new GridBoxes(new Phaser.Point(16, 7), this);

        this.players = [];
        var p1 = this.boxes.getCoords(0, 3);
        this.players.push(new Player(this.add.sprite(p1.x, p1.y, 'player_red'), 0, this));
        var p2 = this.boxes.getCoords(15, 3);
        this.players.push(new Player(this.add.sprite(p2.x, p2.y, 'player_blue'), 1, this));

       // this.frameText = this.add.text(20, 20, 'Player Frame: ' + this.player.sprite.frame, { fontSize: '16px', fill: '#000' });
    }

    play(): void {
        this.start = true;
        for (let i = 0; i < this.players.length ; ++i) {
            if (this.players[i].state === ActorState.idle) {
                if(i == 0)
                    this.players[i].setNewDir(new Phaser.Point(1, 0));
                else
                    this.players[i].setNewDir(new Phaser.Point(-1, 0));
                this.players[i].setState(ActorState.canChangeDir);
            }
        }
    }

    update(): void {
        this.players[0].update();
        this.players[1].update();
        //this.frameText.text = 'Player Frame: ' + this.player.sprite.frame;
    }
}		