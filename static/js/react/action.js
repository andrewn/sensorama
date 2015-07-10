var React    = require('react'),
    interact = require('interact.js');

module.exports = React.createClass({
  getInitialState: function() {
    return { x: 0, y: 0, duration: 0 };
  },
  componentDidMount: function() {
    interact(this.getDOMNode())
      .draggable({
        onstart: this.dragStartListener,
        onmove : this.dragMoveListener,
        onend  : this.dragEndListener
      });
  },
  componentWillUnmount: function() {
    interact(this.getDOMNode())
      .unset()
  },
  style: function () {
    var style = {
      transform: 'translate(' + this.state.x + 'px, ' + this.state.y + 'px)'
    };
    if (this.state.duration) {
      style.transitionDuration = this.state.duration;
    }
    return style;
  },
  dragStartListener: function (evt) {
    this.setState({
      duration: 0
    });
  },
  dragMoveListener: function (evt) {
    this.setState({
      x: this.state.x + evt.dx,
      y: this.state.y + evt.dy
    });
  },
  dragEndListener: function (evt) {
    this.setState({
      x: 0,
      y: 0,
      duration: '0.25s'
    });
  },
  render: function() {
    return (
      <span className="sound" style={ this.style() }>{ this.props.action }</span>
    );
  }
});
