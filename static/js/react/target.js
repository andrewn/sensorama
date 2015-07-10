var React    = require('react'),
    interact = require('interact.js');

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
        classes     = 'touch ' + activeClass;
    return (
      <span className={ classes }>
        { this.props.name }
      </span>
    );
  }
});
