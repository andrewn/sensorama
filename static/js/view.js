var React = require('react');

var Actions = require('./react/actions'),
    Targets = require('./react/targets');

module.exports = React.createClass({
  // getInitialState: function() {
  //   return {secondsElapsed: 0};
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
  render: function() {
    return (
      <div className="row">
        <Targets onTargetDrop={ this.props.onTargetDrop } targets={ this.props.targets } assignments={ this.props.assignments }/>
        <Actions actions={ this.props.actions }/>
      </div>
    );
  }
});
