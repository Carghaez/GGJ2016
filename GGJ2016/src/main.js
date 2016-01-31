// ()=> è equivalente a function() con la particolarità di this  
window.onload = function () {
    var phaserGame = new Phaser.Game(1280, 720, Phaser.WEBGL, 'id_game');
    phaserGame.state.add('GameLoop', MainState);
    phaserGame.state.start('GameLoop');
};
//# sourceMappingURL=main.js.map