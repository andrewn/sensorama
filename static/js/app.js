var Ractive = require('ractive');

var socket = io();

var ractive = new Ractive({
  el: '#ui',
  template: '#ui-template',
  data: {
    round: round
  }
});

function round(vals) {
  return vals.map ? vals.map(round) : Math.round(vals);
}

socket.on('sensor', function (msg) {
  console.log('msg', msg);
  ractive.animate(msg.type, msg);
});