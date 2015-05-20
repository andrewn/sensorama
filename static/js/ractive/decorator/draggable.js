var interact = require('interact.js');

module.exports = function ( node, content ) {
  var instance = interact(node)
                  .draggable({
                    onmove: dragMoveListener,
                    onend: dragEndListener
                  });

  node.setAttribute('data-content', content);

  function dragMoveListener (event) {
    var target = event.target,
        // keep the dragged position in the data-x/data-y attributes
        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // translate the element
    target.style.webkitTransform =
    target.style.transform =
      'translate(' + x + 'px, ' + y + 'px)';

    // update the position attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  }

  function dragEndListener(event) {
    var target = event.target,
        // keep the dragged position in the data-x/data-y attributes
        x = (parseFloat(target.getAttribute('data-x')) || 0),
        y = (parseFloat(target.getAttribute('data-y')) || 0);

    target.style.webkitTransform =
      target.style.transform =
        'translate(0px, 0px)';

      // update the position attributes
      target.setAttribute('data-x', 0);
      target.setAttribute('data-y', 0);
  }

  return {
    teardown: function () {
      interact(node).unset();
    }
  };
};