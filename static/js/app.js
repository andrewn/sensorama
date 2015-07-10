var React = require('react');

var View = require('./view');

var rootNode = document.querySelector('#ui'),
    socket   = io(),
    data     = { actions: [], targets: [] };

//
// Render the react view
//
function renderWithData() {
  React.render(<View {...data} onTargetDrop={targetDropHandler}/>, rootNode);
}

function targetDropHandler(evt) {
  console.log('Target dropped', evt);
  var msg = { name: 'associate', target: evt.target, action: evt.action };
  socket.emit('command', msg);
}

//
// When incoming messages arrive, update the app
// state and re-render the view
//
['actions', 'targets', 'assignments'].forEach(function (name) {
  socket.on(name, function (msg) {
    data[name] = msg;
    renderWithData();
  });
});
