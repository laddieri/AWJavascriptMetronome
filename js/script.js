var xpos=0;
var rad=50;
var t=0;
var secondsPerBeat = 1;
var cachedBPM = 60;
var animal1;
var animal2;
var animalType = 'pig'; // 'pig', 'cat', 'dog', 'bird'

// Calculate animation position directly from Tone.js timing for perfect sync
function getAnimationProgress() {
  if (Tone.Transport.state !== 'started') {
    return 0; // At center when stopped
  }
  const beatDuration = 60 / Tone.Transport.bpm.value;
  const timeInBeat = Tone.Transport.seconds % beatDuration;
  return timeInBeat / beatDuration; // 0 to 1
}

function getAnimalX(direction) {
  const progress = getAnimationProgress();
  // Sine wave: 0 at start, peaks at 0.5, returns to 0 at 1
  // This creates smooth motion where animals meet at center on the beat
  const displacement = Math.sin(progress * Math.PI) * 200;
  return direction * displacement + (640 / 2);
}

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
    this.x = getAnimalX(this.direction);
    this.y = this.baseY;
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
    this.x = getAnimalX(this.direction);
    this.y = this.baseY;
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
    this.x = getAnimalX(this.direction);
    this.y = this.baseY;
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
    this.x = getAnimalX(this.direction);
    this.y = this.baseY;
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

class Frog {
  constructor(direction){
    this.direction=direction;
    this.x = 100;
    this.y = 200;
    this.baseY = 200;
  }

  pigmove(){
    this.x = getAnimalX(this.direction);
    this.y = this.baseY;
  }

  display(){
    var bodyX = this.x;
    var bodyY = this.y;

    // Back legs
    fill(34, 139, 34);
    ellipse(bodyX - 50, bodyY + 50, 60, 30);
    ellipse(bodyX + 50, bodyY + 50, 60, 30);

    // Body
    fill(50, 205, 50); // Lime green
    ellipse(bodyX, bodyY, 160, 120);

    // Head
    ellipse(bodyX, bodyY - 40, 130, 100);

    // Eyes (bulging)
    fill(50, 205, 50);
    ellipse(bodyX - 40, bodyY - 80, 50, 50);
    ellipse(bodyX + 40, bodyY - 80, 50, 50);
    fill(255);
    ellipse(bodyX - 40, bodyY - 80, 35, 35);
    ellipse(bodyX + 40, bodyY - 80, 35, 35);
    fill(0);
    ellipse(bodyX - 40, bodyY - 78, 15, 18);
    ellipse(bodyX + 40, bodyY - 78, 15, 18);

    // Mouth
    stroke(30, 100, 30);
    strokeWeight(3);
    noFill();
    arc(bodyX, bodyY - 20, 80, 40, 0, PI);
    noStroke();

    // Front legs
    fill(34, 139, 34);
    ellipse(bodyX - 70, bodyY + 30, 40, 20);
    ellipse(bodyX + 70, bodyY + 30, 40, 20);

    // Belly
    fill(144, 238, 144);
    ellipse(bodyX, bodyY + 10, 100, 70);
  }
}

class Elephant {
  constructor(direction){
    this.direction=direction;
    this.x = 100;
    this.y = 200;
    this.baseY = 200;
  }

  pigmove(){
    this.x = getAnimalX(this.direction);
    this.y = this.baseY;
  }

  display(){
    var bodyX = this.x;
    var bodyY = this.y;

    // Ears
    fill(169, 169, 169);
    ellipse(bodyX - 90, bodyY - 20, 70, 100);
    ellipse(bodyX + 90, bodyY - 20, 70, 100);
    fill(255, 182, 193);
    ellipse(bodyX - 90, bodyY - 20, 45, 70);
    ellipse(bodyX + 90, bodyY - 20, 45, 70);

    // Body
    fill(169, 169, 169); // Gray
    ellipse(bodyX, bodyY, 180, 150);

    // Head
    ellipse(bodyX, bodyY - 50, 120, 110);

    // Trunk
    fill(169, 169, 169);
    beginShape();
    vertex(bodyX - 15, bodyY - 30);
    vertex(bodyX + 15, bodyY - 30);
    vertex(bodyX + 20, bodyY + 60);
    vertex(bodyX + 35, bodyY + 80);
    vertex(bodyX - 35, bodyY + 80);
    vertex(bodyX - 20, bodyY + 60);
    endShape(CLOSE);

    // Eyes
    fill(255);
    ellipse(bodyX - 30, bodyY - 60, 25, 28);
    ellipse(bodyX + 30, bodyY - 60, 25, 28);
    fill(50, 30, 20);
    ellipse(bodyX - 30, bodyY - 58, 12, 14);
    ellipse(bodyX + 30, bodyY - 58, 12, 14);

    // Tusks
    fill(255, 250, 240);
    beginShape();
    vertex(bodyX - 25, bodyY);
    vertex(bodyX - 45, bodyY + 40);
    vertex(bodyX - 35, bodyY + 5);
    endShape(CLOSE);
    beginShape();
    vertex(bodyX + 25, bodyY);
    vertex(bodyX + 45, bodyY + 40);
    vertex(bodyX + 35, bodyY + 5);
    endShape(CLOSE);

    // Legs
    fill(128, 128, 128);
    rect(bodyX - 60, bodyY + 55, 30, 70);
    rect(bodyX - 20, bodyY + 55, 30, 70);
    rect(bodyX + 30, bodyY + 55, 30, 70);

    // Feet
    fill(105, 105, 105);
    ellipse(bodyX - 45, bodyY + 125, 38, 18);
    ellipse(bodyX - 5, bodyY + 125, 38, 18);
    ellipse(bodyX + 45, bodyY + 125, 38, 18);
  }
}

class Penguin {
  constructor(direction){
    this.direction=direction;
    this.x = 100;
    this.y = 200;
    this.baseY = 200;
  }

  pigmove(){
    this.x = getAnimalX(this.direction);
    this.y = this.baseY;
  }

  display(){
    var bodyX = this.x;
    var bodyY = this.y;

    // Wings
    fill(30, 30, 40);
    ellipse(bodyX - 65, bodyY + 10, 35, 90);
    ellipse(bodyX + 65, bodyY + 10, 35, 90);

    // Body (black)
    fill(30, 30, 40);
    ellipse(bodyX, bodyY, 130, 180);

    // Belly (white)
    fill(255);
    ellipse(bodyX, bodyY + 20, 90, 140);

    // Head
    fill(30, 30, 40);
    ellipse(bodyX, bodyY - 70, 90, 80);

    // Face (white patches)
    fill(255);
    ellipse(bodyX - 25, bodyY - 65, 30, 35);
    ellipse(bodyX + 25, bodyY - 65, 30, 35);

    // Eyes
    fill(0);
    ellipse(bodyX - 20, bodyY - 70, 12, 14);
    ellipse(bodyX + 20, bodyY - 70, 12, 14);
    fill(255);
    ellipse(bodyX - 18, bodyY - 72, 4, 4);
    ellipse(bodyX + 22, bodyY - 72, 4, 4);

    // Beak
    fill(255, 165, 0);
    triangle(bodyX - 12, bodyY - 50, bodyX + 12, bodyY - 50, bodyX, bodyY - 30);

    // Feet
    fill(255, 140, 0);
    ellipse(bodyX - 25, bodyY + 85, 40, 18);
    ellipse(bodyX + 25, bodyY + 85, 40, 18);
  }
}

class Rabbit {
  constructor(direction){
    this.direction=direction;
    this.x = 100;
    this.y = 200;
    this.baseY = 200;
  }

  pigmove(){
    this.x = getAnimalX(this.direction);
    this.y = this.baseY;
  }

  display(){
    var bodyX = this.x;
    var bodyY = this.y;

    // Ears
    fill(255, 240, 245);
    ellipse(bodyX - 30, bodyY - 120, 30, 90);
    ellipse(bodyX + 30, bodyY - 120, 30, 90);
    fill(255, 182, 193);
    ellipse(bodyX - 30, bodyY - 115, 15, 60);
    ellipse(bodyX + 30, bodyY - 115, 15, 60);

    // Body
    fill(255, 240, 245);
    ellipse(bodyX, bodyY + 20, 140, 160);

    // Head
    ellipse(bodyX, bodyY - 50, 100, 90);

    // Cheeks
    fill(255, 228, 225);
    ellipse(bodyX - 35, bodyY - 35, 30, 25);
    ellipse(bodyX + 35, bodyY - 35, 30, 25);

    // Eyes
    fill(255);
    ellipse(bodyX - 25, bodyY - 55, 28, 32);
    ellipse(bodyX + 25, bodyY - 55, 28, 32);
    fill(139, 69, 19);
    ellipse(bodyX - 25, bodyY - 53, 14, 18);
    ellipse(bodyX + 25, bodyY - 53, 14, 18);
    fill(0);
    ellipse(bodyX - 25, bodyY - 51, 8, 10);
    ellipse(bodyX + 25, bodyY - 51, 8, 10);
    fill(255);
    ellipse(bodyX - 23, bodyY - 55, 4, 4);
    ellipse(bodyX + 27, bodyY - 55, 4, 4);

    // Nose
    fill(255, 182, 193);
    ellipse(bodyX, bodyY - 35, 15, 12);

    // Mouth
    stroke(200, 150, 150);
    strokeWeight(2);
    noFill();
    arc(bodyX - 8, bodyY - 28, 15, 12, 0, PI);
    arc(bodyX + 8, bodyY - 28, 15, 12, 0, PI);
    noStroke();

    // Whiskers
    stroke(180, 180, 180);
    strokeWeight(1);
    line(bodyX - 50, bodyY - 40, bodyX - 30, bodyY - 38);
    line(bodyX - 50, bodyY - 32, bodyX - 30, bodyY - 32);
    line(bodyX + 50, bodyY - 40, bodyX + 30, bodyY - 38);
    line(bodyX + 50, bodyY - 32, bodyX + 30, bodyY - 32);
    noStroke();

    // Feet
    fill(255, 240, 245);
    ellipse(bodyX - 35, bodyY + 95, 40, 25);
    ellipse(bodyX + 35, bodyY + 95, 40, 25);

    // Tail
    fill(255);
    ellipse(bodyX, bodyY + 90, 35, 30);
  }
}

class Owl {
  constructor(direction){
    this.direction=direction;
    this.x = 100;
    this.y = 200;
    this.baseY = 200;
  }

  pigmove(){
    this.x = getAnimalX(this.direction);
    this.y = this.baseY;
  }

  display(){
    var bodyX = this.x;
    var bodyY = this.y;

    // Wings
    fill(139, 90, 43);
    ellipse(bodyX - 70, bodyY + 10, 50, 100);
    ellipse(bodyX + 70, bodyY + 10, 50, 100);
    fill(101, 67, 33);
    ellipse(bodyX - 75, bodyY + 30, 30, 60);
    ellipse(bodyX + 75, bodyY + 30, 30, 60);

    // Body
    fill(160, 110, 60);
    ellipse(bodyX, bodyY, 130, 170);

    // Belly pattern
    fill(210, 180, 140);
    ellipse(bodyX, bodyY + 20, 80, 100);
    // Feather details
    fill(180, 140, 100);
    for (let i = 0; i < 3; i++) {
      arc(bodyX, bodyY + i * 25, 60, 20, 0, PI);
    }

    // Head
    fill(160, 110, 60);
    ellipse(bodyX, bodyY - 60, 110, 100);

    // Ear tufts
    fill(139, 90, 43);
    triangle(bodyX - 50, bodyY - 90, bodyX - 35, bodyY - 60, bodyX - 55, bodyY - 60);
    triangle(bodyX + 50, bodyY - 90, bodyX + 35, bodyY - 60, bodyX + 55, bodyY - 60);

    // Eye circles (facial disc)
    fill(210, 180, 140);
    ellipse(bodyX - 28, bodyY - 55, 50, 55);
    ellipse(bodyX + 28, bodyY - 55, 50, 55);

    // Eyes
    fill(255);
    ellipse(bodyX - 28, bodyY - 55, 38, 42);
    ellipse(bodyX + 28, bodyY - 55, 38, 42);
    fill(255, 140, 0); // Orange iris
    ellipse(bodyX - 28, bodyY - 53, 24, 28);
    ellipse(bodyX + 28, bodyY - 53, 24, 28);
    fill(0);
    ellipse(bodyX - 28, bodyY - 51, 14, 16);
    ellipse(bodyX + 28, bodyY - 51, 14, 16);
    fill(255);
    ellipse(bodyX - 25, bodyY - 55, 5, 5);
    ellipse(bodyX + 31, bodyY - 55, 5, 5);

    // Beak
    fill(90, 70, 50);
    triangle(bodyX - 8, bodyY - 40, bodyX + 8, bodyY - 40, bodyX, bodyY - 20);

    // Feet
    fill(90, 70, 50);
    ellipse(bodyX - 25, bodyY + 80, 35, 18);
    ellipse(bodyX + 25, bodyY + 80, 35, 18);
    // Talons
    stroke(70, 50, 30);
    strokeWeight(3);
    line(bodyX - 35, bodyY + 82, bodyX - 40, bodyY + 95);
    line(bodyX - 25, bodyY + 85, bodyX - 25, bodyY + 98);
    line(bodyX - 15, bodyY + 82, bodyX - 10, bodyY + 95);
    line(bodyX + 35, bodyY + 82, bodyX + 40, bodyY + 95);
    line(bodyX + 25, bodyY + 85, bodyX + 25, bodyY + 98);
    line(bodyX + 15, bodyY + 82, bodyX + 10, bodyY + 95);
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

// Frog ribbit synth - low croaking sound
var frogSynth = new Tone.Synth({
  oscillator: { type: "sawtooth" },
  envelope: {
    attack: 0.01,
    decay: 0.2,
    sustain: 0.1,
    release: 0.15
  }
}).toMaster();

// Elephant trumpet synth - deep brassy sound
var elephantSynth = new Tone.Synth({
  oscillator: { type: "square" },
  envelope: {
    attack: 0.05,
    decay: 0.3,
    sustain: 0.2,
    release: 0.2
  }
}).toMaster();

// Penguin squawk synth - nasal honking sound
var penguinSynth = new Tone.Synth({
  oscillator: { type: "triangle" },
  envelope: {
    attack: 0.01,
    decay: 0.15,
    sustain: 0.1,
    release: 0.1
  }
}).toMaster();

// Rabbit thump synth - soft thumping sound
var rabbitSynth = new Tone.MembraneSynth({
  pitchDecay: 0.02,
  octaves: 2,
  oscillator: { type: "sine" },
  envelope: {
    attack: 0.001,
    decay: 0.15,
    sustain: 0,
    release: 0.1
  }
}).toMaster();

// Owl hoot synth - low hollow sound
var owlSynth = new Tone.Synth({
  oscillator: { type: "sine" },
  envelope: {
    attack: 0.1,
    decay: 0.3,
    sustain: 0.2,
    release: 0.3
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
    case 'frog':
      frogSynth.triggerAttackRelease("G2", "8n", time);
      break;
    case 'elephant':
      elephantSynth.triggerAttackRelease("C3", "4n", time);
      break;
    case 'penguin':
      penguinSynth.triggerAttackRelease("E4", "16n", time);
      break;
    case 'rabbit':
      rabbitSynth.triggerAttackRelease("G3", "16n", time);
      break;
    case 'owl':
      owlSynth.triggerAttackRelease("D3", "4n", time);
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
    case 'frog':
      animal1 = new Frog(1);
      animal2 = new Frog(-1);
      break;
    case 'elephant':
      animal1 = new Elephant(1);
      animal2 = new Elephant(-1);
      break;
    case 'penguin':
      animal1 = new Penguin(1);
      animal2 = new Penguin(-1);
      break;
    case 'rabbit':
      animal1 = new Rabbit(1);
      animal2 = new Rabbit(-1);
      break;
    case 'owl':
      animal1 = new Owl(1);
      animal2 = new Owl(-1);
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

  document.querySelector('#animal-selector').addEventListener('change', e => {
    animalType = e.target.value;
    createAnimals(); // Recreate animals when selection changes
  });
}


function draw() {
  // Flash white at beat (when progress is near 0)
  const progress = getAnimationProgress();
  if (Tone.Transport.state === 'started' && progress < 0.08) {
    background('white');
  } else {
    background('#696969');
  }

  // Update positions - getAnimalX handles both playing and stopped states
  animal1.pigmove();
  animal2.pigmove();

  animal1.display();
  animal2.display();
}
