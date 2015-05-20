var interact = require('interact.js');

module.exports = function ( node, fire ) {
  var instance = interact(node)
                  .dropzone({
                    ondrop:      dropListener,
                    ondragenter: logger('enter'),
                    ondragleave: logger('leave')
                  });

  function logger(msg) {
    return function () {
      console.log(msg);
    };
  }

  function dropListener (event) {
    fire({
      content: event.relatedTarget.getAttribute('data-content'),
      node: node,
      original: event
    });
  }

  function dragEndListener(event) {
    var target = event.target,
        // keep the dragged position in the data-x/data-y attributes
        x = (parseFloat(target.getAttribute('data-x')) || 0),
        y = (parseFloat(target.getAttribute('data-y')) || 0);

    if (x > 200 || y > 200) {
      fire({
        node: node,
        original: event
      });
    } else {
      target.style.webkitTransform =
      target.style.transform =
        'translate(0px, 0px)';

      // update the position attributes
      target.setAttribute('data-x', 0);
      target.setAttribute('data-y', 0);
    }

  }

  return {
    teardown: function () {
      interact(node).unset();
    }
  };
};