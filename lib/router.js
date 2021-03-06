var debug = require('debug')('sensors:router'),
    _ = require('lodash');

var createActions = require('./actions');

var assignmentsConfig = require('../config/assignments.json');

/*
  The router:
    - maintains list of available actions
    - maintains list of available targets
    - can link/unlink targets to actions
    - trigger actions when targets become active
*/
var Router = function (player, web, espruino) {
  this.player = player;
  this.web = web;
  this.espruino = espruino;

  player.updateDatabase();

  // Targets
  this.targets = {};

  // Targets assigned to actions
  this.assignments = assignmentsConfig;

  // Actions
  createActions(player).then(function (actions) {
    this.actions = actions;
    this.web.broadcast('actions', _.values(this.actions));
    this.web.broadcast('assignments', this.assignments);
  }.bind(this));

  // TODO: Should wait until actions created before running
  // Listen for assignment commands
  this.web.on('command', function (msg) {
    if (msg.name === 'associate') {
      console.log('Associate: ', msg.target, msg.action);
      this.assignments[msg.target] = msg.action;
    } else if (msg.name === 'dissociate') {
      console.log('Dissociate: ', msg.target);
      // TODO: Should delete this property?
      this.assignments[msg.target] = null;
    } else if (msg.name === 'reset') {
      // TODO: Should validate data structure?
      console.log('Router: reset request');
      this.espruino.send(msg);
    }
    this.web.broadcast('assignments', this.assignments);
  }.bind(this));

  this.espruino
    .connected
    .then(function () {
      this.espruino.send({ name: 'state' });
    }.bind(this));
};

Router.prototype.updateTargetStates = function (targets) {
  // Update target states
  _.forEach(targets, function (t) {
    var target = this.targets[t.id];
    if (t.isActive && target && t.isActive !== target.isActive) {
      // Trigger on activation and state change
      var actionId = this.assignments[t.id];
      var action = this.actions[actionId];
      if (action && action.exec) {
        console.log('TRIGGER', actionId, action);
        action.exec();
      }
    }
    // Save new state
    this.targets[t.id] = t;
  }.bind(this));

  this.web.broadcast('targets', _.values(this.targets));
};

module.exports = Router;
