var Ractive = require('ractive'),
    dragToDeleteEvent = require('./ractive-drag-to-delete-event');

var socket = io();

var ractive = new Ractive({
  el: '#ui',
  template: '#ui-template',
  events: {
    'drag': dragToDeleteEvent
  },
  data: {
    round: round
  }
});

ractive.on('remove', function (evt) {
  var pin = evt.index.i,
      msg = { type: 'cap', action: 'remove', value: pin };
  socket.emit('ui', msg);
})

function round(vals) {
  return vals.map ? vals.map(round) : Math.round(vals);
}

socket.on('sensor', function (msg) {
  console.log('msg', msg);
  ractive.animate(msg.type, msg);
});