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

//
// When action is dragged away from
// a target
//
ractive.on('remove', function (evt) {
  var target = evt.context.id,
      msg = { name: 'dissociate', target: target };
  socket.emit('command', msg);
});

//
// When action dropped onto a target
//
ractive.on('dropped', function (evt) {
  var target = evt.context.id,
      action = evt.content,
      msg = { name: 'associate', target: target, action: action };
  socket.emit('command', msg);
});

function round(vals) {
  return vals.map ? vals.map(round) : Math.round(vals);
}

//
// Proxy incoming messages from socket to ractive
//
['actions', 'targets', 'assignments'].forEach(function (name) {
  socket.on(name, function (msg) {
    ractive.set(name, msg);
  });
});
