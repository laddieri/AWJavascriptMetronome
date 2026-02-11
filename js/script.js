// ===== VISUAL METRONOME - CSS ANIMATION VERSION =====
// Uses Tone.js for timing and CSS animations for smooth, hardware-accelerated visuals

var secondsPerBeat = 1;
var cachedBPM = 60;
var animalType = 'circle'; // 'circle', 'pig', 'selfie'
var circleColor = '#000000'; // Color for circle animation

// Selfie capture variables
var selfieImageDataURL = null;
var cameraStream = null;
var recordedSoundURL = null;
var recordedSoundPlayer = null;
var mediaRecorder = null;
var audioChunks = [];
var mirrorSelfies = true;

// Advanced metronome settings
var beatsPerMeasure = 4;
var currentBeat = 0;
var subdivision = 'none'; // 'none', 'eighth', 'triplet', 'sixteenth'
var animalSoundEnabled = true;
var accentEnabled = true;
var flashEnabled = true;
var voiceCountEnabled = false;
var lastBeatTime = 0;
var bounceDirection = 'horizontal'; // 'horizontal' or 'vertical'
var isFullscreen = false;

// DOM element references
var animationStage;
var animal1Element;
var animal2Element;
var bounceLine;

// Voice counting with Web Speech API
function speakBeatNumber(beatNumber) {
  if (!voiceCountEnabled) return;
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(String(beatNumber));
    utterance.rate = 1.5;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  }
}

// Store reference to main toggle's original parent
var mainToggleParent = null;

// Enter fullscreen mode
function enterFullscreen() {
  isFullscreen = true;
  const overlay = document.getElementById('fullscreen-overlay');
  const stage = document.getElementById('animation-stage');
  const fullscreenWrapper = document.querySelector('.fullscreen-canvas-wrapper');
  const mainToggle = document.querySelector('.controls tone-play-toggle');
  const togglePlaceholder = document.getElementById('fullscreen-toggle-placeholder');

  // Move stage to fullscreen wrapper
  if (stage && fullscreenWrapper) {
    fullscreenWrapper.appendChild(stage);
  }

  // Move play toggle to fullscreen controls
  if (mainToggle && togglePlaceholder) {
    mainToggleParent = mainToggle.parentElement;
    togglePlaceholder.appendChild(mainToggle);
  }

  // Show overlay
  overlay.classList.remove('hidden');

  // Sync tempo slider with current BPM
  const fullscreenSlider = document.getElementById('fullscreen-tempo-slider');
  if (fullscreenSlider) {
    fullscreenSlider.setAttribute('value', Tone.Transport.bpm.value);
  }
}

// Exit fullscreen mode
function exitFullscreen() {
  isFullscreen = false;
  const overlay = document.getElementById('fullscreen-overlay');
  const stage = document.querySelector('.fullscreen-canvas-wrapper #animation-stage');
  const normalWrapper = document.querySelector('.container > main > .canvas-wrapper');
  const mainToggle = document.querySelector('#fullscreen-toggle-placeholder tone-play-toggle');

  // Move stage back to normal wrapper
  if (stage && normalWrapper) {
    normalWrapper.appendChild(stage);
  }

  // Move play toggle back to main controls
  if (mainToggle && mainToggleParent) {
    mainToggleParent.appendChild(mainToggle);
  }

  // Hide overlay
  overlay.classList.add('hidden');

  // Sync main slider with current BPM
  const mainSlider = document.querySelector('.controls tone-slider');
  if (mainSlider) {
    mainSlider.setAttribute('value', Tone.Transport.bpm.value);
  }
}

// Initialize fullscreen listeners
function initFullscreenListeners() {
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const exitBtn = document.getElementById('fullscreen-exit-btn');
  const fullscreenSlider = document.getElementById('fullscreen-tempo-slider');

  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', enterFullscreen);
  }

  if (exitBtn) {
    exitBtn.addEventListener('click', exitFullscreen);
  }

  if (fullscreenSlider) {
    fullscreenSlider.addEventListener('change', e => {
      Tone.Transport.bpm.value = e.detail;
      cachedBPM = e.detail;
      secondsPerBeat = 1 / (e.detail / 60);
      const mainSlider = document.querySelector('.controls tone-slider');
      if (mainSlider) {
        mainSlider.setAttribute('value', e.detail);
      }
    });
  }

  // ESC key to exit fullscreen
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isFullscreen) {
      exitFullscreen();
    }
  });
}

// Camera functions
function openCamera() {
  const modal = document.getElementById('camera-modal');
  const video = document.getElementById('camera-video');

  modal.classList.remove('hidden');

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

  // Store as data URL
  selfieImageDataURL = captureCanvas.toDataURL('image/png');

  // Update selfie images
  updateSelfieImages();

  closeCamera();
}

// Sound recording functions
var isCountingDown = false;

function startRecording() {
  const recordBtn = document.getElementById('record-sound-btn');
  const recordingStatus = document.getElementById('recording-status');

  if (isCountingDown) return;

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
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;

    const threshold = 0.01;
    let startSample = 0;
    let endSample = channelData.length - 1;

    // Find start
    for (let i = 0; i < channelData.length; i++) {
      if (Math.abs(channelData[i]) > threshold) {
        startSample = Math.max(0, i - Math.floor(sampleRate * 0.05));
        break;
      }
    }

    // Find end
    for (let i = channelData.length - 1; i >= 0; i--) {
      if (Math.abs(channelData[i]) > threshold) {
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

    // Convert back to blob (WAV format)
    const wavBlob = audioBufferToWav(trimmedBuffer);
    audioContext.close();
    return wavBlob;
  } catch (err) {
    console.error('Error trimming audio:', err);
    audioContext.close();
    return audioBlob;
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
  view.setUint32(16, 16, true);
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
        stream.getTracks().forEach(track => track.stop());

        recordingStatus.textContent = 'Processing...';

        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const trimmedBlob = await trimSilence(audioBlob);

        if (recordedSoundURL) {
          URL.revokeObjectURL(recordedSoundURL);
        }

        recordedSoundURL = URL.createObjectURL(trimmedBlob);

        if (recordedSoundPlayer) {
          recordedSoundPlayer.dispose();
        }
        recordedSoundPlayer = new Tone.Player(recordedSoundURL).toDestination();

        recordingStatus.textContent = '✓ Sound recorded & trimmed!';
        recordingStatus.classList.remove('recording');
      };

      mediaRecorder.start();
      recordBtn.textContent = '⏹ Stop Recording';
      recordBtn.classList.add('recording');
      recordingStatus.textContent = 'Recording...';
      recordingStatus.classList.add('recording');

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
      if (!selfieImageDataURL) {
        document.getElementById('animal-selector').value = 'pig';
        animalType = 'pig';
        updateAnimationType();
      }
    });
  }
  if (recordBtn) {
    recordBtn.addEventListener('click', toggleRecording);
  }

  const mirrorCheckbox = document.getElementById('mirror-selfies');
  if (mirrorCheckbox) {
    mirrorCheckbox.addEventListener('change', (e) => {
      mirrorSelfies = e.target.checked;
      updateSelfieImages();
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

  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      settingsModal.classList.remove('hidden');
    });
  }

  if (settingsCloseBtn) {
    settingsCloseBtn.addEventListener('click', () => {
      settingsModal.classList.add('hidden');
    });
  }

  if (settingsModal) {
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) {
        settingsModal.classList.add('hidden');
      }
    });
  }

  if (timeSignatureSelect) {
    timeSignatureSelect.addEventListener('change', (e) => {
      beatsPerMeasure = parseInt(e.target.value);
      currentBeat = 0;
    });
  }

  if (subdivisionSelect) {
    subdivisionSelect.addEventListener('change', (e) => {
      subdivision = e.target.value;
    });
  }

  const animalSoundCheckbox = document.getElementById('animal-sound-enabled');
  if (animalSoundCheckbox) {
    animalSoundCheckbox.addEventListener('change', (e) => {
      animalSoundEnabled = e.target.checked;
    });
  }

  const accentCheckbox = document.getElementById('accent-enabled');
  if (accentCheckbox) {
    accentCheckbox.addEventListener('change', (e) => {
      accentEnabled = e.target.checked;
    });
  }

  const flashCheckbox = document.getElementById('flash-enabled');
  if (flashCheckbox) {
    flashCheckbox.addEventListener('change', (e) => {
      flashEnabled = e.target.checked;
    });
  }

  const voiceCountCheckbox = document.getElementById('voice-count-enabled');
  if (voiceCountCheckbox) {
    voiceCountCheckbox.addEventListener('change', (e) => {
      voiceCountEnabled = e.target.checked;
    });
  }

  const circleColorPicker = document.getElementById('circle-color');
  if (circleColorPicker) {
    circleColorPicker.addEventListener('input', (e) => {
      circleColor = e.target.value;
      updateCircleColors();
    });
  }
}

// Robust AudioContext resume handling
var audioContextResumed = false;

function resumeAudioContext() {
  if (audioContextResumed && Tone.context.state === 'running') return;

  if (Tone.context.state !== 'running') {
    Tone.context.resume().then(function() {
      audioContextResumed = true;
      Tone.Transport.bpm.value = cachedBPM || 60;
    }).catch(function(err) {
      console.warn('AudioContext resume failed, will retry on next interaction:', err);
    });
  } else {
    audioContextResumed = true;
  }
}

['mousedown', 'touchstart', 'keydown'].forEach(function(eventType) {
  document.documentElement.addEventListener(eventType, resumeAudioContext, { once: false });
});

// Audio context state monitoring
setInterval(function() {
  if (Tone.Transport.state === 'started' && Tone.context.state !== 'running') {
    console.warn('AudioContext suspended while playing, attempting resume...');
    Tone.context.resume();
  }
}, 1000);

// Tab visibility handling
var wasPlayingBeforeHidden = false;
var tabHiddenTime = 0;

document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    tabHiddenTime = Date.now();
    wasPlayingBeforeHidden = Tone.Transport.state === 'started';
  } else {
    var hiddenDuration = Date.now() - tabHiddenTime;

    if (Tone.context.state !== 'running') {
      Tone.context.resume();
    }

    if (wasPlayingBeforeHidden && hiddenDuration > 500) {
      lastBeatTime = Tone.now();
    }
  }
});

// Create sound players and synthesizers
var pigPlayer = new Tone.Player("./sounds/oink.wav").toDestination();

var selfieSynth = new Tone.NoiseSynth({
  noise: { type: "white" },
  envelope: {
    attack: 0.001,
    decay: 0.15,
    sustain: 0,
    release: 0.1
  }
}).toDestination();

var circleSynth = new Tone.Synth({
  oscillator: { type: "sine" },
  envelope: {
    attack: 0.001,
    decay: 0.1,
    sustain: 0,
    release: 0.05
  }
}).toDestination();

var subdivisionSynth = new Tone.Synth({
  oscillator: { type: "triangle" },
  envelope: {
    attack: 0.001,
    decay: 0.05,
    sustain: 0,
    release: 0.05
  }
}).toDestination();
subdivisionSynth.volume.value = -12;

var accentSynth = new Tone.Synth({
  oscillator: { type: "triangle" },
  envelope: {
    attack: 0.001,
    decay: 0.1,
    sustain: 0,
    release: 0.05
  }
}).toDestination();
accentSynth.volume.value = 0;

// Trigger sound based on animal type
function triggerSound(time, isAccent = false){
  if (isAccent && accentEnabled) {
    accentSynth.triggerAttackRelease("G5", "16n", time);
  }

  if (!animalSoundEnabled) return;

  switch(animalType) {
    case 'circle':
      circleSynth.triggerAttackRelease("A4", "16n", time);
      break;
    case 'pig':
      if (pigPlayer.state === 'started') {
        pigPlayer.stop(time);
      }
      pigPlayer.start(time);
      break;
    case 'selfie':
      if (recordedSoundPlayer && recordedSoundPlayer.loaded) {
        if (recordedSoundPlayer.state === 'started') {
          recordedSoundPlayer.stop(time);
        }
        recordedSoundPlayer.start(time);
      } else {
        selfieSynth.triggerAttackRelease("8n", time);
      }
      break;
    default:
      if (pigPlayer.state === 'started') {
        pigPlayer.stop(time);
      }
      pigPlayer.start(time);
  }
}

// Play subdivision sound
function triggerSubdivision(time) {
  subdivisionSynth.triggerAttackRelease("C5", "32n", time);
}

// Schedule subdivisions for a single beat
function scheduleSubdivisionsForBeat(beatTime) {
  if (subdivision === 'none') return;

  const beatDuration = Tone.Time("4n").toSeconds();

  switch(subdivision) {
    case 'eighth':
      subdivisionSynth.triggerAttackRelease("C5", "32n", beatTime + beatDuration / 2);
      break;

    case 'triplet':
      subdivisionSynth.triggerAttackRelease("C5", "32n", beatTime + beatDuration / 3);
      subdivisionSynth.triggerAttackRelease("C5", "32n", beatTime + (beatDuration * 2) / 3);
      break;

    case 'sixteenth':
      subdivisionSynth.triggerAttackRelease("C5", "32n", beatTime + beatDuration / 4);
      subdivisionSynth.triggerAttackRelease("C5", "32n", beatTime + beatDuration / 2);
      subdivisionSynth.triggerAttackRelease("C5", "32n", beatTime + (beatDuration * 3) / 4);
      break;
  }
}

// ===== CSS ANIMATION SYSTEM =====

// Trigger CSS animation on beat
function triggerCSSAnimation() {
  const beatDuration = 60 / Tone.Transport.bpm.value;

  // Handle flash effect
  if (flashEnabled) {
    animationStage.classList.add('flash');
    setTimeout(() => {
      animationStage.classList.remove('flash');
    }, beatDuration * 1000 * 0.08); // Flash for 8% of beat duration
  }

  // Reset and restart animations
  if (bounceDirection === 'horizontal') {
    // Remove animation class to reset
    animal1Element.style.animation = 'none';
    animal2Element.style.animation = 'none';

    // Force reflow to restart animation
    void animal1Element.offsetHeight;
    void animal2Element.offsetHeight;

    // Apply animation with current beat duration
    const animDuration = `${beatDuration}s`;
    animal1Element.style.animationDuration = animDuration;
    animal2Element.style.animationDuration = animDuration;

    // Determine animation class based on animal type and mirror setting
    if (animalType === 'selfie' && mirrorSelfies) {
      animal1Element.style.animation = `move-horizontal-left ${animDuration} ease-in-out both`;
      animal2Element.style.animation = `move-horizontal-right-mirror ${animDuration} ease-in-out both`;
    } else {
      animal1Element.style.animation = `move-horizontal-left ${animDuration} ease-in-out both`;
      animal2Element.style.animation = `move-horizontal-right ${animDuration} ease-in-out both`;
    }
  } else {
    // Vertical mode
    animal1Element.style.animation = 'none';
    void animal1Element.offsetHeight;

    const animDuration = `${beatDuration}s`;
    animal1Element.style.animationDuration = animDuration;
    animal1Element.style.animation = `bounce-vertical ${animDuration} ease-in-out both`;
  }
}

// Schedule main beat sound and animation
function scheduleMainBeat() {
  Tone.Transport.scheduleRepeat(function(time) {
    const isAccent = currentBeat === 0;
    triggerSound(time, isAccent);

    scheduleSubdivisionsForBeat(time);

    const beatToSpeak = currentBeat + 1;
    speakBeatNumber(beatToSpeak);

    // Trigger CSS animation on main thread
    Tone.Draw.schedule(function(){
      lastBeatTime = Tone.now();
      const currentBPM = Tone.Transport.bpm.value;
      if (cachedBPM !== currentBPM) {
        cachedBPM = currentBPM;
        secondsPerBeat = 1 / (currentBPM / 60);
      }

      // Trigger CSS animation
      triggerCSSAnimation();
    }, time);

    currentBeat = (currentBeat + 1) % beatsPerMeasure;
  }, "4n");
}

// Initialize the main beat schedule
scheduleMainBeat();

// Start/stop the transport
document.querySelector('tone-play-toggle').addEventListener('change', e => {
  if (Tone.context.state !== 'running') {
    Tone.context.resume().then(function() {
      toggleTransport();
    });
  } else {
    toggleTransport();
  }
})

function toggleTransport() {
  if (Tone.Transport.state === 'started') {
    Tone.Transport.stop();
    currentBeat = 0;
    lastBeatTime = 0;
  } else {
    currentBeat = 0;
    lastBeatTime = 0;
    Tone.Transport.start();
  }
}

// Update BPM from slider
document.querySelector('tone-slider').addEventListener('change', e => {
  Tone.Transport.bpm.value = e.detail;
  cachedBPM = e.detail;
  secondsPerBeat = 1 / (e.detail / 60);
})

// ===== ANIMATION TYPE MANAGEMENT =====

// Create pig SVG content
function createPigSVG() {
  const pigSVG = `
    <!-- Back legs -->
    <rect x="118" y="173" width="18" height="68" fill="rgb(250, 192, 196)"/>
    <rect x="53" y="171" width="18" height="68" fill="rgb(250, 192, 196)"/>

    <!-- Body -->
    <ellipse cx="125" cy="125" rx="122.5" ry="122.5" fill="rgb(250, 192, 196)"/>

    <!-- Left ear -->
    <polygon points="125,71 55,140 59,38" fill="rgb(163, 124, 127)"/>

    <!-- Right ear -->
    <polygon points="190,149 195,40 117,67" fill="rgb(163, 124, 127)"/>

    <!-- Ear fill -->
    <polygon points="151,187 190,48 87,101" fill="rgb(13, 13, 13)"/>
    <polygon points="125,94 73,163 66,48" fill="rgb(13, 13, 13)"/>

    <!-- Head -->
    <ellipse cx="125" cy="125" rx="77.5" ry="72" fill="rgb(217, 165, 169)"/>

    <!-- Nose -->
    <ellipse cx="125" cy="138" rx="35.5" ry="30" fill="rgb(224, 107, 117)"/>

    <!-- Nostrils -->
    <ellipse cx="115" cy="137" rx="5.5" ry="9.5" fill="rgb(0, 0, 0)"/>
    <ellipse cx="135" cy="137" rx="5.5" ry="9.5" fill="rgb(0, 0, 0)"/>

    <!-- Pupils -->
    <ellipse cx="108" cy="101" rx="3" ry="7.5" fill="rgb(0, 0, 0)"/>
    <ellipse cx="142" cy="101" rx="3" ry="7.5" fill="rgb(0, 0, 0)"/>

    <!-- Front legs -->
    <rect x="44" y="203" width="18" height="68" fill="rgb(250, 192, 196)"/>
    <rect x="176" y="197" width="18" height="68" fill="rgb(250, 192, 196)"/>

    <!-- Hooves -->
    <ellipse cx="53" cy="266" rx="10.5" ry="5.5" fill="rgb(8, 8, 8)"/>
    <ellipse cx="185" cy="266" rx="10.5" ry="5.5" fill="rgb(8, 8, 8)"/>
    <ellipse cx="62" cy="263" rx="9" ry="5" fill="rgb(8, 8, 8)"/>
    <ellipse cx="153" cy="263" rx="9" ry="5" fill="rgb(8, 8, 8)"/>
  `;

  const pig1 = document.getElementById('pig1');
  const pig2 = document.getElementById('pig2');
  if (pig1) pig1.innerHTML = pigSVG;
  if (pig2) pig2.innerHTML = pigSVG;
}

// Update selfie images
function updateSelfieImages() {
  const selfie1 = document.getElementById('selfie1');
  const selfie2 = document.getElementById('selfie2');

  if (selfieImageDataURL) {
    if (selfie1) selfie1.src = selfieImageDataURL;
    if (selfie2) selfie2.src = selfieImageDataURL;

    // Update mirror class based on setting
    if (mirrorSelfies) {
      selfie1.classList.remove('mirror');
      selfie2.classList.add('mirror');
    } else {
      selfie1.classList.add('mirror');
      selfie2.classList.add('mirror');
    }
  }
}

// Update circle colors
function updateCircleColors() {
  const circles = document.querySelectorAll('.animated-element');
  circles.forEach(circle => {
    circle.style.backgroundColor = circleColor;
  });
}

// Show/hide color picker based on animation type
function updateColorPickerVisibility() {
  const colorPickerGroup = document.getElementById('color-picker-group');
  if (colorPickerGroup) {
    colorPickerGroup.style.display = (animalType === 'circle') ? '' : 'none';
  }
}

// Update animation type display
function updateAnimationType() {
  // Hide all elements
  document.querySelectorAll('.animated-element').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.selfie-img').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.pig-svg').forEach(el => el.classList.remove('active'));
  bounceLine.classList.remove('active');

  // Update which elements to show based on mode and type
  if (bounceDirection === 'horizontal') {
    // Show two elements
    if (animalType === 'circle') {
      animal1Element = document.getElementById('animal1');
      animal2Element = document.getElementById('animal2');
      animal1Element.classList.add('active');
      animal2Element.classList.add('active');
      updateCircleColors();
    } else if (animalType === 'pig') {
      animal1Element = document.getElementById('pig1');
      animal2Element = document.getElementById('pig2');
      animal1Element.classList.add('active');
      animal2Element.classList.add('active');
    } else if (animalType === 'selfie') {
      animal1Element = document.getElementById('selfie1');
      animal2Element = document.getElementById('selfie2');
      animal1Element.classList.add('active');
      animal2Element.classList.add('active');
      updateSelfieImages();
    }
  } else {
    // Vertical mode - show one element and line
    bounceLine.classList.add('active');
    if (animalType === 'circle') {
      animal1Element = document.getElementById('animal1');
      animal2Element = null;
      animal1Element.classList.add('active');
      updateCircleColors();
    } else if (animalType === 'pig') {
      animal1Element = document.getElementById('pig1');
      animal2Element = null;
      animal1Element.classList.add('active');
    } else if (animalType === 'selfie') {
      animal1Element = document.getElementById('selfie1');
      animal2Element = null;
      animal1Element.classList.add('active');
      updateSelfieImages();
    }
  }

  updateColorPickerVisibility();
}

// ===== INITIALIZATION =====

function init() {
  // Get DOM references
  animationStage = document.getElementById('animation-stage');
  bounceLine = document.getElementById('bounce-line');

  // Initialize camera listeners
  initCameraListeners();

  // Initialize settings modal listeners
  initSettingsListeners();

  // Initialize fullscreen listeners
  initFullscreenListeners();

  // Create pig SVG
  createPigSVG();

  // Animal selector
  document.querySelector('#animal-selector').addEventListener('change', e => {
    animalType = e.target.value;

    if (animalType === 'selfie') {
      openCamera();
    }

    updateAnimationType();
  });

  // Bounce direction dropdown
  document.querySelector('#bounce-direction').addEventListener('change', e => {
    bounceDirection = e.target.value;
    updateAnimationType();
  });

  // Tempo marking dropdown
  document.querySelector('#tempo-marking').addEventListener('change', e => {
    const bpm = parseInt(e.target.value);
    if (bpm) {
      Tone.Transport.bpm.value = bpm;
      cachedBPM = bpm;
      secondsPerBeat = 1 / (bpm / 60);
      const slider = document.querySelector('tone-slider');
      if (slider) {
        slider.setAttribute('value', bpm);
      }
    }
  });

  // Initialize animation type
  updateAnimationType();
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
