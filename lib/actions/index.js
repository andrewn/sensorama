var _ = require('lodash'),
    path = require('path'),
    Q = require('q'),
    glob = Q.denodeify(require('glob')),
    debug = require('debug')('sensors:action');

module.exports = function (player) {
  //
  // Create an action for each sound in this array
  //
  var audioPath = path.join(__filename, '..', '..', '..', 'audio'),
      audioGlob = path.join(audioPath, '*.@(wav|mp3)'),
      actions = {
        'action-pause'      : require('./pause')('action-pause', player),
        'action-volume-down': require('./volume')('action-volume-down', player, -20),
        'action-volume-up'  : require('./volume')('action-volume-up', player, 20),
        'action-seek-fwd'  : require('./seek')('action-seek-fwd', player, 30),
        'action-seek-bck'  : require('./seek')('action-seek-bck', player, -30)
      };

  // Special random command
  actions['action-play-random'] = require('./random')('action-play-random', player, actions);

  return glob(audioGlob).then(function (files) {
    _.forEach(files, function (f) {
      var ext  = path.extname(f),
          base = path.basename(f),
          name = path.basename(f, ext),
          id  = 'sound-' + name,
          func = function () {
            debug('play action', base);
            player
              .add({ playlist: base, clear: true })
              .then(player.play);
          };

          actions[id] = {
            id   : id,
            type : 'sound',
            exec : func,
            name : name,
            file : base,
            image: '/img/' + name + '.svg'
          };
    });

    debug('Actions created', actions);

    return actions;
  })
  .catch(function (err) { console.error('Error creating actions', err); });
}
