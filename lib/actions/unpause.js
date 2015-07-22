module.exports = function (id, player) {
  return {
    id  : id,
    name: 'Unpause',
    type: 'command',
    exec: function () {
      player.pause({ value: false });
    }
  };
};
