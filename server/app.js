const PORT = 27015;
const express = require('express');
const uuid = require('uuid/v4');
const Player = require('./player.js');
const GameMap = require('./gamemap.js');
const GameServer = require('./gameserver.js');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var gameMap = new GameMap(50, 40, 30);
var gameServer = new GameServer(gameMap);

app.use(express.static('../client/'));
http.listen(PORT, function() {
	console.log('socket.io:: Listening on port ' + PORT);
});

io.on('connection', function(client) { //when socket gets connection
	client.on('gameConnect', function(properties) { //when game sends gameConnect
		var tempID = uuid();
		gameServer.addPlayer(new Player(properties.name, properties.color, tempID));
		var tempPlayer = gameServer.getPlayer(tempID);
		client.GAMEID = tempID;

		client.emit('gameConnected', { //give client it's properties
			id: client.GAMEID,
			name: properties.name,
			color: properties.color,
			x: tempPlayer.x,
			y: tempPlayer.y,
			map: gameMap.map,
			mapSize: gameMap.mapSize,
			tileSize: gameMap.tileSize,
			innerTileSize: gameMap.innerTileSize
		});

		for (i = 0; i < gameServer.players.length; i++) {
			io.emit("playerAdded", {
				id: gameServer.players[i].id,
				name: gameServer.players[i].name,
				color: gameServer.players[i].color,
				x: gameServer.players[i].x,
				y: gameServer.players[i].y,
			}); //tell all that new players
		}

		console.log('socket.io:: client ' + gameServer.getPlayer(client.GAMEID).name + " (" + client.GAMEID + ') connected');
	});

	client.on('updateDir', function(response) {
		gameServer.changeDir(response.GAMEID, response.newDir);
	});

	client.on('disconnect', function() {
		if (gameServer.getPlayer(client.GAMEID) != null) {
			console.log('socket.io:: client ' + gameServer.getPlayer(client.GAMEID).name + " (" + client.GAMEID + ') disconnected');
			io.emit("playerRemoved", client.GAMEID);
		} else {
			console.log('socket.io:: client ' + client.id + ' disconnected');
		}
		gameServer.removePlayer(client.GAMEID);
	});
});

function update() {
	if (gameServer.players.length > 0) {
		gameServer.update();
		for (i = 0; i < gameServer.players.length; i++) {
			if (gameServer.players[i].oldX != gameServer.players[i].x || gameServer.players[i].oldY != gameServer.players[i].y) {
				io.emit("updatePlayer", {
					id: gameServer.players[i].id,
					x: gameServer.players[i].x,
					y: gameServer.players[i].y,
				});
			}
		}
		if (gameMap.updateTiles.length > 0) {
			io.emit("updateTiles", gameMap.updateTiles);
		}
	}
}
setInterval(update, 1000 / 30);
