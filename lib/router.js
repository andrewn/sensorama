var debug = require('debug')('sensors:router'),
    _ = require('lodash');

var soundMap = {
  0: 'goodbye.wav',
  1: 'hello.wav',
  2: 'hello.wav',
  3: 'mini.wav',
  4: 'mini.wav',
  5: 'error.wav',
  6: 'error.wav',
  7: 'goodbye.wav'
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

Router.prototype.processSensor = function (msg) {
  debug('SENSOR: ', msg);
  switch(msg.type) {
    case 'cap':
      this.processCap(msg);
      break;
  }
};

Router.prototype.processUi = function (msg) {
  debug('UI: ', msg);
  switch(msg.type) {
    case 'cap':
      this.processCapUi(msg);
      break;
  }
};

Router.prototype.processCap = function (msg) {
  var touches = _(msg.pins)
                    .map(indexForTruthyValue)
                    .compact()
                    .value();

  var touch = _.first(touches),
      sound = this.pinSounds[touch],
      isCurrentlyPlaying = this.currentPlaying === sound;

  if (!isCurrentlyPlaying && sound) {
    this.player
      .add({ playlist: sound, clear: true })
      .then(this.player.play);

    this.currentPlaying = sound;
  }
};

Router.prototype.processCapUi = function (msg) {
  if (msg.action === 'remove') {
    this.pinSounds[msg.value] = null;
  } else if (msg.action === 'add' && _.indexOf(this.availableSounds, msg.sound) > -1 ) {
    this.pinSounds[msg.value] = msg.sound;
    console.log(msg.value, 'pinSounds assignment: ', this.pinSounds[msg.value])
  }
};

function indexForTruthyValue(val, index) {
  return val === true ? index : null;
}

module.exports = Router;