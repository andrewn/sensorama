var Ractive = require('ractive');

var socket = io();

var Circle = Ractive.extend({
  template: '#circle-template',
  // isolated: true,
  computed: {
    radius: function () {
      return Math.round( ( this.get('value') / 160 ) * 25 );
    }
  }
});

var ractive = new Ractive({
  el: '#ui',
  template: '#ui-template',
  data: {
    distance: {}
  },
  components: {
    Circle: Circle
  }
});

socket.on('sensor', function (msg) {
  console.log('msg', msg);
  ractive.animate(msg.type, msg);
});

// var radiodan = window.Radiodan.create();

// var player = radiodan.player.get('main');

// function playFromButton(button) {
//   var url = button.getAttribute('data-url');
//   console.log('play from button', url);
//   play(url);
// }

// /*
//   Commands
//   You can tell the player to do something
//   by calling methods on the `player` object.
// */
// /*
//   Tell the player to play a file or stream
//   and to clear the current playlist first.
// */
// function play(fileOrStream) {
//   player
//     .add({
//       clear: true,
//       playlist: [fileOrStream]
//     })
//     .then(player.play);
// }

// /*
//   Stop playing
// */
// function stop() {
//   player.stop();
// }

// /*
//   Events
//   The player will fire an event whenever something
//   happens. You can listen to these events to update
//   your app.
// */
// player.on('player', function (info) {
//   console.log('player event fired with data: ', info)
//   updateStatus(info.state);
// });

// function updateStatus(message) {
//   document.querySelector('#status').innerHTML = message;
// }