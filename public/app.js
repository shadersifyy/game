const canvas = document.getElementById("game");

// call your API
async function loadGame() {
  const res = await fetch("/api/game");
  const data = await res.json();

  console.log("Game data:", data);

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.fillText("Game loaded", 50, 50);
}

loadGame();
