var tessel = require('tessel');
var servolib = require('servo-pca9685');
var av = require('tessel-av')
const mic = new av.Microphone()

var Slack = require('node-slack')
var slack = new Slack('https://hooks.slack.com/services/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')

var servo = servolib.use(tessel.port['A']);
var servo1 = 1; // We have a servo plugged in at position 1





var sendSlack = function(){
  slack.send({
    text: 'Everyone, shhhhhh... Jean is trying to focus',
    channel: '#general',
    username: 'clairenied',
    icon_emoji: 'taco'
  });
}

function servoSetup(){
  // var position = 0;
  // servo.configure(servo1, 0.05, 0.12, function () {
  //   setInterval(function () {
  //     console.log('Position (in range 0-1):', position);
  //     //  Set servo #1 to position pos.
  //     servo.move(servo1, position);
  //
  //     // Increment by 10% (~18 deg for a normal servo)
  //     position += 0.1;
  //     if (position > 1) {
  //       position = 0; // Reset servo position
  //     }
  //   }, 500); // Every 500 milliseconds
  // });
}

function servoFunc(){
  servo.on('ready', function() {
    var position = .7; //  Target position of the servo between 0 (min) and 1 (max).
    servo.move(servo1, position);
    servo.move(position, servo1);

    servoSetup()
    // setInterval(function() {
    //   console.log('Position (in range 0-1):', position);
    //   //  Set servo #1 to position pos.
    //   servo.move(servo1, position);
    //
    //   // Increment by 10% (~18 deg for a normal servo)
    //   position += 0.1;
    //   if (position > 1) {
    //     position = .7; // Reset servo position
    //   }
    // }, 100); // Every 500 milliseconds
  });
}
let avgs = [];

var ambienceLoop = function(){
  var listen = mic.listen();
  listen.on("data", function(buffer) {
    var sum = 0;
    var avg;
    var avgOfAvg;
    var avgLimit = 35;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] ^ 2;
    }
    avg = sum / buffer.length;
    avgs.push(avg);
    if (avgs.length >= avgLimit) {
      var total = avgs.reduce(function(a, b) {
        return a + b;
      })
      avgOfAvg = total / avgs.length;
      avgs = [];
      console.log('AVERAGE', avgOfAvg);
    }
    if (avgOfAvg > 120){
      var position = Math.random()/5 + 0.6; //  Target position of the servo between 0 (min) and 1 (max).
      servo.move(servo1, position);
    }
    if (avgOfAvg > 127){
      sendSlack()
    }
    avgs.push(avg);
  });
}

setInterval(ambienceLoop, 1000)
////////////////////////////////////////////////////////////////////
