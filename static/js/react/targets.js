var React = require('react');

var Target = require('./target');

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
  list: function () {
    var handler = this.props.onTargetDrop;
    return this.props.targets.map(function (t) {
      return (
        <Target key={ t.id } onTargetDrop={ handler } { ...t } />
        // <span key={ t.id } className={ classes }>
        //   { t.name }
        // </span>
        // <span on-drop="dropped"
        //       class="touch {{ (t.isActive === true)? 'is-touched' : '' }} {{ assignedSounds.sounds[i] ? 'is-assigned' : '' }}">
        //   {{ name }}
        //   {{#assignments[id]}}
        //     <span on-drag="remove" class="sound">{{ assignments[id] }}</span>
        //   {{/}}
        // </span>
      );
    });
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
