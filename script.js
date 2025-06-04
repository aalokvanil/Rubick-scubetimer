// Timer variables
let startTime = 0;
let elapsedTime = 0;
let timerInterval = null;
let running = false;

// DOM Elements
const timerEl = document.getElementById("timer");
const scrambleEl = document.getElementById("scramble");
const generateBtn = document.getElementById("generate");
const resetBtn = document.getElementById("reset");
const themeToggle = document.getElementById("themeToggle");
const clearHistoryBtn = document.getElementById("clearHistory");
const historyEl = document.getElementById("history");
const bestEl = document.getElementById("best");
const ao5El = document.getElementById("ao5");

// Scramble generator (simple 3x3 moves)
const moves = ["R", "L", "U", "D", "F", "B"];
const modifiers = ["", "'", "2"];

function generateScramble() {
  let scramble = [];
  let lastMove = null;
  while (scramble.length < 20) {
    let move = moves[Math.floor(Math.random() * moves.length)];
    if (move !== lastMove) {
      let mod = modifiers[Math.floor(Math.random() * modifiers.length)];
      scramble.push(move + mod);
      lastMove = move;
    }
  }
  return scramble.join(" ");
}

// Format time milliseconds to mm:ss.mmm
function formatTime(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;

  return (
    (minutes > 0 ? (minutes < 10 ? "0" + minutes : minutes) + ":" : "") +
    (seconds < 10 ? "0" + seconds : seconds) +
    "." +
    milliseconds.toString().padStart(3, "0")
  );
}

// Start timer
function startTimer() {
  if (running) return;
  running = true;
  startTime = Date.now() - elapsedTime;
  timerInterval = setInterval(() => {
    elapsedTime = Date.now() - startTime;
    timerEl.textContent = formatTime(elapsedTime);
  }, 10);
}

// Stop timer and save time
function stopTimer() {
  if (!running) return;
  running = false;
  clearInterval(timerInterval);

  if (elapsedTime > 0) {
    saveTime(elapsedTime);
  }
}

// Reset timer display
function resetTimer() {
  clearInterval(timerInterval);
  elapsedTime = 0;
  running = false;
  timerEl.textContent = "00:00.000";
}

// Save time to localStorage and update UI
function saveTime(time) {
  let times = JSON.parse(localStorage.getItem("times")) || [];
  times.push(time);
  localStorage.setItem("times", JSON.stringify(times));
  addTimeToHistory(time);
  updateStats(times);
}

// Add a single time to the history list
function addTimeToHistory(time) {
  const li = document.createElement("li");
  li.textContent = formatTime(time);
  historyEl.appendChild(li);
}

// Load times from localStorage on page load
function loadHistory() {
  const times = JSON.parse(localStorage.getItem("times")) || [];
  historyEl.innerHTML = "";
  times.forEach(addTimeToHistory);
  updateStats(times);
}

// Calculate Best time and AO5 (average of last 5 solves)
function updateStats(times) {
  if (times.length === 0) {
    bestEl.textContent = "--:--.---";
    ao5El.textContent = "--:--.---";
    return;
  }

  // Best time
  const best = Math.min(...times);
  bestEl.textContent = formatTime(best);

  // AO5: average of last 5 times, ignoring best and worst if 5 or more solves
  if (times.length >= 5) {
    const last5 = times.slice(-5);
    const sorted = [...last5].sort((a, b) => a - b);
    const sum = sorted.slice(1, 4).reduce((a, b) => a + b, 0);
    const avg = sum / 3;
    ao5El.textContent = formatTime(avg);
  } else {
    ao5El.textContent = "--:--.---";
  }
}

// Event listeners

// Generate scramble button
generateBtn.addEventListener("click", () => {
  scrambleEl.textContent = generateScramble();
});

// Reset timer button
resetBtn.addEventListener("click", () => {
  resetTimer();
});

// Dark/light theme toggle
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("light") ? "light" : "dark"
  );
});

// Clear history button
clearHistoryBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all previous times?")) {
    localStorage.removeItem("times");
    historyEl.innerHTML = "";
    bestEl.textContent = "--:--.---";
    ao5El.textContent = "--:--.---";
  }
});

// Spacebar to start/stop timer
document.body.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    if (!running) {
      startTimer();
    } else {
      stopTimer();
    }
  }
});

// On page load, apply saved theme and load history
window.onload = function () {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light");
  }
  loadHistory();
};
