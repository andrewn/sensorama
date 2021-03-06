module.exports = function (id, player, increment) {
  var diff = increment > 0 ? '+' + increment : increment.toString();
  return {
    id  : id,
    name: 'Seek ' + (increment > 0 ? 'forward' : 'back'),
    icon: (increment > 0 ? 'fast-forward' : 'fast-backward'),
    type: 'command',
    exec: function () {
      player.seek({ time: diff });
    }
  };
};
