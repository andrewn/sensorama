var React = require('react');

var ActionComponent = require('./action');

module.exports = React.createClass({
  actionList: function () {
    return this.props.actions.map(function (action) {
      return (
        <ActionComponent action={ action } />
      );
    });
  },
  render: function() {
    var numActions = this.props.actions.length;
    return (
      <div className="one-half column">
        <span className="label">Actions ({ numActions })</span>
        <div className="sounds">
          { this.actionList() }
        </div>
      </div>
    );
  }
});
