var React = require('react'),
    _     = require('lodash');

var View = require('./view');

var rootNode = document.querySelector('#ui'),
    socket   = io(),
    data     = { actions: [], targets: [], assignments: {} };

//
// Render the react view
//
function renderWithData() {
  var unassignedActions = _.difference( data.actions, _.values(data.assignments) );
  React.render(<View {...data} actions={ unassignedActions } onTargetDrop={targetDropHandler} onActionRemove={actionRemoveHandler}/>, rootNode);
}

function targetDropHandler(evt) {
  console.log('Target dropped', evt);
  var msg = { name: 'associate', target: evt.target, action: evt.action };
  socket.emit('command', msg);
}

function actionRemoveHandler(action, target) {
  console.log('Delete target dropped', action, target);
  var msg = { name: 'dissociate', target: target, action: action };
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
