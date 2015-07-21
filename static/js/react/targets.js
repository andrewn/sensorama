var React = require('react'),
    _ = require('lodash');

var Target = require('./target');

module.exports = React.createClass({
  targetsOfType: function (type) {
    return _.filter(this.props.targets, { type: type });
  },
  list: function (targets) {
    var handler = this.props.onTargetDrop,
        actionHandler = this.props.onActionRemove,
        assignments = this.props.assignments;

    return targets.map(function (t) {
      var assignmentForTarget = assignments[t.id];
      return (
        <Target
          key={ t.id }
          assignment={ assignmentForTarget }
          onTargetDrop={ handler }
          onActionRemove={ actionHandler }
          { ...t } />
      );
    }.bind(this));
  },
  render: function() {
    var caps  = this.targetsOfType('cap'),
        rfids = this.targetsOfType('rfid');

    return (
      <div className="one-half column">
        <span className="label">Targets</span>

          <h3 className="label">RFID sensors</h3>
          <div className="sounds">
            { this.list(rfids) }
          </div>

        <h3 className="label">Touch sensors</h3>
        <div className="sounds">
          { this.list(caps) }
        </div>
      </div>
    );
  }
});
