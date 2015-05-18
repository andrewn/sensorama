var debug = require('debug')('sensors'),
    _ = require('lodash');

var soundMap = {
  1: 'hello.wav',
  2: 'hello.wav',
  3: 'mini.wav',
  4: 'mini.wav',
  5: 'error.wav',
  6: 'error.wav',
  7: 'goodbye.wav',
  8: 'goodbye.wav'
};

var Router = function (player) {
  this.player = player;
  this.bindHandlers();
  this.pinSounds = _.clone(soundMap);
  this.availableSounds = _.uniq(_.values(soundMap));
};

Router.prototype.bindHandlers = function () {
  var self = this;
  this.player.on('player.state', function (state) {
    debug('player.state', state);
    if (state.new !== 'play') {
      self.currentPlaying = null;
    }
  });
};

Router.prototype.process = function (msg) {
  debug('Router, msg', msg);
  switch(msg.type) {
    case 'cap':
      this.processCap(msg);
      break;
  }
};

Router.prototype.processCap = function (msg) {
  var touches = _(msg.pins)
                    .map(indexForTruthyValue)
                    .compact()
                    .value();

  var touch = _.first(touches),
      sound = soundMap[touch],
      isCurrentlyPlaying = this.currentPlaying === sound;

  if (!isCurrentlyPlaying && sound) {
    this.player
      .add({ playlist: sound, clear: true })
      .then(this.player.play);

    this.currentPlaying = sound;
  }
};

function indexForTruthyValue(val, index) {
  return val === true ? index +  1 : null;
}

module.exports = Router;