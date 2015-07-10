var React = require('react');

var View = require('./view');

var rootNode = document.querySelector('#ui'),
    socket   = io(),
    data     = { actions: [], targets: [] };

//
// Render the react view
//
function renderWithData() {
  console.log('renderWithData', data);
  React.render(<View {...data} />, rootNode);
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
