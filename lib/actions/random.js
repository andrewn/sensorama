var _ = require('lodash');

module.exports = function (id, player, actions) {
  return {
    id  : id,
    name: 'Play random',
    type: 'command',
    exec: function () {
      var sound = _.sample( _.find(actions, { type: 'sound' }) );
      player
        .add({ playlist: sound.file, clear: true })
        .then(player.play);
    }
  };
};
