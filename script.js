// Polyrhythms by Antoinette Bumatay-Chan
// Created for the #WCCChallenge - Topic: Scrolling OR Rhythm
// 
// Polyrhythms occur when multiple rhythms with different beat counts are played simultaneously.
// This creates a complex and interesting and (sometimes? often?) cacophonous musical pattern. 
// 
// Here's a video that provides a great explanation of polyrhythms with simple visuals
// https://www.youtube.com/watch?v=Op9ESW2pmvE
//
// In this sketch, I've created a visual representation of polyrhythms using circle moving along generated paths.
// Each circle represents a different rhythm.
// Those paths are created based on a larger circle that is not rendered. Logic is as follows:
//     e.g. 2 beat rhythm - two points are spaced equally around the circle
//                          connecting these points create a linear path along the diameter
//          3 beat rhythm - three points -> triangular path
//          4 beat rhythm - four points -> square path
// If you visualize time progressing along the circumference of the larger circle, the beats correspond to the points on these paths.
// One full rotation is equal to one beat subdivision.
// At the start/end of a subdivision, you will see the circles line up and hear the beats synchronize momentarily,
// before drifting back into their respective rhythms.
// (There's currently a bug, where sometimes, the circles are visually out of sync always.
//   You will notice this happening if the circles all start huge, and then one by one start shrinking).
// I'm definitely explaining this poorly, but if you watch the youtube video above it would make a lot more sense.
//
// Each circle's movement is also replicated across multiple instances, resulting in symmetrical patterns around the central axis.
// (I realize that next week's challenge is also likely going to be symmetries based on the current vote count haha).
//
// This is also my first time creating generated music. I'm using Tone.js - https://tonejs.github.io/
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

const { Transport, Synth } = Tone;

let gCircleRadius = 500;
let gRadius;

let gRhythms = [];

let gAllChords = [
  ['A', 'C', 'E'],
  ['B', 'D', 'F'],
  ['G', 'B', 'D'],
];
let gOctaves = ['4', '6']; //'3', '4', '5'];
let gBeatCounts = [2, 3, 4, 5, 6, 7];
let gInstanceCount;

let gRhythmCountMin = 2;

let gPalette = ['#00b8b8', '#e4bd0b', '#de3d83'];

let gIsPlaying = false;

function setup() {
  const l = 0.9 * (windowWidth < windowHeight ? windowWidth : windowHeight);
  createCanvas(l, l);
  background(255);
  noStroke();
	textAlign(CENTER);
	textSize(50);

  gRadius = 0.5 * height;

  Transport.bpm.value = 45;
}

function createPolyRhythm() {
  Transport.stop();
  Transport.cancel(0);
  gRhythms = [];
  gBeatCounts = shuffle(gBeatCounts);
  gPalette = shuffle(gPalette);
  let chord = random(gAllChords);
  gInstanceCount = floor(random(4)) + 2;

  let num = floor(random(gBeatCounts.length - gRhythmCountMin)) + gRhythmCountMin;
  for (let i = 0; i < num; i++) {
    let count = gBeatCounts[i % gBeatCounts.length];
    let note = chord[i % chord.length] + random(gOctaves);
    let interval = str(count) + 'n';
    gRhythms.push(new Rhythm(i, note, count, interval));
  }
  Transport.start();
}

function draw() {
  blendMode(BLEND);

  background(255);
	
	if (!gIsPlaying){
		text("Sound ON.\nClick to play." , 0.5 * width, 0.5* height);
	}
	
  blendMode(MULTIPLY);

  push();
  translate(0.5 * width, 0.5 * height);
  stroke(0);
  noFill();
  // ellipse(0, 0, 0.6 * height);
  noStroke();
  for (let beat of gRhythms) {
    beat.draw();
    beat.update();
  }

  pop();
}

function mousePressed() {
  if (!gIsPlaying) {
    gIsPlaying = true;
  }
  createPolyRhythm();
}

class Rhythm {
  constructor(index, note, beatCount, intervalStr) {
    this.synth = new Synth().toDestination();
    this.note = note;
    this.beatStr = intervalStr;
    this.beatInterval = Transport.toSeconds(this.beatStr);
    this.positions = this.setPositions(beatCount, 0.3 * height); //(index + 1) * 0.1 * height);
    this.curIndex = 0;
    this.targetIndex = 0;
    this.pos = this.positions[this.curIndex];
    this.color = color(gPalette[index % gPalette.length]);
    this.scheduleRhythm(this.beatStr);
    this.prevTime = -1;
    this.radius = 0.3 * height; //random(0.15, 0.25) * height;
    this.targetHasUpdated = false;
    this.midDist = createVector(0, 0);
  }

  update() {
    const next = this.timeUntilNextBeat();
    if (!this.targetHasUpdated || (this.targetHasUpdated && next < 0.5)) {
      if (next > this.prevTime) {
        if (this.targetHasUpdated) this.targetHasUpdated = false;
        this.prevTime = next;
        const xp = map(next, 0, 1, this.positions[this.curIndex].x, this.positions[this.targetIndex].x);
        const yp = map(next, 0, 1, this.positions[this.curIndex].y, this.positions[this.targetIndex].y);
        this.pos = createVector(xp, yp);
        const dist = this.pos.dist(this.midDist);

        this.radius = map(dist, 0, 0.3 * height, 0.01, 0.25) * height;
      }
    }
  }

  play(time) {
    this.synth.triggerAttackRelease(this.note, '32n', time);
    this.updateTargets();
  }

  draw() {
    fill(this.color);
    // ellipse(this.pos.x, this.pos.y, this.radius);

    const theta = TWO_PI / gInstanceCount;
    for (let i = 0; i < gInstanceCount; i++) {
      push();
      rotate(theta * i);
      ellipse(this.pos.x, this.pos.y, this.radius);
      pop();
    }
  }

  timeUntilNextBeat() {
    const timeUntilNext = Transport.nextSubdivision(this.beatStr) - Transport.now();
    return constrain(map(timeUntilNext, 0, this.beatInterval, 1, 0), 0, 1);
  }

  setPositions(beatCount, r) {
    let angleInc = TWO_PI / beatCount;
    let positions = [];
    for (let i = 0; i < beatCount; i++) {
      let xp = r * cos(i * angleInc);
      let yp = r * sin(i * angleInc);
      positions.push(createVector(xp, yp));
    }

    return positions;
  }

  updateTargets() {
    this.targetHasUpdated = true;
    this.curIndex = this.targetIndex;
    this.targetIndex = (this.targetIndex + 1) % this.positions.length;
    this.prevTime = -1;
    this.midDist = createVector(
      (this.positions[this.curIndex].x + this.positions[this.targetIndex].x) / 2,
      (this.positions[this.curIndex].y + this.positions[this.targetIndex].y) / 2
    );
  }

  scheduleRhythm(intervalStr) {
    Transport.scheduleRepeat((time) => {
      this.play(time);
    }, intervalStr);
  }
}
