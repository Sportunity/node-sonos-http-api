module.exports = {
	apps: [{
		name: "sonos-server",
		script: "./server.js",
		env: {
			"NODE_LOG_LEVEL": "DEBUG"
		}
	}]
}
