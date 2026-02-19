#!/usr/bin/env python3
"""Generate formant-synthesized voice WAV samples for metronome beat counting.

Each number (1-9) plus "ready" and "go" is synthesized using parallel formant
synthesis: a glottal-pulse source is filtered through resonant bandpass filters
at the characteristic vowel formant frequencies (F1, F2, F3), producing short,
robotic-but-recognizable spoken numbers.

The output WAV files are placed in sounds/voice/ and loaded by the metronome
as Tone.js Players for sample-accurate scheduling.
"""

import math
import os
import struct
import wave
import random

SAMPLE_RATE = 22050
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sounds", "voice")


# ---------------------------------------------------------------------------
# Formant data for each word.
#
# Each entry is a list of "segments" played in sequence.  A segment is:
#   {
#     "dur":      duration in ms,
#     "f0":       fundamental frequency (Hz),
#     "formants": [(F1, BW1), (F2, BW2), (F3, BW3)],
#     "noise":    0.0-1.0  amount of noise mixed into source (for fricatives),
#     "gain":     overall amplitude multiplier,
#   }
#
# For diphthongs the formants transition linearly between segments.
# ---------------------------------------------------------------------------

WORDS = {
    "1": [  # "one" /wʌn/ — brief w-glide into ʌ vowel, nasal tail
        {"dur": 30, "f0": 140, "formants": [(310, 60), (870, 80), (2250, 140)],
         "noise": 0.0, "gain": 0.5},   # w onset (uː-like)
        {"dur": 130, "f0": 135, "formants": [(640, 70), (1200, 90), (2400, 150)],
         "noise": 0.0, "gain": 1.0},   # ʌ vowel
        {"dur": 30, "f0": 125, "formants": [(400, 80), (1100, 100), (2400, 140)],
         "noise": 0.0, "gain": 0.6},   # nasal n tail
    ],
    "2": [  # "two" /tuː/ — t-burst into uː
        {"dur": 25, "f0": 150, "formants": [(400, 200), (1600, 200), (3000, 200)],
         "noise": 0.9, "gain": 0.4},   # t burst
        {"dur": 150, "f0": 148, "formants": [(310, 55), (870, 70), (2250, 130)],
         "noise": 0.0, "gain": 1.0},   # uː vowel
    ],
    "3": [  # "three" /θriː/ — θr noise into iː
        {"dur": 40, "f0": 160, "formants": [(300, 200), (1700, 200), (2800, 200)],
         "noise": 0.8, "gain": 0.3},   # θr fricative
        {"dur": 140, "f0": 158, "formants": [(270, 50), (2290, 90), (3010, 140)],
         "noise": 0.0, "gain": 1.0},   # iː vowel
    ],
    "4": [  # "four" /fɔːr/ — f-noise into ɔː
        {"dur": 30, "f0": 145, "formants": [(400, 200), (1400, 200), (2800, 200)],
         "noise": 0.85, "gain": 0.3},  # f fricative
        {"dur": 150, "f0": 142, "formants": [(500, 60), (700, 75), (2400, 140)],
         "noise": 0.0, "gain": 1.0},   # ɔː vowel
    ],
    "5": [  # "five" /faɪv/ — f-noise into aɪ diphthong
        {"dur": 25, "f0": 152, "formants": [(400, 200), (1400, 200), (2800, 200)],
         "noise": 0.85, "gain": 0.3},  # f fricative
        {"dur": 80, "f0": 150, "formants": [(750, 70), (1100, 90), (2400, 150)],
         "noise": 0.0, "gain": 1.0},   # a vowel
        {"dur": 70, "f0": 140, "formants": [(400, 55), (1920, 90), (2550, 140)],
         "noise": 0.0, "gain": 0.8},   # ɪ glide
    ],
    "6": [  # "six" /sɪks/ — s-noise into ɪ, k stop
        {"dur": 35, "f0": 165, "formants": [(400, 200), (2200, 200), (3500, 200)],
         "noise": 0.95, "gain": 0.35},  # s fricative (high-freq noise)
        {"dur": 120, "f0": 162, "formants": [(400, 55), (1920, 85), (2550, 140)],
         "noise": 0.0, "gain": 1.0},   # ɪ vowel
        {"dur": 20, "f0": 155, "formants": [(400, 200), (1500, 200), (2500, 200)],
         "noise": 0.7, "gain": 0.3},   # ks tail
    ],
    "7": [  # "seven" /sɛvən/ — s into ɛ, brief schwa
        {"dur": 35, "f0": 155, "formants": [(400, 200), (2200, 200), (3500, 200)],
         "noise": 0.95, "gain": 0.35},  # s fricative
        {"dur": 90, "f0": 152, "formants": [(530, 60), (1840, 90), (2480, 145)],
         "noise": 0.0, "gain": 1.0},   # ɛ vowel
        {"dur": 50, "f0": 135, "formants": [(500, 70), (1500, 100), (2400, 150)],
         "noise": 0.05, "gain": 0.6},  # vən tail
    ],
    "8": [  # "eight" /eɪt/ — eɪ diphthong, t-burst tail
        {"dur": 100, "f0": 155, "formants": [(500, 60), (1770, 85), (2480, 140)],
         "noise": 0.0, "gain": 1.0},   # e vowel
        {"dur": 60, "f0": 148, "formants": [(400, 55), (1920, 85), (2550, 140)],
         "noise": 0.0, "gain": 0.85},  # ɪ glide
        {"dur": 15, "f0": 140, "formants": [(400, 200), (1600, 200), (3000, 200)],
         "noise": 0.8, "gain": 0.3},   # t burst
    ],
    "9": [  # "nine" /naɪn/ — nasal n into aɪ diphthong, nasal tail
        {"dur": 35, "f0": 148, "formants": [(400, 80), (1100, 100), (2400, 140)],
         "noise": 0.0, "gain": 0.5},   # n onset (nasal)
        {"dur": 75, "f0": 150, "formants": [(750, 70), (1100, 90), (2400, 150)],
         "noise": 0.0, "gain": 1.0},   # a vowel
        {"dur": 55, "f0": 142, "formants": [(400, 55), (1920, 90), (2550, 140)],
         "noise": 0.0, "gain": 0.8},   # ɪ glide
        {"dur": 25, "f0": 130, "formants": [(400, 80), (1100, 100), (2400, 140)],
         "noise": 0.0, "gain": 0.4},   # n tail
    ],
    "ready": [  # /rɛdi/
        {"dur": 30, "f0": 160, "formants": [(350, 80), (1400, 100), (2400, 150)],
         "noise": 0.1, "gain": 0.5},   # r onset
        {"dur": 80, "f0": 158, "formants": [(530, 60), (1840, 90), (2480, 145)],
         "noise": 0.0, "gain": 1.0},   # ɛ vowel
        {"dur": 25, "f0": 155, "formants": [(350, 80), (1700, 100), (2500, 150)],
         "noise": 0.0, "gain": 0.6},   # d stop
        {"dur": 60, "f0": 165, "formants": [(270, 50), (2290, 90), (3010, 140)],
         "noise": 0.0, "gain": 0.8},   # i vowel
    ],
    "go": [  # /goʊ/
        {"dur": 15, "f0": 130, "formants": [(300, 150), (1200, 150), (2500, 200)],
         "noise": 0.3, "gain": 0.3},   # g onset
        {"dur": 120, "f0": 138, "formants": [(460, 60), (1100, 80), (2400, 140)],
         "noise": 0.0, "gain": 1.0},   # o vowel
        {"dur": 50, "f0": 128, "formants": [(370, 55), (950, 70), (2400, 140)],
         "noise": 0.0, "gain": 0.7},   # ʊ glide
    ],
}


# ---------------------------------------------------------------------------
# DSP helpers
# ---------------------------------------------------------------------------

def generate_source(f0, num_samples, noise_amount=0.0):
    """Glottal pulse train + optional noise for fricatives.

    The pulse train is a band-limited sum of harmonics with -12 dB/octave
    rolloff, approximating a natural glottal source.
    """
    result = [0.0] * num_samples
    max_harmonic = min(int(SAMPLE_RATE / (2 * f0)), 50)

    for h in range(1, max_harmonic + 1):
        amp = 1.0 / (h * h)  # -12 dB/octave
        freq = f0 * h
        if freq >= SAMPLE_RATE / 2:
            break
        for i in range(num_samples):
            result[i] += amp * math.sin(2.0 * math.pi * freq * i / SAMPLE_RATE)

    # Mix in noise for fricative segments
    if noise_amount > 0:
        rng = random.Random(42)  # deterministic for reproducibility
        for i in range(num_samples):
            n = (rng.random() * 2 - 1)
            result[i] = result[i] * (1 - noise_amount) + n * noise_amount

    return result


def biquad_bandpass(samples, freq, bandwidth):
    """2nd-order resonant bandpass filter (biquad)."""
    if freq <= 0 or freq >= SAMPLE_RATE / 2:
        return samples[:]

    w0 = 2.0 * math.pi * freq / SAMPLE_RATE
    q = max(0.5, freq / max(1, bandwidth))
    alpha = math.sin(w0) / (2.0 * q)

    b0 = alpha
    b1 = 0.0
    b2 = -alpha
    a0 = 1.0 + alpha
    a1 = -2.0 * math.cos(w0)
    a2 = 1.0 - alpha

    # Normalize
    b0 /= a0; b1 /= a0; b2 /= a0
    a1 /= a0; a2 /= a0

    x1 = x2 = y1 = y2 = 0.0
    out = []
    for x0 in samples:
        y0 = b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2
        out.append(y0)
        x2, x1 = x1, x0
        y2, y1 = y1, y0
    return out


def synthesize_segment(seg, num_samples):
    """Parallel formant synthesis for one segment."""
    source = generate_source(seg["f0"], num_samples, seg.get("noise", 0))

    # Filter through each formant in parallel and sum
    mixed = [0.0] * num_samples
    formants = seg["formants"]

    # Amplitude weights for parallel combination:
    # F1 carries most energy, F2 and F3 add intelligibility
    weights = [1.0, 0.7, 0.4]

    for idx, (freq, bw) in enumerate(formants):
        filtered = biquad_bandpass(source, freq, bw)
        w = weights[idx] if idx < len(weights) else 0.3
        for i in range(num_samples):
            mixed[i] += filtered[i] * w

    # Apply gain
    gain = seg.get("gain", 1.0)
    return [s * gain for s in mixed]


def crossfade(seg_a, seg_b, overlap_samples):
    """Crossfade between two sample buffers for smooth transitions."""
    if overlap_samples <= 0:
        return seg_a + seg_b

    result = seg_a[:-overlap_samples]
    for i in range(overlap_samples):
        t = i / overlap_samples
        fade_out = seg_a[len(seg_a) - overlap_samples + i] * (1 - t)
        fade_in = seg_b[i] * t
        result.append(fade_out + fade_in)
    result.extend(seg_b[overlap_samples:])
    return result


def synthesize_word(segments):
    """Synthesize a complete word from its segments with crossfaded transitions."""
    overlap_ms = 8  # ms of crossfade between segments
    overlap_samples = int(overlap_ms / 1000.0 * SAMPLE_RATE)

    buffers = []
    for seg in segments:
        n = int(seg["dur"] / 1000.0 * SAMPLE_RATE)
        if n < 1:
            continue
        buffers.append(synthesize_segment(seg, n))

    if not buffers:
        return [0.0]

    # Join segments with crossfades
    result = buffers[0]
    for buf in buffers[1:]:
        result = crossfade(result, buf, min(overlap_samples, len(result) // 2, len(buf) // 2))

    # Global envelope: fast attack, sustain, quick release
    attack = int(0.003 * SAMPLE_RATE)   # 3 ms
    release = int(0.015 * SAMPLE_RATE)  # 15 ms
    release_start = max(0, len(result) - release)

    for i in range(len(result)):
        if i < attack:
            result[i] *= i / max(1, attack)
        elif i >= release_start:
            result[i] *= (len(result) - i) / max(1, release)

    # Normalize
    peak = max(abs(s) for s in result) or 1.0
    result = [s * 0.85 / peak for s in result]

    return result


def write_wav(filepath, samples):
    """Write mono 16-bit WAV."""
    with wave.open(filepath, "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        for s in samples:
            val = max(-32767, min(32767, int(s * 32767)))
            wf.writeframes(struct.pack("<h", val))


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    for name, segments in WORDS.items():
        samples = synthesize_word(segments)
        filepath = os.path.join(OUTPUT_DIR, f"{name}.wav")
        write_wav(filepath, samples)
        dur_ms = len(samples) / SAMPLE_RATE * 1000
        print(f"  {name}.wav  ({dur_ms:.0f} ms, {len(samples)} samples)")

    print(f"\nAll voice samples written to {OUTPUT_DIR}/")


if __name__ == "__main__":
    main()
