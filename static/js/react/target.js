var React    = require('react'),
    interact = require('interact.js');

var Action = require('./action');

module.exports = React.createClass({
  componentDidMount: function() {
    interact(this.getDOMNode())
      .dropzone({
        ondrop:      this.dropListener /*,
        ondragenter: function () {},
        ondragleave: function () {} */
      });
  },
  componentWillUnmount: function() {
    interact(this.getDOMNode())
      .unset();
  },
  dropListener: function (evt) {
    var action = evt.relatedTarget.getAttribute('data-content'),
        target = this.props.id,
        evt    = { action: action, target: target };
    this.props.onTargetDrop(evt);
  },
  render: function() {
    var activeClass = (this.props.isActive === true) ? 'is-touched' : '',
        classes     = 'touch ' + activeClass,
        assignment  = '';

    if (this.props.assignment) {
      assignment = <Action
                    action={ this.props.assignment }
                    dragEndDistance='100'
                    onDragEnd={ this.props.onActionRemove.bind(null, this.props.assignment, this.props.id) } />;
    }

    return (
      <span className={ classes }>
        { this.props.name }
        { assignment }
      </span>
    );
  }
});
