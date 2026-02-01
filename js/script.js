var xpos=0;
var rad=50;
var t=0;
var secondsPerBeat = 1;
var cachedBPM = 60;
var animal1;
var animal2;
var animalType = 'circle'; // 'circle', 'pig', 'cat', 'dog', 'bird', etc.
var circleColor = '#000000'; // Color for circle animation

// Selfie capture variables
var selfieImage = null;
var cameraStream = null;
var recordedSoundURL = null; // URL for recorded selfie sound
var recordedSoundPlayer = null; // Tone.js Player for recorded sound
var mediaRecorder = null;
var audioChunks = [];
var mirrorSelfies = true; // When true, selfie images face each other

// Advanced metronome settings
var beatsPerMeasure = 4;
var currentBeat = 0;
var subdivision = 'none'; // 'none', 'eighth', 'triplet', 'sixteenth'
var animalSoundEnabled = true; // Play animal sound on beat
var accentEnabled = true;
var flashEnabled = true; // Flash background on beat
var voiceCountEnabled = false; // Count beats aloud
var lastBeatTime = 0; // Track when last beat fired for animation sync
var bounceDirection = 'horizontal'; // 'horizontal' or 'vertical'

// Voice counting with Web Speech API
function speakBeatNumber(beatNumber) {
  if (!voiceCountEnabled) return;
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech to prevent overlap
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(String(beatNumber));
    utterance.rate = 1.5; // Speak faster for quick beats
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  }
}

// Canvas dimensions (will be set dynamically)
var canvasWidth = 640;
var canvasHeight = 480;
var canvasScale = 1;

// Calculate responsive canvas size
// Canvas fills available space while maintaining 4:3 aspect ratio
function getCanvasSize() {
  const wrapper = document.querySelector('.canvas-wrapper');
  if (!wrapper) return { width: 640, height: 480, scale: 1 };

  const maxWidth = wrapper.clientWidth - 32; // Account for padding
  const maxHeight = wrapper.clientHeight - 32; // Account for padding
  const baseWidth = 640;
  const baseHeight = 480;
  const aspectRatio = baseWidth / baseHeight;

  // Start with max available width
  let newWidth = maxWidth;
  let newHeight = newWidth / aspectRatio;

  // If height is constrained, scale down based on height
  if (newHeight > maxHeight && maxHeight > 0) {
    newHeight = maxHeight;
    newWidth = newHeight * aspectRatio;
  }

  // Ensure minimum size for very small screens
  if (newWidth < 200) {
    newWidth = 200;
    newHeight = newWidth / aspectRatio;
  }

  return {
    width: Math.floor(newWidth),
    height: Math.floor(newHeight),
    scale: newWidth / baseWidth
  };
}

// Smoothed animation progress for fluid motion
var smoothedProgress = 0;
var lastFrameTime = 0;

// Calculate animation position based on time since last beat fired
// This stays in sync even when BPM changes mid-playback
function getAnimationProgress() {
  if (Tone.Transport.state !== 'started') {
    return 0; // At center when stopped
  }
  const beatDuration = 60 / Tone.Transport.bpm.value;
  const timeSinceLastBeat = Tone.now() - lastBeatTime;
  // Clamp to 0-1 range in case of timing edge cases
  return Math.min(Math.max(timeSinceLastBeat / beatDuration, 0), 1);
}

function getAnimalX(direction) {
  const rawProgress = getAnimationProgress();

  // Apply easing for smoother acceleration/deceleration
  // Using sine easing which naturally smooths the motion
  const easedProgress = rawProgress;

  // Sine wave: 0 at start, peaks at 0.5, returns to 0 at 1
  // This creates smooth motion where animals meet at center on the beat
  // Use base coordinate system (640x480) - scale() handles actual sizing
  const baseWidth = 640;
  const baseDisplacement = 200;
  const displacement = Math.sin(easedProgress * Math.PI) * baseDisplacement;
  return direction * displacement + (baseWidth / 2);
}

// Get Y position for vertical bounce mode
function getVerticalY() {
  const rawProgress = getAnimationProgress();
  const lineY = 420; // Where the horizontal line is (lowered)
  const bounceBottom = 350; // Object center at lowest point (~20% below line)
  const maxHeight = 260; // How high the object bounces from bottom

  // Object center is at bounceBottom when progress = 0 (on the beat)
  // About 20% of object passes below the line
  const displacement = Math.sin(rawProgress * Math.PI) * maxHeight;
  return bounceBottom - displacement;
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

class Circle {
  constructor(direction){
    this.direction = direction;
    this.x = 100;
    this.y = 240;
    this.baseY = 240;
    this.size = 180; // Diameter of the circle
  }

  pigmove(){
    this.x = getAnimalX(this.direction);
    this.y = this.baseY;
  }

  display(){
    var bodyX = this.x;
    var bodyY = this.y;

    // Draw a simple filled circle
    noStroke();
    fill(circleColor);
    ellipse(bodyX, bodyY, this.size, this.size);
  }
}

class Pig {
  constructor(direction){
    this.direction=direction;
    this.x = 100;
    this.y = 240; // Base Y position
    this.baseY = 240;
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

class Selfie {
  constructor(direction){
    this.direction = direction;
    this.x = 100;
    this.y = 240;
    this.baseY = 240;
    this.size = 280; // Size of the circular face (larger for better visibility)
  }

  pigmove(){
    this.x = getAnimalX(this.direction);
    this.y = this.baseY;
  }

  display(){
    var bodyX = this.x;
    var bodyY = this.y;

    if (selfieImage) {
      // Draw the selfie image in a circle
      push();

      // Create circular clipping mask
      imageMode(CENTER);

      // Draw circular border/background
      fill(255);
      stroke(102, 126, 234); // Purple border
      strokeWeight(4);
      ellipse(bodyX, bodyY, this.size + 8, this.size + 8);

      // Clip to circle and draw image
      // Use a graphics buffer for circular mask
      let diameter = this.size;

      // Draw the image
      noStroke();

      // Create circular clip using drawingContext
      drawingContext.save();
      drawingContext.beginPath();
      drawingContext.arc(bodyX, bodyY, diameter / 2, 0, Math.PI * 2);
      drawingContext.clip();

      // Draw the selfie image
      // When mirrorSelfies is true, mirror based on direction so images face each other
      // direction 1 = right side, direction -1 = left side
      push();
      translate(bodyX, bodyY);
      if (mirrorSelfies) {
        // Mirror the right image (direction 1) so they face each other
        if (this.direction === 1) {
          scale(-1, 1);
        }
      } else {
        // When not mirroring, show both images with same orientation (mirrored for natural selfie look)
        scale(-1, 1);
      }
      image(selfieImage, 0, 0, diameter, diameter);
      pop();

      drawingContext.restore();

      pop();
    } else {
      // Placeholder when no selfie is captured
      fill(200);
      stroke(150);
      strokeWeight(3);
      ellipse(bodyX, bodyY, this.size, this.size);

      // Draw camera icon placeholder
      noStroke();
      fill(120);
      textAlign(CENTER, CENTER);
      textSize(40);
      text("📸", bodyX, bodyY);

      textSize(14);
      fill(100);
      text("Select Selfie", bodyX, bodyY + 50);
    }
  }
}

// Camera functions
function openCamera() {
  const modal = document.getElementById('camera-modal');
  const video = document.getElementById('camera-video');

  modal.classList.remove('hidden');

  // Request camera access
  navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'user',
      width: { ideal: 640 },
      height: { ideal: 480 }
    }
  })
  .then(stream => {
    cameraStream = stream;
    video.srcObject = stream;
  })
  .catch(err => {
    console.error('Camera access denied:', err);
    alert('Could not access camera. Please allow camera access and try again.');
    closeCamera();
  });
}

function closeCamera() {
  const modal = document.getElementById('camera-modal');
  const video = document.getElementById('camera-video');

  modal.classList.add('hidden');

  // Stop camera stream
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
  video.srcObject = null;
}

function capturePhoto() {
  const video = document.getElementById('camera-video');

  // Create a canvas to capture the frame
  const captureCanvas = document.createElement('canvas');
  const size = Math.min(video.videoWidth, video.videoHeight);
  captureCanvas.width = size;
  captureCanvas.height = size;

  const ctx = captureCanvas.getContext('2d');

  // Calculate crop to get square from center
  const offsetX = (video.videoWidth - size) / 2;
  const offsetY = (video.videoHeight - size) / 2;

  // Draw the center square of the video
  ctx.drawImage(video, offsetX, offsetY, size, size, 0, 0, size, size);

  // Convert to p5.js image
  selfieImage = loadImage(captureCanvas.toDataURL('image/png'), () => {
    // Image loaded, recreate animals to use it
    createAnimals();
  });

  closeCamera();
}

// Sound recording functions
var isCountingDown = false; // Track if countdown is in progress

function startRecording() {
  const recordBtn = document.getElementById('record-sound-btn');
  const recordingStatus = document.getElementById('recording-status');

  // Prevent starting if already counting down
  if (isCountingDown) return;

  // Start countdown
  isCountingDown = true;
  recordBtn.disabled = true;
  recordBtn.textContent = '3...';
  recordingStatus.textContent = 'Get ready...';
  recordingStatus.classList.add('recording');

  setTimeout(() => {
    recordBtn.textContent = '2...';
  }, 1000);

  setTimeout(() => {
    recordBtn.textContent = '1...';
  }, 2000);

  // After 3 seconds, start actual recording
  setTimeout(() => {
    isCountingDown = false;
    recordBtn.disabled = false;
    actuallyStartRecording();
  }, 3000);
}

// Trim silence from beginning and end of audio buffer
async function trimSilence(audioBlob) {
  const arrayBuffer = await audioBlob.arrayBuffer();
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0); // Get first channel
    const sampleRate = audioBuffer.sampleRate;

    // Find first non-silent sample (threshold-based)
    const threshold = 0.01; // Adjust sensitivity
    let startSample = 0;
    let endSample = channelData.length - 1;

    // Find start (first sample above threshold)
    for (let i = 0; i < channelData.length; i++) {
      if (Math.abs(channelData[i]) > threshold) {
        // Add small buffer before sound (50ms)
        startSample = Math.max(0, i - Math.floor(sampleRate * 0.05));
        break;
      }
    }

    // Find end (last sample above threshold)
    for (let i = channelData.length - 1; i >= 0; i--) {
      if (Math.abs(channelData[i]) > threshold) {
        // Add small buffer after sound (100ms)
        endSample = Math.min(channelData.length - 1, i + Math.floor(sampleRate * 0.1));
        break;
      }
    }

    // Create trimmed buffer
    const trimmedLength = endSample - startSample + 1;
    const trimmedBuffer = audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      trimmedLength,
      sampleRate
    );

    // Copy trimmed data to new buffer
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const sourceData = audioBuffer.getChannelData(channel);
      const destData = trimmedBuffer.getChannelData(channel);
      for (let i = 0; i < trimmedLength; i++) {
        destData[i] = sourceData[startSample + i];
      }
    }

    // Convert back to blob (WAV format for better compatibility)
    const wavBlob = audioBufferToWav(trimmedBuffer);
    audioContext.close();
    return wavBlob;
  } catch (err) {
    console.error('Error trimming audio:', err);
    audioContext.close();
    return audioBlob; // Return original if trimming fails
  }
}

// Convert AudioBuffer to WAV Blob
function audioBufferToWav(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const dataLength = buffer.length * blockAlign;
  const bufferLength = 44 + dataLength;

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  // Write WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  // Write audio data
  const offset = 44;
  const channelData = [];
  for (let i = 0; i < numChannels; i++) {
    channelData.push(buffer.getChannelData(i));
  }

  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channelData[channel][i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset + (i * blockAlign) + (channel * bytesPerSample), intSample, true);
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function actuallyStartRecording() {
  const recordBtn = document.getElementById('record-sound-btn');
  const recordingStatus = document.getElementById('recording-status');

  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      audioChunks = [];
      mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (e) => {
        audioChunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        // Stop the audio stream
        stream.getTracks().forEach(track => track.stop());

        recordingStatus.textContent = 'Processing...';

        // Create audio blob and trim silence
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const trimmedBlob = await trimSilence(audioBlob);

        // Revoke old URL if exists
        if (recordedSoundURL) {
          URL.revokeObjectURL(recordedSoundURL);
        }

        recordedSoundURL = URL.createObjectURL(trimmedBlob);

        // Create Tone.js Player with recorded sound
        if (recordedSoundPlayer) {
          recordedSoundPlayer.dispose();
        }
        recordedSoundPlayer = new Tone.Player(recordedSoundURL).toMaster();

        recordingStatus.textContent = '✓ Sound recorded & trimmed!';
        recordingStatus.classList.remove('recording');
      };

      mediaRecorder.start();
      recordBtn.textContent = '⏹ Stop Recording';
      recordBtn.classList.add('recording');
      recordingStatus.textContent = 'Recording...';
      recordingStatus.classList.add('recording');

      // Auto-stop after 2 seconds for a short sound
      setTimeout(() => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
          stopRecording();
        }
      }, 2000);
    })
    .catch(err => {
      console.error('Microphone access denied:', err);
      recordingStatus.textContent = 'Microphone access denied';
    });
}

function stopRecording() {
  const recordBtn = document.getElementById('record-sound-btn');

  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    recordBtn.textContent = '🎤 Record Sound';
    recordBtn.classList.remove('recording');
  }
}

function toggleRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    stopRecording();
  } else {
    startRecording();
  }
}

// Initialize camera button listeners
function initCameraListeners() {
  const captureBtn = document.getElementById('capture-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const recordBtn = document.getElementById('record-sound-btn');

  if (captureBtn) {
    captureBtn.addEventListener('click', capturePhoto);
  }
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      closeCamera();
      // Revert to previous animal if no selfie was taken
      if (!selfieImage) {
        document.getElementById('animal-selector').value = 'pig';
        animalType = 'pig';
        createAnimals();
      }
    });
  }
  if (recordBtn) {
    recordBtn.addEventListener('click', toggleRecording);
  }

  // Mirror selfies checkbox
  const mirrorCheckbox = document.getElementById('mirror-selfies');
  if (mirrorCheckbox) {
    mirrorCheckbox.addEventListener('change', (e) => {
      mirrorSelfies = e.target.checked;
    });
  }
}

// Initialize settings modal listeners
function initSettingsListeners() {
  const settingsBtn = document.getElementById('settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const settingsCloseBtn = document.getElementById('settings-close-btn');
  const timeSignatureSelect = document.getElementById('time-signature');
  const subdivisionSelect = document.getElementById('subdivision');
  const accentCheckbox = document.getElementById('accent-enabled');

  // Open settings modal
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      settingsModal.classList.remove('hidden');
    });
  }

  // Close settings modal
  if (settingsCloseBtn) {
    settingsCloseBtn.addEventListener('click', () => {
      settingsModal.classList.add('hidden');
    });
  }

  // Close modal when clicking outside
  if (settingsModal) {
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) {
        settingsModal.classList.add('hidden');
      }
    });
  }

  // Time signature change
  if (timeSignatureSelect) {
    timeSignatureSelect.addEventListener('change', (e) => {
      beatsPerMeasure = parseInt(e.target.value);
      currentBeat = 0; // Reset to beat 1
    });
  }

  // Subdivision change
  if (subdivisionSelect) {
    subdivisionSelect.addEventListener('change', (e) => {
      subdivision = e.target.value;
    });
  }

  // Animal sound toggle
  const animalSoundCheckbox = document.getElementById('animal-sound-enabled');
  if (animalSoundCheckbox) {
    animalSoundCheckbox.addEventListener('change', (e) => {
      animalSoundEnabled = e.target.checked;
    });
  }

  // Accent toggle
  if (accentCheckbox) {
    accentCheckbox.addEventListener('change', (e) => {
      accentEnabled = e.target.checked;
    });
  }

  // Flash toggle
  const flashCheckbox = document.getElementById('flash-enabled');
  if (flashCheckbox) {
    flashCheckbox.addEventListener('change', (e) => {
      flashEnabled = e.target.checked;
    });
  }

  // Voice count toggle
  const voiceCountCheckbox = document.getElementById('voice-count-enabled');
  if (voiceCountCheckbox) {
    voiceCountCheckbox.addEventListener('change', (e) => {
      voiceCountEnabled = e.target.checked;
    });
  }

  // Circle color picker
  const circleColorPicker = document.getElementById('circle-color');
  if (circleColorPicker) {
    circleColorPicker.addEventListener('input', (e) => {
      circleColor = e.target.value;
    });
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

// Selfie clap synth - snappy percussive sound
var selfieSynth = new Tone.NoiseSynth({
  noise: { type: "white" },
  envelope: {
    attack: 0.001,
    decay: 0.15,
    sustain: 0,
    release: 0.1
  }
}).toMaster();

// Circle click synth - clean metronome tick
var circleSynth = new Tone.Synth({
  oscillator: { type: "sine" },
  envelope: {
    attack: 0.001,
    decay: 0.1,
    sustain: 0,
    release: 0.05
  }
}).toMaster();

// Subdivision click synth - soft tick for subdivisions
var subdivisionSynth = new Tone.Synth({
  oscillator: { type: "triangle" },
  envelope: {
    attack: 0.001,
    decay: 0.05,
    sustain: 0,
    release: 0.05
  }
}).toMaster();
subdivisionSynth.volume.value = -12; // Quieter than main beat

// Accent synth - louder, higher-pitched click for beat 1
var accentSynth = new Tone.Synth({
  oscillator: { type: "triangle" },
  envelope: {
    attack: 0.001,
    decay: 0.1,
    sustain: 0,
    release: 0.05
  }
}).toMaster();
accentSynth.volume.value = 0; // Audible accent level

// TriggerSound Play - switches based on animal type
function triggerSound(time, isAccent = false){
  // Play accent on beat 1 if enabled (higher pitched click)
  if (isAccent && accentEnabled) {
    accentSynth.triggerAttackRelease("G5", "16n", time);
  }

  // Play animal sound if enabled
  if (!animalSoundEnabled) return;

  switch(animalType) {
    case 'circle':
      circleSynth.triggerAttackRelease("A4", "16n", time);
      break;
    case 'pig':
      pigPlayer.start(time);
      break;
    case 'selfie':
      // Use recorded sound if available, otherwise use default synth
      if (recordedSoundPlayer && recordedSoundPlayer.loaded) {
        recordedSoundPlayer.start(time);
      } else {
        selfieSynth.triggerAttackRelease("8n", time);
      }
      break;
    default:
      pigPlayer.start(time);
  }
}

// Play subdivision sound
function triggerSubdivision(time) {
  subdivisionSynth.triggerAttackRelease("C5", "32n", time);
}

// Subdivision event IDs (to cancel when settings change)
var subdivisionEvents = [];

// Schedule main beat sound
function scheduleMainBeat() {
  Tone.Transport.scheduleRepeat(function(time) {
    // Determine if this is beat 1 (accented)
    const isAccent = currentBeat === 0;
    triggerSound(time, isAccent);

    // Schedule subdivisions for this beat
    scheduleSubdivisionsForBeat(time);

    // Store beat number before it gets incremented
    const beatToSpeak = currentBeat + 1; // 1-indexed for speaking

    // Speak beat number immediately (before Tone.Draw) to compensate for speech synthesis latency
    speakBeatNumber(beatToSpeak);

    // Reset animation timer to sync with beat
    Tone.Draw.schedule(function(){
      t = 0;
      // Record when this beat fired for animation sync
      lastBeatTime = Tone.now();
      // Update cached BPM only if it changed
      const currentBPM = Tone.Transport.bpm.value;
      if (cachedBPM !== currentBPM) {
        cachedBPM = currentBPM;
        secondsPerBeat = 1 / (currentBPM / 60);
      }
    }, time);

    // Advance beat counter
    currentBeat = (currentBeat + 1) % beatsPerMeasure;
  }, "4n");
}

// Schedule subdivisions for a single beat
// Uses direct synth triggering with audio context time for precise timing
function scheduleSubdivisionsForBeat(beatTime) {
  if (subdivision === 'none') return;

  const beatDuration = Tone.Time("4n").toSeconds();

  switch(subdivision) {
    case 'eighth':
      // One subdivision at the halfway point
      subdivisionSynth.triggerAttackRelease("C5", "32n", beatTime + beatDuration / 2);
      break;

    case 'triplet':
      // Two subdivisions dividing beat into thirds
      subdivisionSynth.triggerAttackRelease("C5", "32n", beatTime + beatDuration / 3);
      subdivisionSynth.triggerAttackRelease("C5", "32n", beatTime + (beatDuration * 2) / 3);
      break;

    case 'sixteenth':
      // Three subdivisions dividing beat into quarters
      subdivisionSynth.triggerAttackRelease("C5", "32n", beatTime + beatDuration / 4);
      subdivisionSynth.triggerAttackRelease("C5", "32n", beatTime + beatDuration / 2);
      subdivisionSynth.triggerAttackRelease("C5", "32n", beatTime + (beatDuration * 3) / 4);
      break;
  }
}

// Initialize the main beat schedule
scheduleMainBeat();


//start/stop the transport
document.querySelector('tone-play-toggle').addEventListener('change', e => {
  Tone.Transport.toggle();
  // Reset beat counter when stopping so next play starts on beat 1
  if (Tone.Transport.state !== 'started') {
    currentBeat = 0;
  }
})

//update BPM from slider
document.querySelector('tone-slider').addEventListener('change', e => {
  Tone.Transport.bpm.value = e.detail;
  cachedBPM = e.detail;
  secondsPerBeat = 1 / (e.detail / 60);
})

// Show/hide color picker based on animation type
function updateColorPickerVisibility() {
  const colorPickerGroup = document.getElementById('color-picker-group');
  if (colorPickerGroup) {
    colorPickerGroup.style.display = (animalType === 'circle') ? '' : 'none';
  }
}

// Function to create animals based on selected type
function createAnimals() {
  switch(animalType) {
    case 'circle':
      animal1 = new Circle(1);
      animal2 = new Circle(-1);
      break;
    case 'pig':
      animal1 = new Pig(1);
      animal2 = new Pig(-1);
      break;
    case 'selfie':
      animal1 = new Selfie(1);
      animal2 = new Selfie(-1);
      break;
    default:
      animal1 = new Circle(1);
      animal2 = new Circle(-1);
      break;
  }
}

// Setup p5.js canvas
function setup() {
  // Calculate responsive canvas size
  const size = getCanvasSize();
  canvasWidth = size.width;
  canvasHeight = size.height;
  canvasScale = size.scale;

  var canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent(document.querySelector('.canvas-wrapper'));
  frameRate(120); // Higher frame rate for smoother animation at fast tempos
  xpos = canvasWidth / 2 + rad;

  // Create 2 animal instances
  createAnimals();

  // Initialize camera listeners for selfie feature
  initCameraListeners();

  // Initialize settings modal listeners
  initSettingsListeners();

  document.querySelector('#animal-selector').addEventListener('change', e => {
    animalType = e.target.value;

    // Show/hide color picker based on animation type
    updateColorPickerVisibility();

    // Always open camera when selfie is selected (allows retaking)
    if (animalType === 'selfie') {
      openCamera();
    }

    createAnimals(); // Recreate animals when selection changes
  });

  // Bounce direction dropdown
  document.querySelector('#bounce-direction').addEventListener('change', e => {
    bounceDirection = e.target.value;
  });

  // Initial color picker visibility
  updateColorPickerVisibility();

  // Tempo marking dropdown - sets BPM based on Italian tempo terms
  document.querySelector('#tempo-marking').addEventListener('change', e => {
    const bpm = parseInt(e.target.value);
    if (bpm) {
      Tone.Transport.bpm.value = bpm;
      cachedBPM = bpm;
      secondsPerBeat = 1 / (bpm / 60);
      // Update the slider display
      const slider = document.querySelector('tone-slider');
      if (slider) {
        slider.setAttribute('value', bpm);
      }
    }
  });
}

// Handle window resize for responsive canvas
function windowResized() {
  const size = getCanvasSize();
  canvasWidth = size.width;
  canvasHeight = size.height;
  canvasScale = size.scale;
  resizeCanvas(canvasWidth, canvasHeight);
}


function draw() {
  // Flash white at beat (when progress is near 0) if enabled
  const progress = getAnimationProgress();
  if (flashEnabled && Tone.Transport.state === 'started' && progress < 0.08) {
    background('white');
  } else {
    background('#696969');
  }

  // Scale all drawing to fit responsive canvas
  push();
  scale(canvasScale);

  if (bounceDirection === 'vertical') {
    // Vertical mode: one object bouncing against a horizontal line
    const lineY = 420;

    // Draw the horizontal line
    stroke(200);
    strokeWeight(4);
    line(120, lineY, 520, lineY);
    noStroke();

    // Position the single animal at center X, vertical Y
    animal1.x = 320; // Center of 640 width
    animal1.y = getVerticalY();
    animal1.display();
  } else {
    // Horizontal mode: two objects bouncing toward each other
    animal1.pigmove();
    animal2.pigmove();

    animal1.display();
    animal2.display();
  }

  pop();
}
