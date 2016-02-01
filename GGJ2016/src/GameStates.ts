module TitoloGioco {
    export class Globals {
        // game derived from Phaser.Game
        static game: Game = null;

        // Start game
        static start: boolean = false;

        // game orientation
        static correctOrientation: boolean = false;
    }

    export class Game extends Phaser.Game {
        constructor() {
            var screenDims = Utils.ScreenUtils.calculateScreenMetrics(1280, 720, Utils.Orientation.LANDSCAPE);

            super(screenDims.gameWidth, screenDims.gameHeight, Phaser.AUTO, 'id_game',
                null /* , transparent, antialias, physicsConfig */);
            
            // states
            this.state.add('Gameloop', MainState);

            // start
            this.state.start('Gameloop');
        }
    }

    export class MainState extends Phaser.State {
        tiles: Phaser.Group;
        players: GameObjects.Player[];
        boxes: GameObjects.GridBoxes;

        constructor(public game: Phaser.Game) {
            super();
        }

        gameResized(): void {
            console.log("ciao");
            var screenDims = Utils.ScreenUtils.screenMetrics;
            this.scale.setUserScale(screenDims.scaleX, screenDims.scaleY);
        }

        init(): void {
            this.input.maxPointers = 1;
            this.stage.disableVisibilityChange = false;

            var screenDims = Utils.ScreenUtils.screenMetrics;

            if (this.game.device.desktop) {
                console.log("DESKTOP");
                this.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
                this.scale.setUserScale(screenDims.scaleX, screenDims.scaleY);
                this.scale.pageAlignHorizontally = true;
                this.scale.pageAlignVertically = true;
                this.scale.setResizeCallback(this.gameResized, this);
            }
            else {
                console.log("MOBILE");
                this.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
                this.scale.setUserScale(screenDims.scaleX, screenDims.scaleY);
                this.scale.pageAlignHorizontally = true;
                this.scale.pageAlignVertically = true;
                this.scale.forceOrientation(true, false);
            }

            console.log(screenDims);

            //this.game.renderer.renderSession.roundPixels = true
            //this.world.setBounds(0, 0, 1280, 720);
            //this.physics.startSystem(Phaser.Physics.ARCADE);
            //this.physics.arcade.gravity.y = 0;
            //this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            //this.scale.pageAlignHorizontally = true;
            //this.scale.pageAlignVertically = true;
            //this.scale.forceOrientation(false, true);
            //this.scale.setResizeCallback(this.gameResized, this);
            //this.scale.refresh();
        }

        preload(): void {
            // Graphics
            this.load.image('background', 'assets/background.png');
            this.load.image('tile_red', 'assets/tile_red.png'); 
            this.load.image('tile_blue', 'assets/tile_blue.png');
            this.load.image('tile_blank', 'assets/tile_blank.png');

            // Spritesheets
            //es: this.game.load.atlasXML("HERO_WALKING", "hero_walking.xml");
            this.load.spritesheet('player_red', 'assets/player_red.png', 64, 64);
            this.load.spritesheet('player_blue', 'assets/player_blue.png', 64, 64);

            // Audio
            //es: this.game.load.audio("song", ["song.mp3", "song.ogg", "song.wav"]);
        }

        create(): void {
            this.add.sprite(0, 0, 'background');

            this.boxes = new GameObjects.GridBoxes(new Phaser.Point(16, 7));

            this.players = [];
            var p1 = this.boxes.getCoords(0, 3);
            this.players.push(new GameObjects.Player(this.add.sprite(p1.x, p1.y, 'player_red'), 0, this));
            var p2 = this.boxes.getCoords(15, 3);
            this.players.push(new GameObjects.Player(this.add.sprite(p2.x, p2.y, 'player_blue'), 1, this));

        }

        play(): void {
            TitoloGioco.Globals.start = true;
            for (let i = 0; i < this.players.length; ++i) {
                if (this.players[i].isIdle()) {
                    if (i == 0)
                        this.players[i].setNewDir(new Phaser.Point(1, 0));
                    else
                        this.players[i].setNewDir(new Phaser.Point(-1, 0));
                    this.players[i].setState(GameObjects.ActorState.canChangeDir);
                }
            }
        }

        update(): void {
            this.players[0].update();
            this.players[1].update();
        }
    }
}
