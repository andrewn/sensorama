module.exports = function (id, player) {
  return {
    id  : id,
    name: 'Pause',
    type: 'command',
    exec: function () {
      player.pause({ value: true });
    }
  };
};
