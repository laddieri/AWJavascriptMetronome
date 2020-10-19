var xpos=0;
var rad=50;
var t=0;
var secondsPerBeat;
var bpm = 60;
var ball1;
var ball2;
// var running;

// Ball class to allow for two bouncing balls at once
class Ball {

  constructor(radius, direction){
    this.radius = radius;
    this.direction=direction;
    this.x = 100;
  };

  ballmove(){
    this.x = this.direction*500/(secondsPerBeat*60)*(t-((1/(secondsPerBeat*60))*t*t))+(640/2);
  }

  display(){
    stroke(0,0,0);
    fill('rgb(241, 194, 125)');
    ellipse(this.x,100,this.radius,this.radius);
    ellipse(this.x+30*this.direction,55,this.radius/2.5,this.radius/8);
    ellipse(this.x+50*this.direction,75,this.radius/2.5,this.radius/8);
    ellipse(this.x+50*this.direction,95,this.radius/2.5,this.radius/8);
    ellipse(this.x+50*this.direction,115,this.radius/2.5,this.radius/8);
    ellipse(this.x+50*this.direction,135,this.radius/2.5,this.radius/8);
  }

}

// Start Audio Context on Mouseclick
document.documentElement.addEventListener(
  "mousedown", function(){
    mouse_IsDown = true;
    if (Tone.context.state !== 'running') {
    Tone.context.resume();
    Tone.Transport.bpm.value = 60;
}});

// Create new Tone.js Player with clap sound and connect to Master Output
var player = new Tone.Player("./sounds/clap.wav").toMaster();

// TriggerSound Play
function triggerSound(time){
	player.start(time)
}

// Schedule sound using Tone.js Transport Feature
Tone.Transport.schedule(function(time){
  triggerSound(time)

  // checks the tempo slider every time the metronome clicks and set t=0 in order to sync animation
  Tone.Draw.schedule(function(){
      document.querySelector('tone-slider').value=Tone.Transport.bpm.value;
      t=0;
      })

}, 0)
Tone.Transport.loop = true;
Tone.Transport.loopEnd = '4n';


//start/stop the transport
document.querySelector('tone-play-toggle').addEventListener('change', e => Tone.Transport.toggle())

// //start/stop the transport
// document.querySelector('tone-play-toggle').addEventListener('change', function (e){
//   Tone.Transport.toggle()
//   running = !running;
// });

//start/stop the transport
document.querySelector('tone-slider').addEventListener('change', e => Tone.Transport.bpm.value = e.detail)


// Calculate seconds per beat from BPM
function updateTime() {
requestAnimationFrame(updateTime)
  secondsPerBeat=1/(Tone.Transport.bpm.value/60);
}

// Setup p5.js canvas
function setup() {
  var xwidth=640
  var yheight=480;
  createCanvas(xwidth, yheight);
  frameRate(60);
  xpos=xwidth/2+rad;


  // Create 2 instances of ball class
  ball1 = new Ball(100, 1);
  ball2 = new Ball(100,-1);
}


function draw() {
  if (t<5){
    background('white');
  } else {
      background('#696969');
  }

  t++;
  ball1.display();
  ball1.ballmove();
  ball2.display();
  ball2.ballmove();
}

updateTime()
