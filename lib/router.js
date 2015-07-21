var debug = require('debug')('sensors:router'),
    _ = require('lodash');

var createActions = require('./actions');

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

  // Actions
  createActions(player).then(function (actions) {
    this.actions = actions;
    this.web.broadcast('actions', _.values(this.actions));
  }.bind(this));

  // Targets
  this.targets = {};

  // Targets assigned to actions
  this.assignments = {};

  // Listen for assignment commands
  this.web.on('command', function (msg) {
    if (msg.name === 'associate') {
      console.log('Associate: ', msg.target, msg.action);
      this.assignments[msg.target] = msg.action;
    } else if (msg.name === 'dissociate') {
      console.log('Dissociate: ', msg.target);
      this.assignments[msg.target] = null;
    } else if (msg.name === 'reset') {
      console.log('Router: reset request');
      this.espruino.send(msg);
    }
    this.web.broadcast('assignments', this.assignments);
  }.bind(this));
};

Router.prototype.updateTargetStates = function (targets) {
  // Update target states
  _.forEach(targets, function (t) {
    var target = this.targets[t.id];
    if (t.isActive && target && t.isActive !== target.isActive) {
      // Trigger on activation and state change
      var actionId = this.assignments[t.id];
      var actionFunc = this.actions[actionId];
      if (actionFunc) {
        console.log('TRIGGER', actionId);
        actionFunc();
      }
    }
    // Save new state
    this.targets[t.id] = t;
  }.bind(this));

  this.web.broadcast('targets', _.values(this.targets));
};

module.exports = Router;
