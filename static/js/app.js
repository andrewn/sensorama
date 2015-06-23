var Ractive = require('ractive'),
    dragToDeleteEvent = require('./ractive/event/drag-to-delete'),
    dropEvent = require('./ractive/event/drop'),
    draggableDecorator = require('./ractive/decorator/draggable');

var socket = io();

var ractive = new Ractive({
  el: '#ui',
  template: '#ui-template',
  events: {
    'drag': dragToDeleteEvent,
    'drop': dropEvent
  },
  decorators: {
    'draggable': draggableDecorator
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

ractive.on('dropped', function (evt) {
  console.log('dropped', evt.content);
  var pin = evt.index.i,
      sound = evt.content,
      msg = { type: 'cap', action: 'add', value: pin, sound: sound };
  socket.emit('ui', msg);
});

function round(vals) {
  return vals.map ? vals.map(round) : Math.round(vals);
}

socket.on('sensor', function (msg) {
  // console.log('msg', msg);
  if (msg.type === 'rfid') {
    ractive.set(msg.type, msg);
  } else {
    ractive.animate(msg.type, msg);
  }
});