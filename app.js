document.getElementById('playButton').addEventListener('click', async () => {
    // Make sure audio context is resumed (needed for some browsers)
    await Tone.start();
    
    console.log('Audio is ready');

    // Create a synth and connect it to the main output
    const synth = new Tone.Synth().toDestination();

    // Create a sequence of notes
    const notes = ["C4", "E4", "G4", "C5"];
    let index = 0;

    // Play a note every half second
    Tone.Transport.scheduleRepeat(time => {
        if (index < notes.length) {
            synth.triggerAttackRelease(notes[index], "8n", time);
            index++;
        }
    }, "0.5");

    // Start the Transport
    Tone.Transport.start();
});
