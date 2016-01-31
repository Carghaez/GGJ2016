// ()=> è equivalente a function() con la particolarità di this  
window.onload = function() {
	var phaserGame: Phaser.Game = new Phaser.Game(1280, 720, Phaser.AUTO, 'id_game');
	phaserGame.state.add('GameLoop', MainState);
	phaserGame.state.start('GameLoop');
};