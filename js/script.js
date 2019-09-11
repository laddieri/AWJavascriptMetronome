var xpos=0;
var rad=50;
var t=0;
var secondsPerBeat;
var bpm = 60;


document.documentElement.addEventListener(
  "mousedown", function(){
    mouse_IsDown = true;
    if (Tone.context.state !== 'running') {
    Tone.context.resume();
    Tone.Transport.bpm.value = 60;
}});


var player = new Tone.Player("./sounds/clap.wav").toMaster();

function triggerSound(time){
	player.start()
}

Tone.Transport.schedule(function(time){
  triggerSound(time)
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

function updateTime() {
requestAnimationFrame(updateTime)
  secondsPerBeat=1/(Tone.Transport.bpm.value/60);
}

function setup() {
  var xwidth=640
  var yheight=480;
  createCanvas(xwidth, yheight);
  frameRate(60);
  xpos=0+rad;
}

function draw() {
  background(255);
  ellipse(xpos, 50, rad, rad);
  xpos = updateXpos(xpos);
  t++;
}

function updateXpos(xpos){

  xpos=1000/(secondsPerBeat*60)*(t-((1/(secondsPerBeat*60))*t*t));
  return xpos;
}

updateTime()
