var React = require('react'),
    _     = require('lodash');

var View = require('./react/view');

var rootNode = document.querySelector('#ui'),
    socket   = io(),
    data     = { actions: [], targets: [], assignments: {} };

window.data = data;

function assignmentObjectsById(actions, assignments) {
  var obj = {};
  _.forEach(assignments, function (value, key) {
    obj[key] = _.find(actions, { id: value });
  });
  return obj;
}

function unassignedActions(actions, assignments) {
  var assignmentIds = _.values(assignments),
      unassignedActions = _.reject(actions, function (a) { return _.includes(assignmentIds, a.id); });
  return unassignedActions;
}

//
// Render the react view
//
function renderWithData() {
  React.render(
    <View
      assignments={ assignmentObjectsById(data.actions, data.assignments) }
      targets={ data.targets }
      actions={ unassignedActions(data.actions, data.assignments) }
      onTargetDrop={targetDropHandler}
      onActionRemove={actionRemoveHandler}
      onResetRequest={resetButtonHandler}
      onClearAssignmentsRequest={clearAssignmentsButtonHandler}
      />,
    rootNode);
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

function resetButtonHandler() {
  console.log('Reset requested');
  var msg = { name: 'reset' };
  socket.emit('command', msg);
}

function clearAssignmentsButtonHandler() {
  console.log('Clear assignments');
  _.forEach(data.assignments, function (action, target) {
    socket.emit('command', { name: 'dissociate', target: target, action: action });
  });
}

//
// When incoming messages arrive, update the app
// state and re-render the view
//
['actions', 'targets', 'assignments'].forEach(function (name) {
  socket.on(name, function (msg) {
    console.log('msg', name, msg);
    data[name] = msg;
    renderWithData();
  });
});
