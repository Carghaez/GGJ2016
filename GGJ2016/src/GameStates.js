var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TitoloGioco;
(function (TitoloGioco) {
    var Globals = (function () {
        function Globals() {
        }
        // game derived from Phaser.Game
        Globals.game = null;
        // Start game
        Globals.start = false;
        // game orientation
        Globals.correctOrientation = false;
        return Globals;
    })();
    TitoloGioco.Globals = Globals;
    var Game = (function (_super) {
        __extends(Game, _super);
        function Game() {
            var screenDims = Utils.ScreenUtils.calculateScreenMetrics(1280, 720, Utils.Orientation.LANDSCAPE);
            _super.call(this, screenDims.gameWidth, screenDims.gameHeight, Phaser.AUTO, 'id_game', null /* , transparent, antialias, physicsConfig */);
            // states
            this.state.add('Gameloop', MainState);
            // start
            this.state.start('Gameloop');
        }
        return Game;
    })(Phaser.Game);
    TitoloGioco.Game = Game;
    var MainState = (function (_super) {
        __extends(MainState, _super);
        function MainState(game) {
            _super.call(this);
            this.game = game;
        }
        MainState.prototype.init = function () {
            this.input.maxPointers = 1;
            this.stage.disableVisibilityChange = false;
            var screenDims = Utils.ScreenUtils.screenMetrics;
            if (this.game.device.desktop) {
                console.log("DESKTOP");
                this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
                this.scale.setUserScale(screenDims.scaleX, screenDims.scaleY);
                this.scale.pageAlignHorizontally = true;
                this.scale.pageAlignVertically = true;
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
        };
        MainState.prototype.preload = function () {
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
        };
        MainState.prototype.create = function () {
            this.add.sprite(0, 0, 'background');
            this.boxes = new GameObjects.GridBoxes(new Phaser.Point(16, 7));
            this.players = [];
            var p1 = this.boxes.getCoords(0, 3);
            this.players.push(new GameObjects.Player(this.add.sprite(p1.x, p1.y, 'player_red'), 0, this));
            var p2 = this.boxes.getCoords(15, 3);
            this.players.push(new GameObjects.Player(this.add.sprite(p2.x, p2.y, 'player_blue'), 1, this));
        };
        MainState.prototype.play = function () {
            TitoloGioco.Globals.start = true;
            for (var i = 0; i < this.players.length; ++i) {
                if (this.players[i].isIdle()) {
                    if (i == 0)
                        this.players[i].setNewDir(new Phaser.Point(1, 0));
                    else
                        this.players[i].setNewDir(new Phaser.Point(-1, 0));
                    this.players[i].setState(GameObjects.ActorState.canChangeDir);
                }
            }
        };
        MainState.prototype.update = function () {
            this.players[0].update();
            this.players[1].update();
        };
        return MainState;
    })(Phaser.State);
    TitoloGioco.MainState = MainState;
})(TitoloGioco || (TitoloGioco = {}));
//# sourceMappingURL=GameStates.js.map