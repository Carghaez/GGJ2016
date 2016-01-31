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
    sprite: Phaser.Sprite;
    gameState: MainState;

    constructor(sprite: Phaser.Sprite, gameState: MainState) {
        this.sprite = sprite;
        this.gameState = gameState;
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
    static cast = new ActorState("cast");
    static die = new ActorState("die");
    static debug = new ActorState("debug");
}
// Sample usage: var first: ActorState = ActorState.idle;

class GameActor {
    // grazie a public/private/protected
    health: number;
    walkDir: Phaser.Point; // X e Y Valori: -1, 0, +1
    newDir: Phaser.Point; // X e Y Valori: -1, 0, +1
    speed: number = 0; // va da 0 a maxSpeed
    maxSpeed: number = 100;
    fireType: number = 0;
    fireDir: Phaser.Point; // X e Y valori compresi tra -1 e +1
    state: ActorState;
    pos: Phaser.Point;
    keys: any;

    constructor(public sprite: Phaser.Sprite, protected gameState: MainState) {
        this.walkDir = new Phaser.Point(0, 0);
        this.newDir = new Phaser.Point(0, 0);
        this.state = ActorState.idle;
        this.gameState.physics.arcade.enable(this.sprite);
        this.sprite.anchor.set(0.5);
    }

    die():void {
        // L'attore cadrà a terrà e non potrà più muoversi
    }

    setState(state: ActorState):void {
        this.state = state;
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
        this.sprite.play(this.state.toString()+facing);
    }

    setWalkDir(walkDir: Phaser.Point):void {
        this.walkDir = walkDir;
    }

    setNewDir(newDir: Phaser.Point): void {
        this.newDir = newDir;
    }

    setSpeed(speed: number):void {
        if (speed >= 0 && speed <= this.maxSpeed) {
            this.speed = speed;
        }
    }

    footstep():void {
        if (this.state === ActorState.walk) {
            this.sprite.body.velocity.x = this.walkDir.x * this.speed;
            this.sprite.body.velocity.y = this.walkDir.y * this.speed;
        }
    }

    walk(): void {
        this.footstep();
        this.playFrames();
    }

    update(): void {

    }
}

class Player extends GameActor {
    keys: any;
    // Debug info
    lastInputTime: any;

    constructor(sprite: Phaser.Sprite, gameState: MainState) {
        super(sprite, gameState);
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

    update(): void {
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
            } else {
                // dobbiamo metterlo in idle appena tocca la nuova tile
            }
            this.walk();
        }
    }
}

class MainState extends Phaser.State {
    tiles: Phaser.Group;
    player: GameActor;
    // Debug info
    frameText: Phaser.Text;

	constructor(public game: Phaser.Game) {
		super();
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
        this.load.spritesheet('player', 'assets/player_red.png', 64, 64);
        this.load.spritesheet('player', 'assets/player_blue.png', 64, 64);
        this.load.spritesheet('tile_red', 'assets/tile_red.png', 64, 64);
        this.load.spritesheet('tile_blue', 'assets/tile_blue.png', 64, 64);
        this.load.spritesheet('tile_base', 'assets/tile_blank.png', 64, 64);
	}

	create(): void {
        //this.game.stage.backgroundColor = '#509F00';
        this.add.sprite(0, 0, 'background');

        this.player = new Player(this.add.sprite(150, 250, 'player'), this);
        this.frameText = this.add.text(20, 20, 'Player Frame: ' + this.player.sprite.frame, { fontSize: '16px', fill: '#000' });

    }


    update(): void {   
        this.player.update();
        this.frameText.text = 'Player Frame: ' + this.player.sprite.frame;
    }
}		