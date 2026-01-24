var xpos=0;
var rad=50;
var t=0;
var secondsPerBeat = 1;
var cachedBPM = 60;
var animal1;
var animal2;
var animationMode = 'bouncing'; // 'bouncing' or 'classic'
var animalType = 'pig'; // 'pig', 'cat', 'dog', 'bird'

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
      // Improved horizontal animation with smooth easing

      // Horizontal movement: smooth ease in-out for natural motion
      const horizontalProgress = Easing.easeInOutQuad(normalizedTime);
      const maxHorizontalDistance = 280;
      this.x = (640/2) + (this.direction * maxHorizontalDistance * (1 - 2 * Math.abs(horizontalProgress - 0.5)));

      // No vertical movement - keep at base position
      this.y = this.baseY;
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

class Cat {
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
      // Improved horizontal animation with smooth easing

      // Horizontal movement: smooth ease in-out for natural motion
      const horizontalProgress = Easing.easeInOutQuad(normalizedTime);
      const maxHorizontalDistance = 280;
      this.x = (640/2) + (this.direction * maxHorizontalDistance * (1 - 2 * Math.abs(horizontalProgress - 0.5)));

      // No vertical movement - keep at base position
      this.y = this.baseY;
    }
  }

  display(){
    var bodyX = this.x;
    var bodyY = this.y;

    // Body
    fill(255, 140, 0); // Orange
    ellipse(bodyX, bodyY, 180, 160);

    // Head
    ellipse(bodyX, bodyY - 60, 120, 110);

    // Ears
    fill(255, 120, 0);
    triangle(bodyX - 50, bodyY - 100, bodyX - 40, bodyY - 60, bodyX - 20, bodyY - 90);
    triangle(bodyX + 50, bodyY - 100, bodyX + 40, bodyY - 60, bodyX + 20, bodyY - 90);

    // Eyes
    fill(255, 255, 255);
    ellipse(bodyX - 25, bodyY - 65, 25, 30);
    ellipse(bodyX + 25, bodyY - 65, 25, 30);
    fill(0, 200, 0); // Green pupils
    ellipse(bodyX - 25, bodyY - 63, 12, 18);
    ellipse(bodyX + 25, bodyY - 63, 12, 18);
    fill(0);
    ellipse(bodyX - 25, bodyY - 60, 6, 10);
    ellipse(bodyX + 25, bodyY - 60, 6, 10);

    // Nose
    fill(255, 105, 180);
    triangle(bodyX - 8, bodyY - 45, bodyX + 8, bodyY - 45, bodyX, bodyY - 35);

    // Whiskers
    stroke(0);
    strokeWeight(2);
    line(bodyX - 60, bodyY - 50, bodyX - 35, bodyY - 48);
    line(bodyX - 60, bodyY - 40, bodyX - 35, bodyY - 40);
    line(bodyX + 60, bodyY - 50, bodyX + 35, bodyY - 48);
    line(bodyX + 60, bodyY - 40, bodyX + 35, bodyY - 40);
    noStroke();

    // Tail
    fill(255, 140, 0);
    arc(bodyX + 80, bodyY - 20, 60, 100, -PI/2, PI/2);

    // Legs
    fill(255, 120, 0);
    rect(bodyX - 45, bodyY + 60, 20, 70);
    rect(bodyX + 25, bodyY + 60, 20, 70);

    // Paws
    fill(255, 100, 0);
    ellipse(bodyX - 35, bodyY + 130, 28, 18);
    ellipse(bodyX + 35, bodyY + 130, 28, 18);
  }
}

class Dog {
  constructor(direction){
    this.direction=direction;
    this.x = 100;
    this.y = 200;
    this.baseY = 200;
  }

  pigmove(){
    // Calculate normalized time (0 to 1) within the beat
    const framesPerBeat = secondsPerBeat * 60;
    const normalizedTime = Math.min(t / framesPerBeat, 1);

    if (animationMode === 'classic') {
      this.x = this.direction*500/(secondsPerBeat*60)*(t-((1/(secondsPerBeat*60))*t*t))+(640/2);
      this.y = this.baseY;
    } else if (animationMode === 'bouncing') {
      const horizontalProgress = Easing.easeInOutQuad(normalizedTime);
      const maxHorizontalDistance = 280;
      this.x = (640/2) + (this.direction * maxHorizontalDistance * (1 - 2 * Math.abs(horizontalProgress - 0.5)));

      // No vertical movement - keep at base position
      this.y = this.baseY;
    }
  }

  display(){
    var bodyX = this.x;
    var bodyY = this.y;

    // Body
    fill(139, 90, 43); // Brown
    ellipse(bodyX, bodyY, 200, 140);

    // Head
    ellipse(bodyX + this.direction * 30, bodyY - 40, 100, 90);

    // Snout
    fill(160, 110, 60);
    ellipse(bodyX + this.direction * 55, bodyY - 25, 50, 40);

    // Nose
    fill(0);
    ellipse(bodyX + this.direction * 70, bodyY - 28, 18, 15);

    // Ears
    fill(120, 80, 40);
    ellipse(bodyX + this.direction * 10, bodyY - 75, 35, 50);
    ellipse(bodyX + this.direction * 50, bodyY - 75, 35, 50);

    // Eyes
    fill(255);
    ellipse(bodyX + this.direction * 20, bodyY - 50, 20, 22);
    ellipse(bodyX + this.direction * 45, bodyY - 50, 20, 22);
    fill(50, 30, 10); // Dark brown pupils
    ellipse(bodyX + this.direction * 20, bodyY - 48, 10, 12);
    ellipse(bodyX + this.direction * 45, bodyY - 48, 10, 12);

    // Tail
    fill(139, 90, 43);
    arc(bodyX - this.direction * 90, bodyY - 10, 50, 80, this.direction > 0 ? -PI/4 : PI - PI/4, this.direction > 0 ? PI/2 : PI + PI/2);

    // Legs
    fill(120, 80, 40);
    rect(bodyX - 50, bodyY + 50, 22, 75);
    rect(bodyX - 15, bodyY + 50, 22, 75);
    rect(bodyX + 15, bodyY + 50, 22, 75);
    rect(bodyX + 50, bodyY + 50, 22, 75);

    // Paws
    fill(100, 70, 35);
    ellipse(bodyX - 39, bodyY + 125, 26, 16);
    ellipse(bodyX - 4, bodyY + 125, 26, 16);
    ellipse(bodyX + 26, bodyY + 125, 26, 16);
    ellipse(bodyX + 61, bodyY + 125, 26, 16);
  }
}

class Bird {
  constructor(direction){
    this.direction=direction;
    this.x = 100;
    this.y = 200;
    this.baseY = 200;
  }

  pigmove(){
    // Calculate normalized time (0 to 1) within the beat
    const framesPerBeat = secondsPerBeat * 60;
    const normalizedTime = Math.min(t / framesPerBeat, 1);

    if (animationMode === 'classic') {
      this.x = this.direction*500/(secondsPerBeat*60)*(t-((1/(secondsPerBeat*60))*t*t))+(640/2);
      this.y = this.baseY;
    } else if (animationMode === 'bouncing') {
      const horizontalProgress = Easing.easeInOutQuad(normalizedTime);
      const maxHorizontalDistance = 280;
      this.x = (640/2) + (this.direction * maxHorizontalDistance * (1 - 2 * Math.abs(horizontalProgress - 0.5)));

      // No vertical movement - keep at base position
      this.y = this.baseY;
    }
  }

  display(){
    var bodyX = this.x;
    var bodyY = this.y;

    // Wings flapping (subtle animation based on position)
    const wingFlap = sin(t * 0.3) * 15;

    // Body
    fill(65, 105, 225); // Royal blue
    ellipse(bodyX, bodyY, 140, 160);

    // Head
    ellipse(bodyX, bodyY - 70, 90, 85);

    // Beak
    fill(255, 165, 0); // Orange
    triangle(bodyX + this.direction * 40, bodyY - 70,
             bodyX + this.direction * 75, bodyY - 75,
             bodyX + this.direction * 40, bodyY - 65);

    // Eyes
    fill(255);
    ellipse(bodyX + this.direction * 15, bodyY - 75, 28, 30);
    ellipse(bodyX - this.direction * 15, bodyY - 75, 28, 30);
    fill(0);
    ellipse(bodyX + this.direction * 18, bodyY - 73, 12, 14);
    ellipse(bodyX - this.direction * 12, bodyY - 73, 12, 14);

    // Wings
    fill(70, 130, 255);
    ellipse(bodyX - 60, bodyY - 10 + wingFlap, 80, 100);
    ellipse(bodyX + 60, bodyY - 10 - wingFlap, 80, 100);

    // Wing details
    fill(50, 100, 200);
    ellipse(bodyX - 75, bodyY + 10 + wingFlap, 40, 60);
    ellipse(bodyX + 75, bodyY + 10 - wingFlap, 40, 60);

    // Tail
    fill(50, 90, 180);
    triangle(bodyX - 15, bodyY + 70, bodyX + 15, bodyY + 70, bodyX, bodyY + 140);

    // Feet
    fill(255, 165, 0);
    stroke(255, 140, 0);
    strokeWeight(3);
    line(bodyX - 20, bodyY + 80, bodyX - 30, bodyY + 110);
    line(bodyX - 30, bodyY + 110, bodyX - 40, bodyY + 108);
    line(bodyX - 30, bodyY + 110, bodyX - 35, bodyY + 118);
    line(bodyX - 30, bodyY + 110, bodyX - 25, bodyY + 116);

    line(bodyX + 20, bodyY + 80, bodyX + 30, bodyY + 110);
    line(bodyX + 30, bodyY + 110, bodyX + 40, bodyY + 108);
    line(bodyX + 30, bodyY + 110, bodyX + 35, bodyY + 118);
    line(bodyX + 30, bodyY + 110, bodyX + 25, bodyY + 116);
    noStroke();
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

// Create sound players and synthesizers for different animals
var pigPlayer = new Tone.Player("./sounds/oink.wav").toMaster();

// Cat meow synth - higher pitched, smooth envelope
var catSynth = new Tone.Synth({
  oscillator: { type: "triangle" },
  envelope: {
    attack: 0.01,
    decay: 0.15,
    sustain: 0.2,
    release: 0.1
  }
}).toMaster();

// Dog bark synth - lower, sharp attack
var dogSynth = new Tone.MembraneSynth({
  pitchDecay: 0.05,
  octaves: 4,
  oscillator: { type: "square" },
  envelope: {
    attack: 0.001,
    decay: 0.2,
    sustain: 0,
    release: 0.2
  }
}).toMaster();

// Bird chirp synth - very high, quick
var birdSynth = new Tone.Synth({
  oscillator: { type: "sine" },
  envelope: {
    attack: 0.002,
    decay: 0.1,
    sustain: 0.0,
    release: 0.05
  }
}).toMaster();

// TriggerSound Play - switches based on animal type
function triggerSound(time){
  switch(animalType) {
    case 'pig':
      pigPlayer.start(time);
      break;
    case 'cat':
      catSynth.triggerAttackRelease("A4", "16n", time);
      break;
    case 'dog':
      dogSynth.triggerAttackRelease("C2", "8n", time);
      break;
    case 'bird':
      birdSynth.triggerAttackRelease("E6", "32n", time);
      break;
    default:
      pigPlayer.start(time);
  }
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

// Function to create animals based on selected type
function createAnimals() {
  switch(animalType) {
    case 'cat':
      animal1 = new Cat(1);
      animal2 = new Cat(-1);
      break;
    case 'dog':
      animal1 = new Dog(1);
      animal2 = new Dog(-1);
      break;
    case 'bird':
      animal1 = new Bird(1);
      animal2 = new Bird(-1);
      break;
    case 'pig':
    default:
      animal1 = new Pig(1);
      animal2 = new Pig(-1);
      break;
  }
}

// Setup p5.js canvas
function setup() {
  var xwidth=640
  var yheight=480;
  var canvas = createCanvas(xwidth, yheight);
  canvas.parent(document.querySelector('.canvas-wrapper'));
  frameRate(60);
  xpos=xwidth/2+rad;

  // Create 2 animal instances
  createAnimals();

  // Setup event listeners after DOM is ready
  document.querySelector('#animation-mode').addEventListener('change', e => {
    animationMode = e.target.value;
  });

  document.querySelector('#animal-selector').addEventListener('change', e => {
    animalType = e.target.value;
    createAnimals(); // Recreate animals when selection changes
  });
}


function draw() {
  if (t<5){
    background('white');
  } else {
      background('#696969');
  }

  t++;
  animal1.display();
  animal1.pigmove();
  animal2.display();
  animal2.pigmove();
}
