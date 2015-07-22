var React = require('react');

var ActionComponent = require('./action');

module.exports = React.createClass({
  actionList: function () {
    return this.props.actions.map(function (action) {
      return (
        <ActionComponent key={ action.id } { ...action } />
      );
    });
  },
  render: function() {
    var numActions = this.props.actions.length;
    return (
      <div className="one-half column">
        <h2>Actions ({ numActions })</h2>
        <div className="actions">
          { this.actionList() }
        </div>
      </div>
    );
  }
});
