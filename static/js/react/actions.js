var React = require('react');

module.exports = React.createClass({
  // getInitialState: function() {
  //   return { actions: [] };
  // },
  // tick: function() {
  //   this.setState({secondsElapsed: this.state.secondsElapsed + 1});
  // },
  // componentDidMount: function() {
  //   this.interval = setInterval(this.tick, 1000);
  // },
  // componentWillUnmount: function() {
  //   clearInterval(this.interval);
  // },
  actionList: function () {
    return this.props.actions.map(function (action) {
      return (
        <span className="sound" x-decorator="draggable:{{.}}">{{ action }}</span>
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
