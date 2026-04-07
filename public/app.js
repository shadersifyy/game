const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let currentScore = 0;

// load different games
function loadGame(type) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (type === "clicker") {
    runClicker();
  }

  if (type === "runner") {
    runRunner();
  }
}

// simple clicker game
function runClicker() {
  currentScore = 0;

  canvas.onclick = () => {
    currentScore++;
    drawText("Score: " + currentScore);
  };
}

// simple runner (fake demo)
function runRunner() {
  currentScore = 0;

  let x = 0;
  setInterval(() => {
    x += 5;
    currentScore++;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(x, 300, 50, 50);

    drawText("Score: " + currentScore);
  }, 100);
}

// draw helper
function drawText(text) {
  ctx.fillStyle = "white";
  ctx.fillText(text, 20, 20);
}

async function submitScore() {
  await fetch("/api/score", {
    method: "POST",
    body: JSON.stringify({
      name: "player",
      score: currentScore
    })
  });

  loadLeaderboard();
}

async function loadLeaderboard() {
  const res = await fetch("/api/leaderboard");
  const data = await res.json();

  const list = document.getElementById("leaderboard");
  list.innerHTML = "";

  data.slice(0, 10).forEach(entry => {
    const li = document.createElement("li");
    li.textContent = `${entry.name}: ${entry.score}`;
    list.appendChild(li);
  });
}

// auto load leaderboard
loadLeaderboard();
