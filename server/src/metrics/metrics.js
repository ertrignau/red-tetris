import client from "prom-client";

client.collectDefaultMetrics();

export const registry =
	client.register;

export const connectedSockets =
	new client.Gauge({
		name:
			"red_tetris_connected_sockets",
		help:
			"Current number of connected Socket.IO clients"
	});

export const activeRooms = 
	new client.Gauge({
		name:
			"red_tetris_active_rooms",
		help:
			"Current number of active rooms"
	})

export const gamesStarted = 
	new client.Counter({
		name:
			"red_tetris_games_started_total",
		help:
			"Total number of games stared"
	});

export const gamesFinished = 
	new client.Counter({
		name:
			"red_tetris_games_finished_total",
		help:
			"Total number of finished games"
	});

export const penaltiesSent =
	new client.Counter({
		name:
			"red_tetris_penalties_sent_total",
		help:
			"Total number of penalties sent in multiplayer matches"
	});

export const activeBots =
	new client.Gauge({
		name: 
			"red_tetris_active_bots",
		help:
			"Current number of active bots"
	});

export const gameDuration = 
	new client.Histogram({
		name:
			"red_tetris_game_duration_seconds",
		help:
			"Duration of completed games in seconds",
		buckets:
			[
				30,
				60,
				120,
				180,
				300,
				600
			]
	});