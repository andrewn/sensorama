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

    //
    this.getDOMNode()
        .setAttribute('data-content', this.props.id);
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
    var shouldFireEvent = true;

    if (this.props.dragEndDistance && Math.abs(this.state.x) < this.props.dragEndDistance) {
      shouldFireEvent = false;
    }

    if (this.props.onDragEnd && shouldFireEvent) {
      this.props.onDragEnd(this.props);
    }

    this.setState({
      x: 0,
      y: 0,
      duration: '0.25s'
    });
  },
  render: function() {
    var hasImage   = !!this.props.image,
        labelClass = hasImage ? '' : ' has-label ',
        className  = "action" + labelClass,
        image = this.props.image ? <img src={ this.props.image } /> : '',
        iconName = 'fa fa-' + this.props.icon,
        icon  = this.props.icon ? <i className={ iconName }></i> : '',
        name  = hasImage ? null : this.props.name;
    return (
      <span className={ className } style={ this.style() }>
        { image }
        { icon }
        { name }
      </span>
    );
  }
});
