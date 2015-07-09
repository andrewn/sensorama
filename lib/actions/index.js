var _ = require('lodash'),
    debug = require('debug')('sensors:action');

module.exports = function (player) {
  //
  // Create an action for each sound in this array
  //
  var sounds = [ 'hello', 'mini', 'error', 'goodbye'],
      actions = {};

  _.forEach(sounds, function (s) {
    actions['sound-' + s] = function () {
      var soundfile = s + '.wav';
      debug('play action', soundfile)
      player
        .add({ playlist: soundfile, clear: true })
        .then(player.play);
    };
  });

  return actions;
}
