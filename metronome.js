document.getElementById('startPolyrhythm').addEventListener('click', async () => {
    await Tone.start(); // Start the audio context
    console.log('Polyrhythm started');

    const bpmInput = document.getElementById('bpm');
    const bpm = parseInt(bpmInput.value); // Get the user-specified BPM

    // Set the BPM
    Tone.Transport.bpm.value = bpm;

    // Create different synths for different rhythms
    const rhythmOneSynth = new Tone.MembraneSynth({
        volume: -5
    }).toDestination();

    const rhythmTwoSynth = new Tone.MetalSynth({
        volume: -10
    }).toDestination();

    // Polyrhythm: Rhythm 1 (2 beats in the time of 3 beats)
    Tone.Transport.scheduleRepeat(time => {
        rhythmOneSynth.triggerAttackRelease("C2", "8n", time);
    }, "0:3"); // Every 2/3 of a measure

    // Polyrhythm: Rhythm 2 (3 beats in the time of 2 beats)
    Tone.Transport.scheduleRepeat(time => {
        rhythmTwoSynth.triggerAttackRelease("G2", "8n", time);
    }, "0:2"); // Every 1/2 of a measure

    // Start the transport
    Tone.Transport.start();
});

document.getElementById('stopButton').addEventListener('click', () => {
    Tone.Transport.stop();
    Tone.Transport.cancel(); // Clear scheduled events
    console.log('Metronome stopped');
});
