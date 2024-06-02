document.getElementById('playButton').addEventListener('click', async () => {
    await Tone.start();  // Ensure audio is started on a user interaction
    console.log('Audio is ready');

    // Set the time signature to 3/4 and BPM to 120
    Tone.Transport.timeSignature = [11, 4];
    Tone.Transport.bpm.value = 120;

    // Create two synths, one for the downbeat and another for the remaining beats
    const downbeatSynth = new Tone.Synth({
        oscillator: {
            type: 'triangle'  // A distinct sound for the downbeat
        }
    }).toDestination();

    const otherBeatSynth = new Tone.Synth({
        oscillator: {
            type: 'sawtooth'  // A different sound for the remaining beats
        }
    }).toDestination();

    // Schedule the downbeat and the remaining beats
    Tone.Transport.scheduleRepeat(time => {
        // Play the downbeat on the first beat of each measure
        downbeatSynth.triggerAttackRelease("C4", "4n", time);

        // Play the remaining beats on the 2nd and 3rd beats of the measure
        otherBeatSynth.triggerAttackRelease("E4", "4n", time + Tone.Time("4n").toSeconds());
        otherBeatSynth.triggerAttackRelease("G4", "4n", time + Tone.Time("2n").toSeconds());
    }, "1m");

    document.getElementById('stopButton').addEventListener('click', () => {
    Tone.Transport.stop();
    console.log('Audio has stopped');
});

    // Start the Transport
    Tone.Transport.start();
});
