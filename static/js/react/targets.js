var React = require('react');

var Target = require('./target');

module.exports = React.createClass({
  list: function () {
    var handler = this.props.onTargetDrop,
        actionHandler = this.props.onActionRemove,
        assignments = this.props.assignments;
    return this.props.targets.map(function (t) {
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
    return (
      <div className="one-half column">
        <span className="label">Targets</span>
        <div className="sounds">
          { this.list() }
        </div>
      </div>
    );
  }
});
