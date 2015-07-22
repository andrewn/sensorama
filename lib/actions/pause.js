var _ = require('lodash');

module.exports = function (id, player) {
  return {
    id  : id,
    name: 'Pause/Play',
    type: 'command',
    icon: 'play',
    exec: function () {
      player
        .status()
        .then(function (o) {
          var state = _.get(o, 'response.player.state'),
              pause = (state === 'play') ? true : false;
          player.pause({ value: pause });
        }, function (err) { console.error('player.status() failed', err); })
        .catch(function (err) { console.error('pause failed', err); });
    }
  };
};
