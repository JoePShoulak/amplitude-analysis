const COLOR_SPEED = 2.5;
let song;
let amp;
let points;
let dropzone;

function songProgress() {
  if (song === undefined) return 0;

  const prog = song.currentTime() / song.duration();
  return isNaN(prog) ? 0 : prog;
}

function promptDragDrop() {
  background(20);
  text("Drag and drop a song to begin", width / 2, height / 2);
  text("(or click anywhere for a demo song)", width / 2, height / 2 + 30);
}

function promptDrop() {
  background(20);
  text("Drop it like it's hot!", width / 2, height / 2);
}

function playDemo() {
  song === undefined && playSong("assets/summer-romance.mp3");
}

function playSong(file) {
  if (file.data) file = file.data;

  song = loadSound(file, () => song.play());
  song.onended(reset);

  amp.setInput(song);

  noFill();
  loop();
}

function reset() {
  noLoop();
  noStroke();
  textAlign(CENTER);
  fill("white");
  textSize(20);
  background(20);

  song = undefined;
  amp = new p5.Amplitude();
  points = new Array(ceil(width / 2)).fill({ value: 0, color: "red" });

  promptDragDrop();
}

function setup() {
  const cnv = createCanvas(innerWidth, innerHeight);

  cnv.dragOver(promptDrop);
  cnv.dragLeave(promptDragDrop);
  cnv.drop(playSong, promptDragDrop);
  cnv.mouseClicked(playDemo);

  reset();
}

function draw() {
  if (song === undefined) return;

  const vol = song.isPlaying() ? map(amp.getLevel(), 0, 1, 0, height) : 0;
  const currColor = hslToRgb((songProgress() * COLOR_SPEED) % 1, 1, 0.5);

  points.shift();
  points.push({
    value: vol / 2,
    color: currColor,
  });

  background(20);

  // Draw line extending from arc to the right
  stroke("white");
  line(width / 2 + vol / 2, height / 2, width, height / 2);

  // Draw arc with lerped color
  const beginAngle = (3 * PI) / 2;
  const itToAngle = (it) => beginAngle + it * QUARTER_PI;
  for (let i = 0; i < 1; i += 0.01) {
    const lColor = lerpColor(color(currColor), color("white"), i);

    stroke(lColor);
    arc(width / 2, height / 2, vol, vol, itToAngle(i), itToAngle(i + 1));
  }

  // Draw the colored wave form
  points.forEach((p, i) => {
    if (points[i - 1] === undefined) return;

    const prevP = [i - 1, height / 2 - points[i - 1].value];
    const currP = [i, height / 2 - p.value];

    stroke(p.color);
    line(...prevP, ...currP);
  });
}
