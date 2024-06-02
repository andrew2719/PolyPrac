let isInteractiveMode = false;
let parts = [];

document.getElementById('start-button').addEventListener('click', () => {
    const bpm = parseInt(document.getElementById('bpm').value);
    const beatsLeft = parseInt(document.getElementById('beats-left').value);
    const beatsRight = parseInt(document.getElementById('beats-right').value);

    // Set the BPM
    Tone.Transport.bpm.value = bpm;

    // Clear previous events
    Tone.Transport.cancel();

    // Create different synths for sound generation
    const leftSynth = new Tone.MembraneSynth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4, attackCurve: 'exponential' }
    }).toDestination();

    const rightSynth = new Tone.MetalSynth({
        frequency: 200,
        envelope: { attack: 0.001, decay: 1.4, release: 0.2 },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5
    }).toDestination();

    // Create sequencers
    const measureLeft = document.getElementById('measure-left');
    const measureRight = document.getElementById('measure-right');
    const measureCombinedLeft = document.getElementById('measure-combined-left');
    const measureCombinedRight = document.getElementById('measure-combined-right');

    measureLeft.innerHTML = '';
    measureRight.innerHTML = '';
    measureCombinedLeft.innerHTML = '';
    measureCombinedRight.innerHTML = '';

    createMeasure(beatsLeft, measureLeft);
    createMeasure(beatsRight, measureRight);
    createMeasure(beatsLeft, measureCombinedLeft);
    createMeasure(beatsRight, measureCombinedRight);

    const measureLength = (60 / bpm) * 4; // Length of one measure in seconds

    // Function to create the measure lines
    function createMeasure(beats, measure) {
        const interval = 100 / beats; // Calculate interval as percentage
        for (let i = 0; i < beats; i++) {
            const beat = document.createElement('div');
            beat.classList.add('beat');
            beat.style.left = `${i * interval}%`;
            measure.appendChild(beat);
        }
    }

    // Function to schedule the visual beats using Tone.Part
    function scheduleVisualBeats(beats, measure, measureLength) {
        const interval = measureLength / beats;
        const part = new Tone.Part((time, value) => {
            // Visual feedback
            Tone.Draw.schedule(() => {
                const beatElement = measure.children[value];
                beatElement.classList.add('active');
                setTimeout(() => {
                    beatElement.classList.remove('active');
                }, Tone.Time('8n').toMilliseconds());
            }, time);
        }, Array.from({ length: beats }, (_, i) => [i * interval, i]));

        part.loop = true;
        part.loopEnd = measureLength;
        part.start(0);

        return part;
    }

    // Function to schedule the audio beats using Tone.Part
    function scheduleAudioBeats(beats, synth, measureLength) {
        const interval = measureLength / beats;
        const part = new Tone.Part((time, value) => {
            // Trigger the sound
            synth.triggerAttackRelease('C4', '8n', time);
        }, Array.from({ length: beats }, (_, i) => [i * interval, i]));

        part.loop = true;
        part.loopEnd = measureLength;
        part.start(0);

        return part;
    }

    // Schedule the visual beats (left)
    parts.push(scheduleVisualBeats(beatsLeft, measureLeft, measureLength));

    // Schedule the visual beats (right)
    parts.push(scheduleVisualBeats(beatsRight, measureRight, measureLength));

    // Schedule the visual beats (combined)
    parts.push(scheduleVisualBeats(beatsLeft, measureCombinedLeft, measureLength));
    parts.push(scheduleVisualBeats(beatsRight, measureCombinedRight, measureLength));



    // Schedule the audio beats if not in interactive mode
    if (!isInteractiveMode) {
        parts.push(scheduleAudioBeats(beatsLeft, leftSynth, measureLength));
        parts.push(scheduleAudioBeats(beatsRight, rightSynth, measureLength));
    }

    // Start the transport
    Tone.Transport.start(Tone.now());

    // Handle keyboard input
    document.addEventListener('keydown', handleKeyDown);

    function handleKeyDown(event) {
        if (event.key === 'a' || event.key === 'A') {
            leftSynth.triggerAttackRelease('C4', '8n');
        }
        if (event.key === 'l' || event.key === 'L') {
            rightSynth.triggerAttackRelease('C4', '8n');
        }
    }
});

document.getElementById('stop-button').addEventListener('click', () => {
    Tone.Transport.stop();
    Tone.Transport.cancel(); // Clear all scheduled events
    parts.forEach(part => part.stop());
    parts = [];
    document.removeEventListener('keydown', handleKeyDown);
});

document.getElementById('toggle-mode-button').addEventListener('click', () => {
    isInteractiveMode = !isInteractiveMode;
    if (isInteractiveMode) {
        document.getElementById('toggle-mode-button').innerText = 'Switch to Original Mode';
    } else {
        document.getElementById('toggle-mode-button').innerText = 'Switch to Interactive Mode';
    }
});
