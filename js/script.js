var xpos=0;
var rad=50;
var t=0;
var secondsPerBeat = 1;
var cachedBPM = 60;
var pig1;
var pig2;
var animationMode = 'bouncing'; // 'bouncing' or 'classic'

// Easing functions for smooth animations
const Easing = {
  // Exponential ease out - perfect for gravity/falling
  easeOutExpo: function(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  },

  // Bounce ease out - realistic bouncing effect
  easeOutBounce: function(t) {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },

  // Quadratic ease in-out for smooth acceleration
  easeInOutQuad: function(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }
};

class Pig {
  constructor(direction){
    this.direction=direction;
    this.x = 100;
    this.y = 200; // Base Y position
    this.baseY = 200;
  }

  pigmove(){
    // Calculate normalized time (0 to 1) within the beat
    const framesPerBeat = secondsPerBeat * 60;
    const normalizedTime = Math.min(t / framesPerBeat, 1);

    if (animationMode === 'classic') {
      // Original parabolic horizontal motion
      this.x = this.direction*500/(secondsPerBeat*60)*(t-((1/(secondsPerBeat*60))*t*t))+(640/2);
      this.y = this.baseY;
    } else if (animationMode === 'bouncing') {
      // Improved bouncing animation with realistic physics

      // Horizontal movement: smooth ease in-out for natural motion
      const horizontalProgress = Easing.easeInOutQuad(normalizedTime);
      const maxHorizontalDistance = 280;
      this.x = (640/2) + (this.direction * maxHorizontalDistance * (1 - 2 * Math.abs(horizontalProgress - 0.5)));

      // Vertical bouncing: exponential ease with bounce effect
      const bounceHeight = 150;

      // Use bounce easing for realistic bounce physics
      const bounceProgress = Easing.easeOutBounce(normalizedTime);

      // Create upward arc (inverted bounce)
      this.y = this.baseY - (bounceHeight * bounceProgress);
    }
  }

  display(){
      var bodyX = this.x; // variables
      var bodyY = this.y;
      fill(250, 192, 196); //legs
    rect(bodyX+18, bodyY+73, 18, 68);
    rect(bodyX-47, bodyY+71, 18, 68);

    ellipse(bodyX, bodyY, 245, 245); // body

    fill(163, 124, 127);//lefteare
    triangle(bodyX, bodyY-54, bodyX-70, bodyY+15, bodyX-66,bodyY-87);

    //rightears
    triangle(bodyX+65, bodyY+24, bodyX+70, bodyY-85, bodyX-8,bodyY-58);
    fill(13, 13, 13); // earefill

    triangle(bodyX+26, bodyY+62, bodyX+65, bodyY-77, bodyX-38,bodyY-24); // earefill
    triangle(bodyX, bodyY-31, bodyX-52, bodyY+38, bodyX-59,bodyY-77);
    fill(217, 165, 169);
    ellipse(bodyX, bodyY, 155, 144); //head

    fill(224, 107, 117); //nose
    ellipse(bodyX, bodyY+13, 71, 60);

    fill(0, 0, 0); //nosefill
    ellipse(bodyX-10, bodyY+12, 11, 19);
    ellipse(bodyX+10, bodyY+12, 11, 19);

    ellipse(bodyX-17, bodyY-24, 6, 15); //pupils
    ellipse(bodyX+17, bodyY-24, 6, 15);

    fill(259, 192, 196); //legs
    rect(bodyX-81, bodyY+78, 18, 68);
    rect(bodyX+51, bodyY+72, 18, 68);
    fill(8, 8, 8);
    ellipse(bodyX-72, bodyY+141, 21, 11);
    ellipse(bodyX+60, bodyY+141, 21, 11);
    ellipse(bodyX-38, bodyY+138, 18, 10);
    ellipse(bodyX+28, bodyY+138, 18, 10);
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
var player = new Tone.Player("./sounds/oink.wav").toMaster();

// TriggerSound Play
function triggerSound(time){
	player.start(time)
}

// Schedule sound using Tone.js Transport Feature
Tone.Transport.schedule(function(time){
  triggerSound(time)

  // Reset animation timer to sync with beat
  Tone.Draw.schedule(function(){
      t=0;
      // Update cached BPM only if it changed
      const currentBPM = Tone.Transport.bpm.value;
      if (cachedBPM !== currentBPM) {
        cachedBPM = currentBPM;
        secondsPerBeat = 1 / (currentBPM / 60);
      }
  })

}, 0)
Tone.Transport.loop = true;
Tone.Transport.loopEnd = '4n';


//start/stop the transport
document.querySelector('tone-play-toggle').addEventListener('change', e => Tone.Transport.toggle())

//update BPM from slider
document.querySelector('tone-slider').addEventListener('change', e => {
  Tone.Transport.bpm.value = e.detail;
  cachedBPM = e.detail;
  secondsPerBeat = 1 / (e.detail / 60);
})

//change animation mode
document.querySelector('#animation-mode').addEventListener('change', e => {
  animationMode = e.target.value;
})


// Setup p5.js canvas
function setup() {
  var xwidth=640
  var yheight=480;
  var canvas = createCanvas(xwidth, yheight);
  canvas.parent(document.querySelector('.canvas-wrapper'));
  frameRate(60);
  xpos=xwidth/2+rad;

  // Create 2 pig instances
  pig1 = new Pig(1);
  pig2 = new Pig(-1)
}


function draw() {
  if (t<5){
    background('white');
  } else {
      background('#696969');
  }

  t++;
  pig1.display();
  pig1.pigmove();
  pig2.display();
  pig2.pigmove();
}
