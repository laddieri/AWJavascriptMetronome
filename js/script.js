var xpos=0;
var rad=50;
var t=0;
var secondsPerBeat;
var bpm = 60;
var ball1;
var ball2;

// Ball class to allow for two bouncing balls at once
class Ball {
  x =100;
  constructor(radius){
    this.radius = radius;
  };

  ballmove(){
    console.log("ball position changed " + this.radius)
  }

  display(){
    ellipse(x,50,50,50);
  }

  move(){
    
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
	player.start()
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

  // To-do create 2 instances of ball class
  ball1 = new Ball(1, 10);
  ball2 = new Ball(1,20);
}

//
function draw() {
  background(255);
  ellipse(xpos, 50, rad, rad);
  xpos = updateXpos(xpos) + 640/2;
  t++;
  ball1.display();
}

function updateXpos(xpos){
  xpos=1000/(secondsPerBeat*60)*(t-((1/(secondsPerBeat*60))*t*t));
  return xpos;
}

updateTime()
