const GameMap = require('./gamemap.js');

module.exports = function(mapSize, tileSize, innerTileSize, trailTileSize) {
	this.speed = 0.25;
	this.players = [];
	this.gameMap = new GameMap(mapSize, tileSize, innerTileSize, trailTileSize);

	this.update = function() {
		if (this.players != null) {
			for (var i = 0; i < this.players.length; i++) {
				this.players[i].oldX = this.players[i].x;
				this.players[i].oldY = this.players[i].y;

				if (this.players[i].x % 1 === 0 && this.players[i].y % 1 === 0) { //when in sqaure
					this.players[i].dir = this.players[i].nextDir;
					if (this.gameMap.map[this.players[i].x][this.players[i].y].id != this.players[i].id) {
						this.gameMap.setCellData(this.players[i].x, this.players[i].y, this.players[i].id, this.players[i].color, "trail");
						this.players[i].trail.push(this.gameMap.map[this.players[i].x][this.players[i].y]);
					} else {
						if (this.gameMap.map[this.players[i].x][this.players[i].y].type == "land") {
							if (this.players[i].trail.length > 0) {
								for (var j = 0; j < this.players[i].trail.length; j++) {
									this.gameMap.setCellData(this.players[i].trail[j].x, this.players[i].trail[j].y, this.players[i].id, this.players[i].color, "land");
								}
								this.players[i].trail = [];
								this.gameMap.floodFill(this.players[i]);
							}
						}
					}
				}

				//x
				if (this.players[i].dir == "right") {
					this.players[i].x += this.speed;
				}
				if (this.players[i].dir == "left") {
					this.players[i].x -= this.speed;
				}

				//y
				if (this.players[i].dir == "up") {
					this.players[i].y -= this.speed;
				}
				if (this.players[i].dir == "down") {
					this.players[i].y += this.speed;
				}

				if (this.players[i].x < 0) {
					this.players[i].x = 0;
					this.players[i].dir = "stop";
				} else if (this.players[i].x > this.gameMap.mapSize - 1) {
					this.players[i].x = this.gameMap.mapSize - 1;
					this.players[i].dir = "stop";
				}

				if (this.players[i].y < 0) {
					this.players[i].y = 0;
					this.players[i].dir = "stop";
				} else if (this.players[i].y > this.gameMap.mapSize - 1) {
					this.players[i].y = this.gameMap.mapSize - 1;
					this.players[i].dir = "stop";
				}
			}
		}
	};


	this.changeDir = function(id, newDir) {
		var player = this.getPlayer(id);
		if (player == null)
			return;
		if (newDir == "up" && player.dir == "down")
			return;
		if (newDir == "down" && player.dir == "up")
			return;
		if (newDir == "left" && player.dir == "right")
			return;
		if (newDir == "right" && player.dir == "left")
			return;
		player.nextDir = newDir;
	};

	this.addPlayer = function(player) {
		this.gameMap.addPlayerLand(player);
		this.players.push(player);
	};

	this.removePlayer = function(id) {
		this.gameMap.clearPlayerLand(id);
		this.players.splice(this.players.indexOf(this.getPlayer(id)), 1);
	};

	this.getPlayer = function(id) {
		for (var i = 0; i < this.players.length; i++) {
			if (this.players[i].id == id) {
				return this.players[i];
			}
		}
	};
};