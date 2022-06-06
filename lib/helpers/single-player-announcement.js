'use strict';
const logger = require('sonos-discovery/lib/helpers/logger');
const isRadioOrLineIn = require('../helpers/is-radio-or-line-in');
const backupPresets = {};

function singlePlayerAnnouncement(player, uri, volume, duration) {
  console.log("PLAYER", player);
  console.log("PLAYERS", JSON.stringify(player.system.players));
  console.log("ZONES", JSON.stringify(player.system.zones))
// Create backup preset to restore this player
  const state = player.state;
  const system = player.system;

  let groupToRejoin;

  const backupPreset = {
    players: [
      { roomName: player.roomName, volume: state.volume }
    ]
  };

  console.log("IS COOORDINATOR ?", player.coordinator.uuid == player.uuid)
  if (player.coordinator.uuid == player.uuid) {
    // This one is coordinator, you will need to rejoin
    // remember which group you were part of.
    const group = system.zones.find(zone => zone.coordinator.uuid === player.coordinator.uuid);
    if (group.members.length > 1) {
      logger.debug('Think its coordinator, will find uri later');
      groupToRejoin = group.id;
      backupPreset.group = group.id;
    } else {
      // was stand-alone, so keep state
      backupPreset.state = state.playbackState;
      backupPreset.uri = player.avTransportUri;
      backupPreset.metadata = player.avTransportUriMetadata;
      backupPreset.playMode = {
        repeat: state.playMode.repeat
      };

      if (!isRadioOrLineIn(backupPreset.uri)) {
        backupPreset.trackNo = state.trackNo;
        backupPreset.elapsedTime = state.elapsedTime;
      }

    }
  } else {
    // Was grouped, so we use the group uri here directly.
	console.log('On passe là..');
    backupPreset.uri = `x-rincon:${player.coordinator.uuid}`;
  }

// Use the preset action to play the tts file
  var ttsPreset = {
    players: [
      { roomName: player.roomName, volume }
    ],
    playMode: {
      repeat: false
    },
    uri
  };

  let abortTimer;

  if (!backupPresets[player.roomName]) {
    backupPresets[player.roomName] = [];
  }

  if (backupPresets[player.roomName].length === 0)
	backupPresets[player.roomName].unshift(backupPreset);
  else 
	backupPresets[player.roomName][0] = backupPreset;

  logger.debug('backup state was', JSON.stringify(backupPreset));
  logger.debug('backup presets array', backupPresets[player.roomName]);

  const prepareBackupPreset = () => {
	logger.debug('while preparing backup preset', JSON.stringify(backupPresets));
	
    if (backupPresets[player.roomName].length > 1) {
      backupPresets[player.roomName].shift();
      logger.debug('more than 1 backup presets during prepare', backupPresets[player.roomName]);
      return Promise.resolve();
    }

    if (backupPresets[player.roomName].length < 1) {
      return Promise.resolve();
    }

    const relevantBackupPreset = backupPresets[player.roomName][0];

    logger.debug('exactly 1 preset left', relevantBackupPreset);

    if (relevantBackupPreset.group) {
      const zone = system.zones.find(zone => zone.id === relevantBackupPreset.group);
      if (zone) {
        relevantBackupPreset.uri = `x-rincon:${zone.uuid}`;
      }
    }

    logger.debug('applying preset', relevantBackupPreset);
let testPreset = {   
    "coordinator": {     "uuid": "RINCON_5CAAFDCA6CAC01400",     "coordinator": "RINCON_5CAAFDCA6CAC01400",     "roomName": "SonosLaSalle",     "state": {       "volume": 1,       "mute": false,       "equalizer": { "bass": 0, "treble": 0, "loudness": true },       "currentTrack": {         "artist": "fwd/slash",         "title": "Schizoid",         "album": "Schizoid",         "albumArtUri": "/getaa?s=1&u=x-sonos-spotify%3aspotify%253atrack%253a07HtSPoKeSorfEE07ieSDU%3fsid%3d9%26flags%3d8232%26sn%3d3",         "duration": 183,         "uri": "x-sonos-spotify:spotify%3atrack%3a07HtSPoKeSorfEE07ieSDU?sid=9&flags=8232&sn=3",         "trackUri": "x-sonos-spotify:spotify%3atrack%3a07HtSPoKeSorfEE07ieSDU?sid=9&flags=8232&sn=3",         "type": "track",         "stationName": "",         "absoluteAlbumArtUri": "https://i.scdn.co/image/ab67706c0000bebb7580df9f5e1653de1ad6acee"       },       "nextTrack": {         "artist": "Alex Cruz",         "title": "Crazy",         "album": "Crazy",         "albumArtUri": "/getaa?s=1&u=x-sonos-spotify%3aspotify%253atrack%253a3dSufNX8zV2Dz6vmxcQW2w%3fsid%3d9%26flags%3d8232%26sn%3d3",         "duration": 232,         "uri": "x-sonos-spotify:spotify%3atrack%3a3dSufNX8zV2Dz6vmxcQW2w?sid=9&flags=8232&sn=3",         "trackUri": "x-sonos-spotify:spotify%3atrack%3a3dSufNX8zV2Dz6vmxcQW2w?sid=9&flags=8232&sn=3",         "absoluteAlbumArtUri": "http://192.168.1.46:1400/getaa?s=1&u=x-sonos-spotify%3aspotify%253atrack%253a3dSufNX8zV2Dz6vmxcQW2w%3fsid%3d9%26flags%3d8232%26sn%3d3"       },       "trackNo": 13,       "elapsedTime": 30,       "elapsedTimeFormatted": "00:00:30",       "playbackState": "PLAYING",       "playMode": { "repeat": "none", "shuffle": false, "crossfade": false }     },     "groupState": { "volume": 1, "mute": false },     "avTransportUri": "x-rincon-queue:RINCON_5CAAFDCA6CAC01400#0",     "avTransportUriMetadata": ""   },   "members": [    {       "uuid": "RINCON_5CAAFDCA6CAC01400",       "coordinator": "RINCON_5CAAFDCA6CAC01400",       "roomName": "SonosLaSalle",       "state": { "volume": 1, "mute": false, "equalizer": { "bass": 0, "treble": 0, "loudness": true }, "currentTrack": { "artist": "fwd/slash", "title": "Schizoid", "album": "Schizoid", "albumArtUri": "/getaa?s=1&u=x-sonos-spotify%3aspotify%253atrack%253a07HtSPoKeSorfEE07ieSDU%3fsid%3d9%26flags%3d8232%26sn%3d3", "duration": 183, "uri": "x-sonos-spotify:spotify%3atrack%3a07HtSPoKeSorfEE07ieSDU?sid=9&flags=8232&sn=3", "trackUri": "x-sonos-spotify:spotify%3atrack%3a07HtSPoKeSorfEE07ieSDU?sid=9&flags=8232&sn=3", "type": "track", "stationName": "", "absoluteAlbumArtUri": "https://i.scdn.co/image/ab67706c0000bebb7580df9f5e1653de1ad6acee" }, "nextTrack": { "artist": "Alex Cruz", "title": "Crazy", "album": "Crazy", "albumArtUri": "/getaa?s=1&u=x-sonos-spotify%3aspotify%253atrack%253a3dSufNX8zV2Dz6vmxcQW2w%3fsid%3d9%26flags%3d8232%26sn%3d3", "duration": 232, "uri": "x-sonos-spotify:spotify%3atrack%3a3dSufNX8zV2Dz6vmxcQW2w?sid=9&flags=8232&sn=3", "trackUri": "x-sonos-spotify:spotify%3atrack%3a3dSufNX8zV2Dz6vmxcQW2w?sid=9&flags=8232&sn=3", "absoluteAlbumArtUri": "http://192.168.1.46:1400/getaa?s=1&u=x-sonos-spotify%3aspotify%253atrack%253a3dSufNX8zV2Dz6vmxcQW2w%3fsid%3d9%26flags%3d8232%26sn%3d3" }, "trackNo": 13, "elapsedTime": 30, "elapsedTimeFormatted": "00:00:30", "playbackState": "PLAYING", "playMode": { "repeat": "none", "shuffle": false, "crossfade": false } },       "groupState": { "volume": 1, "mute": false },       "avTransportUri": "x-rincon-queue:RINCON_5CAAFDCA6CAC01400#0",       "avTransportUriMetadata": ""     },     {       "uuid": "RINCON_5CAAFDCABBFC01400",       "coordinator": "RINCON_5CAAFDCA6CAC01400",      "roomName": "SonosAccueil",       "state": { "volume": 1, "mute": false, "equalizer": { "bass": 0, "treble": 0, "loudness": true }, "currentTrack": { "artist": "fwd/slash", "title": "Schizoid", "album": "Schizoid", "albumArtUri": "/getaa?s=1&u=x-sonos-spotify%3aspotify%253atrack%253a07HtSPoKeSorfEE07ieSDU%3fsid%3d9%26flags%3d8232%26sn%3d3", "duration": 183, "uri": "x-sonos-spotify:spotify%3atrack%3a07HtSPoKeSorfEE07ieSDU?sid=9&flags=8232&sn=3", "trackUri": "x-sonos-spotify:spotify%3atrack%3a07HtSPoKeSorfEE07ieSDU?sid=9&flags=8232&sn=3", "type": "track", "stationName": "", "absoluteAlbumArtUri": "https://i.scdn.co/image/ab67706c0000bebb7580df9f5e1653de1ad6acee" }, "nextTrack": { "artist": "Alex Cruz", "title": "Crazy", "album": "Crazy", "albumArtUri": "/getaa?s=1&u=x-sonos-spotify%3aspotify%253atrack%253a3dSufNX8zV2Dz6vmxcQW2w%3fsid%3d9%26flags%3d8232%26sn%3d3", "duration": 232, "uri": "x-sonos-spotify:spotify%3atrack%3a3dSufNX8zV2Dz6vmxcQW2w?sid=9&flags=8232&sn=3", "trackUri": "x-sonos-spotify:spotify%3atrack%3a3dSufNX8zV2Dz6vmxcQW2w?sid=9&flags=8232&sn=3", "absoluteAlbumArtUri": "http://192.168.1.46:1400/getaa?s=1&u=x-sonos-spotify%3aspotify%253atrack%253a3dSufNX8zV2Dz6vmxcQW2w%3fsid%3d9%26flags%3d8232%26sn%3d3" }, "trackNo": 13, "elapsedTime": 30, "elapsedTimeFormatted": "00:00:30", "playbackState": "PLAYING", "playMode": { "repeat": "none", "shuffle": false, "crossfade": false } },       "groupState": { "volume": 1, "mute": false },       "avTransportUri": "x-rincon:RINCON_5CAAFDCA6CAC01400",       "avTransportUriMetadata": ""     }  ],   "uuid": "RINCON_5CAAFDCA6CAC01400",   "id": "RINCON_5CAAFDCABBFC01400:3316068240" 
  }

    return system.applyPreset(testPreset)
      .then(() => {
        backupPresets[player.roomName].shift();
        logger.debug('after backup preset applied', backupPresets[player.roomName]);
      });
  }

  let timer;
  const restoreTimeout = duration + 2000;
  return system.applyPreset(ttsPreset)
    .then(() => {
      return new Promise((resolve) => {
        const transportChange = (state) => {
          logger.debug(`Player changed to state ${state.playbackState}`);
          if (state.playbackState === 'STOPPED') {
            return resolve();
          }

          player.once('transport-state', transportChange);
        };
        setTimeout(() => {
          player.once('transport-state', transportChange);
        }, duration / 2);

        logger.debug(`Setting restore timer for ${restoreTimeout} ms`);
        timer = Date.now();
        abortTimer = setTimeout(resolve, restoreTimeout);
      });
    })
    .then(() => {
    const elapsed = Date.now() - timer;
    logger.debug(`${elapsed} elapsed with ${restoreTimeout - elapsed} to spare`);
      clearTimeout(abortTimer);
    })
    .then(prepareBackupPreset)
    .catch((err) => {
      logger.error(err);
      return prepareBackupPreset()
        .then(() => {
          throw err;
        });
    });
}

module.exports = singlePlayerAnnouncement;
