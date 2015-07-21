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
      actions = {};

  return glob(audioGlob).then(function (files) {
    _.forEach(files, function (f) {
      var ext  = path.extname(f),
          base = path.basename(f),
          name = path.basename(f, ext);
      actions['sound-' + name] = function () {
        debug('play action', base)
        player
          .add({ playlist: base, clear: true })
          .then(player.play);
      };
    });

    debug('Actions created', actions);

    return actions;
  })
  .catch(function (err) { console.error('Error creating actions', err); });
}
