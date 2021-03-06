﻿module GameObjects {
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
        top: Box;
        right: Box;
        left: Box;
        bottom: Box;
        visited: boolean;
        prev: Box;

        constructor(pos: Phaser.Point) {
            this.pos = new Phaser.Point(pos.x + 35, pos.y + 2);
            this.spriteBlank = TitoloGioco.Globals.game.add.sprite(pos.x, pos.y, 'tile_blank');
            this.spriteBlue = TitoloGioco.Globals.game.add.sprite(pos.x, pos.y, 'tile_blue');
            this.spriteBlue.alpha = 0;
            this.spriteRed = TitoloGioco.Globals.game.add.sprite(pos.x, pos.y, 'tile_red');
            this.spriteRed.alpha = 0;
            this.flag = ActorFlag.blank;
        }

        changeActor(index: number): void {
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
        }
    }

    export class GridBoxes {
        boxes: Box[][];
        initTiles: Phaser.Point;
        initPlayers: Phaser.Point;

        constructor(size: Phaser.Point) {
            this.initTiles = new Phaser.Point(128, 256);
            this.initPlayers = new Phaser.Point(163, 258);

            this.boxes = [];
            for (let i = 0; i < size.x; ++i) {
                this.boxes.push(new Array<Box>());
                for (let j = 0; j < size.y; ++j) {
                    this.boxes[i].push(new Box(new Phaser.Point(this.initTiles.x + (i * 64), this.initTiles.y + (j * (64 - 12)))));
                }
            }

            for (let i = 0; i < size.x; ++i) {
                for (let j = 0; j < size.y; ++j) {
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

        checkClosedPath(r, c, index): void {
            var flagPlayer = (index == 0) ? ActorFlag.red : ActorFlag.blue;

            if (this.boxes[c][r].flag != flagPlayer) {
                this.boxes[c][r].changeActor(index);

                for (let y = 0; y < this.boxes.length; y++)
                    for (let x = 0; x < this.boxes[y].length; x++)
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
                            for (let i = 0; i < ciclo.length; ++i) {
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
        }

        getNext(playerPos: Phaser.Point, dir: Phaser.Point, index: number): Phaser.Point {
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
        }

        getCoords(x: number, y: number): Phaser.Point {
            return this.boxes[x][y].pos;
        }
    }

    export class ActorState {
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
        fireDir: Phaser.Point;
        state: ActorState;
        pos: Phaser.Point;
        keys: any;

        constructor(public sprite: Phaser.Sprite) {
            this.walkDir = new Phaser.Point(0, 0);
            this.newDir = new Phaser.Point(0, 0);
            this.sprite.anchor.set(0.5);
        }

        die(): void {
            // L'attore cadrà a terrà e non potrà più muoversi
        }

        setState(state: ActorState): void {
            this.state = state;
            this.playFrames();
        }

        playFrames(): void {
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
                } else {
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
        }

        setWalkDir(walkDir: Phaser.Point): void {
            this.walkDir = walkDir;
        }

        setNewDir(newDir: Phaser.Point): void {
            this.newDir = newDir;
        }

        update(): void {

        }

        isIdle(): boolean {
            return this.state === ActorState.idle;
        }
    }

    export class Player extends GameActor {
        keys: any;
        index: number;

        constructor(sprite: Phaser.Sprite, index: number, protected gameState: TitoloGioco.MainState) {
            super(sprite);
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
            } else {
                this.keys = TitoloGioco.Globals.game.input.keyboard.addKeys({
                    'left': Phaser.Keyboard.LEFT, 'right': Phaser.Keyboard.RIGHT, 'up': Phaser.Keyboard.UP, 'down': Phaser.Keyboard.DOWN
                });
            }

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
                    let p = this.gameState.boxes.getNext(new Phaser.Point(this.sprite.x, this.sprite.y), this.walkDir, this.index);
                    this.gameState.add.tween(this.sprite).to(p, 300, "Linear", true).onComplete.add(this.touchTile, this);
                }
            }
        }

        touchTile(): void {
            this.setState(ActorState.canChangeDir);
        }
    }
}