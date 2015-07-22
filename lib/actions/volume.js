module.exports = function (id, player, increment) {
  return {
    id  : id,
    name: 'Volume ' + (increment > 0 ? 'up' : 'down'),
    icon: 'volume-' + (increment > 0 ? 'up' : 'down'),
    type: 'command',
    exec: function () {
      player.volume({ diff: increment });
    }
  };
};
