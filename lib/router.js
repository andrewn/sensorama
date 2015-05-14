var _ = require('lodash');

var soundMap = {
  1: 'radiodan_fx_sine_01-hello.wav',
  2: 'radiodan_fx_sine_01-hello.wav',
  3: 'radiodan_fx_sine_02-miniwifi.wav',
  4: 'radiodan_fx_sine_02-miniwifi.wav',
  5: 'radiodan_fx_sine_03-error.wav',
  6: 'radiodan_fx_sine_03-error.wav',
  7: 'radiodan_fx_sine_04-goodbye.wav',
  8: 'radiodan_fx_sine_04-goodbye.wav'
};

var Router = function (player) {
  this.player = player;
  this.bindHandlers();
};

Router.prototype.bindHandlers = function () {
  var self = this;
  this.player.on('player.state', function (state) {
    console.log('player.state', state);
    if (state.new !== 'play') {
      self.currentPlaying = null;
    }
  });
};

Router.prototype.process = function (msg) {
  console.log('Router, msg', msg);
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