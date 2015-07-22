var React = require('react');

var Actions = require('./actions'),
    Targets = require('./targets'),
    Target  = require('./target');

module.exports = React.createClass({
  render: function() {
    return (
      <div className="row">
        <Targets
          onTargetDrop={ this.props.onTargetDrop }
          onActionRemove={ this.props.onActionRemove }
          targets={ this.props.targets }
          assignments={ this.props.assignments }/>
        <Actions actions={ this.props.actions }/>
        <button
          className="reset button button-primary"
          onClick={ this.props.onResetRequest }>Recalibrate</button>
          <button
            className="reset button button-primary"
            onClick={ this.props.onClearAssignmentsRequest }>Clear assignments</button>
      </div>
    );
  }
});
