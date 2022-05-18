const musicMeta = require('music-metadata');

function fileDuration(path) {
  return musicMeta.parseFile(path, { duration: true })
      .then((info) => {
        return Math.ceil(info.format.duration * 1000);
      })
      .catch((err) => {
        console.error('error', err);
        return 10000
      })
}

module.exports = fileDuration;
