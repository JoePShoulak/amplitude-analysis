/* == VARIABLES == */
const COLOR_SPEED = 2.5;
let song;
let amp;
let points;
let dropzone;

/* == HELPERS == */
const songProgress = () => {
  if (song === undefined) return 0;

  const prog = song.currentTime() / song.duration();
  return isNaN(prog) ? 0 : prog;
};

const promptDragDrop = () => {
  background(20);
  text("Drag and drop a song to begin", width / 2, height / 2 - 15);
  text("(or click anywhere for a demo song)", width / 2, height / 2 + 15);
};

const promptDrop = () => {
  background(20);
  text("Drop it like it's hot!", width / 2, height / 2);
};

const playDemo = () => playSong("assets/summer-romance.mp3");

const playSong = (file) => {
  if (song !== undefined) return;

  file = file.data ? file.data : file;

  song = loadSound(file, () => song.play());
  song.onended(reset);
  amp.setInput(song);

  noFill();
  loop();
};

const reset = () => {
  noLoop();
  noStroke();
  fill("white");
  background(20);

  song = undefined;
  amp = new p5.Amplitude();
  points = new Array(ceil(width / 2)).fill({ value: 0, color: "red" });

  promptDragDrop();
};

function windowResized() {
  resizeCanvas(innerWidth, innerHeight);

  if (isLooping()) {
    const lastColor = points[0].color;
    while (points.length !== ceil(width / 2)) {
      points.length < ceil(width / 2)
        ? points.unshift({ value: 0, color: lastColor })
        : points.shift();
    }
  } else {
    promptDragDrop();
  }
}

/* == MAIN FUNCTIONS == */
function setup() {
  const cnv = createCanvas(innerWidth, innerHeight);

  cnv.dragOver(promptDrop);
  cnv.dragLeave(promptDragDrop);
  cnv.drop(playSong, promptDragDrop);
  cnv.mouseClicked(playDemo);

  textAlign(CENTER);
  textSize(20);

  reset();
}

function draw() {
  if (song === undefined) return;

  const vol = song.isPlaying() ? map(amp.getLevel(), 0, 1, 0, height) : 0;
  const hue = (songProgress() * COLOR_SPEED) % 1;
  const currColor = hslToRgb(hue, 1, 0.5);

  points.shift();
  points.push({ value: vol / 2, color: currColor });

  background(20);

  // Draw line extending from arc to the right
  stroke("white");
  line(width / 2 + vol / 2, height / 2, width, height / 2);

  // Draw arc with lerped color
  const beginAngle = (3 * PI) / 2;
  for (let i = 0; i < 1; i += 0.01) {
    const lColor = lerpColor(color(currColor), color("white"), i);
    const start = beginAngle + i * QUARTER_PI;
    const end = beginAngle + (i + 1) * QUARTER_PI;

    stroke(lColor);
    arc(width / 2, height / 2, vol, vol, start, end);
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
