// index.js - Cloudflare Worker Game Platform
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Router
    if (path === '/' || path === '/index.html') {
      return new Response(HTML_CONTENT, {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    if (path === '/games/snake') {
      return new Response(SNAKE_GAME, {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    if (path === '/games/tetris') {
      return new Response(TETRIS_GAME, {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    if (path === '/games/2048') {
      return new Response(GAME_2048, {
        headers: 'text/html' }
      });
    }

    return new Response('Not Found', { status: 404 });
  }
};

// Main Menu HTML
const HTML_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Arcade Hub</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 2rem;
            color: white;
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 0.5rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            animation: glow 2s ease-in-out infinite alternate;
        }
        @keyframes glow {
            from { text-shadow: 2px 2px 4px rgba(0,0,0,0.3), 0 0 10px rgba(255,255,255,0.1); }
            to { text-shadow: 2px 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(255,255,255,0.3), 0 0 30px rgba(255,255,255,0.2); }
        }
        .subtitle { opacity: 0.9; margin-bottom: 3rem; font-size: 1.2rem; }
        .games-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2rem;
            max-width: 1000px;
            width: 100%;
        }
        .game-card {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 2rem;
            text-align: center;
            transition: all 0.3s ease;
            border: 1px solid rgba(255,255,255,0.2);
            cursor: pointer;
            text-decoration: none;
            color: white;
            display: block;
        }
        .game-card:hover {
            transform: translateY(-10px) scale(1.02);
            background: rgba(255,255,255,0.2);
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        .game-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
        }
        .game-title {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }
        .game-desc {
            font-size: 0.9rem;
            opacity: 0.8;
        }
        .footer {
            margin-top: auto;
            padding-top: 3rem;
            opacity: 0.6;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <h1>🎮 Arcade Hub</h1>
    <p class="subtitle">Classic games, modern browser</p>
    
    <div class="games-grid">
        <a href="/games/snake" class="game-card">
            <div class="game-icon">🐍</div>
            <div class="game-title">Snake</div>
            <div class="game-desc">Eat food, grow longer, don't hit walls!</div>
        </a>
        
        <a href="/games/tetris" class="game-card">
            <div class="game-icon">🧱</div>
            <div class="game-title">Tetris</div>
            <div class="game-desc">Stack blocks, clear lines, survive!</div>
        </a>
        
        <a href="/games/2048" class="game-card">
            <div class="game-icon">🔢</div>
            <div class="game-title">2048</div>
            <div class="game-desc">Slide tiles, combine numbers, reach 2048!</div>
        </a>
    </div>
    
    <div class="footer">Built with Cloudflare Workers • Play responsibly</div>
</body>
</html>`;

// Snake Game
const SNAKE_GAME = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Snake Game</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', sans-serif;
            background: #1a1a2e;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            color: white;
        }
        h1 { margin-bottom: 1rem; color: #4ecca3; }
        .game-info {
            display: flex;
            gap: 2rem;
            margin-bottom: 1rem;
            font-size: 1.2rem;
        }
        .score { color: #4ecca3; }
        canvas {
            border: 3px solid #4ecca3;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(78, 204, 163, 0.3);
        }
        .controls {
            margin-top: 1rem;
            text-align: center;
            color: #888;
        }
        .back {
            position: absolute;
            top: 20px;
            left: 20px;
            color: #4ecca3;
            text-decoration: none;
            font-size: 1.1rem;
        }
        .back:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <a href="/" class="back">← Back to Menu</a>
    <h1>🐍 Snake</h1>
    <div class="game-info">
        <div class="score">Score: <span id="score">0</span></div>
        <div>High Score: <span id="highScore">0</span></div>
    </div>
    <canvas id="gameCanvas" width="400" height="400"></canvas>
    <div class="controls">Use Arrow Keys or WASD to move</div>

    <script>
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const scoreElement = document.getElementById('score');
        const highScoreElement = document.getElementById('highScore');
        
        const gridSize = 20;
        const tileCount = canvas.width / gridSize;
        
        let snake = [{x: 10, y: 10}];
        let food = {x: 15, y: 15};
        let dx = 0;
        let dy = 0;
        let score = 0;
        let highScore = localStorage.getItem('snakeHighScore') || 0;
        highScoreElement.textContent = highScore;
        
        document.addEventListener('keydown', changeDirection);
        
        function changeDirection(event) {
            const LEFT = 37, RIGHT = 39, UP = 38, DOWN = 40;
            const W = 87, A = 65, S = 83, D = 68;
            
            const goingUp = dy === -1;
            const goingDown = dy === 1;
            const goingRight = dx === 1;
            const goingLeft = dx === -1;
            
            if ((event.keyCode === LEFT || event.keyCode === A) && !goingRight) {
                dx = -1; dy = 0;
            }
            if ((event.keyCode === UP || event.keyCode === W) && !goingDown) {
                dx = 0; dy = -1;
            }
            if ((event.keyCode === RIGHT || event.keyCode === D) && !goingLeft) {
                dx = 1; dy = 0;
            }
            if ((event.keyCode === DOWN || event.keyCode === S) && !goingUp) {
                dx = 0; dy = 1;
            }
        }
        
        function drawGame() {
            clearScreen();
            moveSnake();
            
            let result = isGameOver();
            if (result) return;
            
            checkFoodCollision();
            drawFood();
            drawSnake();
            
            setTimeout(drawGame, 100);
        }
        
        function clearScreen() {
            ctx.fillStyle = '#0f0f23';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        function drawSnake() {
            ctx.fillStyle = '#4ecca3';
            snake.forEach((segment, index) => {
                ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
                if (index === 0) {
                    ctx.fillStyle = '#2d8a6e';
                    ctx.fillRect(segment.x * gridSize + 4, segment.y * gridSize + 4, 4, 4);
                    ctx.fillRect(segment.x * gridSize + 12, segment.y * gridSize + 4, 4, 4);
                    ctx.fillStyle = '#4ecca3';
                }
            });
        }
        
        function moveSnake() {
            const head = {x: snake[0].x + dx, y: snake[0].y + dy};
            snake.unshift(head);
            
            if (!didEatFood) {
                snake.pop();
            }
            didEatFood = false;
        }
        
        let didEatFood = false;
        
        function checkFoodCollision() {
            if (snake[0].x === food.x && snake[0].y === food.y) {
                didEatFood = true;
                score += 10;
                scoreElement.textContent = score;
                
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem('snakeHighScore', highScore);
                    highScoreElement.textContent = highScore;
                }
                
                food = {
                    x: Math.floor(Math.random() * tileCount),
                    y: Math.floor(Math.random() * tileCount)
                };
            }
        }
        
        function drawFood() {
            ctx.fillStyle = '#ff6b6b';
            ctx.beginPath();
            ctx.arc(
                food.x * gridSize + gridSize/2, 
                food.y * gridSize + gridSize/2, 
                gridSize/2 - 2, 0, Math.PI * 2
            );
            ctx.fill();
        }
        
        function isGameOver() {
            let gameOver = false;
            
            if (dx === 0 && dy === 0) return false;
            
            if (snake[0].x < 0 || snake[0].x >= tileCount || 
                snake[0].y < 0 || snake[0].y >= tileCount) {
                gameOver = true;
            }
            
            for (let i = 1; i < snake.length; i++) {
                if (snake[0].x === snake[i].x && snake[0].y === snake[i].y) {
                    gameOver = true;
                }
            }
            
            if (gameOver) {
                ctx.fillStyle = 'white';
                ctx.font = '30px Arial';
                ctx.fillText('Game Over!', canvas.width/2 - 80, canvas.height/2);
                ctx.font = '20px Arial';
                ctx.fillText('Press Space to Restart', canvas.width/2 - 100, canvas.height/2 + 40);
                
                document.addEventListener('keydown', function restart(e) {
                    if (e.code === 'Space') {
                        location.reload();
                        document.removeEventListener('keydown', restart);
                    }
                });
            }
            
            return gameOver;
        }
        
        drawGame();
    </script>
</body>
</html>`;

// Tetris Game (Simplified)
const TETRIS_GAME = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tetris</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', sans-serif;
            background: #0f0f23;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            color: white;
        }
        h1 { margin-bottom: 1rem; color: #00d4ff; }
        .game-container {
            display: flex;
            gap: 2rem;
            align-items: flex-start;
        }
        canvas {
            border: 3px solid #00d4ff;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
        }
        .side-panel {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        .info-box {
            background: rgba(255,255,255,0.1);
            padding: 1rem;
            border-radius: 10px;
            text-align: center;
        }
        .info-box h3 { color: #00d4ff; margin-bottom: 0.5rem; }
        .controls-list {
            background: rgba(255,255,255,0.05);
            padding: 1rem;
            border-radius: 10px;
            font-size: 0.9rem;
            line-height: 1.8;
        }
        .back {
            position: absolute;
            top: 20px;
            left: 20px;
            color: #00d4ff;
            text-decoration: none;
            font-size: 1.1rem;
        }
        .back:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <a href="/" class="back">← Back to Menu</a>
    <h1>🧱 Tetris</h1>
    <div class="game-container">
        <canvas id="tetris" width="240" height="400"></canvas>
        <div class="side-panel">
            <div class="info-box">
                <h3>Score</h3>
                <div id="score">0</div>
            </div>
            <div class="info-box">
                <h3>Lines</h3>
                <div id="lines">0</div>
            </div>
            <div class="info-box">
                <h3>Level</h3>
                <div id="level">1</div>
            </div>
            <div class="controls-list">
                <strong>Controls:</strong><br>
                ← → : Move<br>
                ↑ : Rotate<br>
                ↓ : Soft Drop<br>
                Space : Hard Drop<br>
                P : Pause
            </div>
        </div>
    </div>

    <script>
        const canvas = document.getElementById('tetris');
        const context = canvas.getContext('2d');
        context.scale(20, 20);
        
        const scoreElement = document.getElementById('score');
        const linesElement = document.getElementById('lines');
        const levelElement = document.getElementById('level');
        
        let dropCounter = 0;
        let dropInterval = 1000;
        let lastTime = 0;
        let pause = false;
        
        const colors = [
            null,
            '#FF0D72', // T
            '#0DC2FF', // I
            '#0DFF72', // S
            '#F538FF', // Z
            '#FF8E0D', // L
            '#FFE138', // O
            '#3877FF', // J
        ];
        
        function arenaSweep() {
            let rowCount = 0;
            outer: for (let y = arena.length - 1; y > 0; --y) {
                for (let x = 0; x < arena[y].length; ++x) {
                    if (arena[y][x] === 0) continue outer;
                }
                const row = arena.splice(y, 1)[0].fill(0);
                arena.unshift(row);
                ++y;
                rowCount++;
            }
            if (rowCount > 0) {
                player.lines += rowCount;
                player.score += rowCount * 100 * player.level;
                player.level = Math.floor(player.lines / 10) + 1;
                dropInterval = Math.max(100, 1000 - (player.level - 1) * 100);
                updateScore();
            }
        }
        
        function collide(arena, player) {
            const m = player.matrix;
            const o = player.pos;
            for (let y = 0; y < m.length; ++y) {
                for (let x = 0; x < m[y].length; ++x) {
                    if (m[y][x] !== 0 &&
                        (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                        return true;
                    }
                }
            }
            return false;
        }
        
        function createMatrix(w, h) {
            const matrix = [];
            while (h--) {
                matrix.push(new Array(w).fill(0));
            }
            return matrix;
        }
        
        function createPiece(type) {
            if (type === 'I') {
                return [
                    [0, 1, 0, 0],
                    [0, 1, 0, 0],
                    [0, 1, 0, 0],
                    [0, 1, 0, 0],
                ];
            } else if (type === 'L') {
                return [
                    [0, 2, 0],
                    [0, 2, 0],
                    [0, 2, 2],
                ];
            } else if (type === 'J') {
                return [
                    [0, 3, 0],
                    [0, 3, 0],
                    [3, 3, 0],
                ];
            } else if (type === 'O') {
                return [
                    [4, 4],
                    [4, 4],
                ];
            } else if (type === 'Z') {
                return [
                    [5, 5, 0],
                    [0, 5, 5],
                    [0, 0, 0],
                ];
            } else if (type === 'S') {
                return [
                    [0, 6, 6],
                    [6, 6, 0],
                    [0, 0, 0],
                ];
            } else if (type === 'T') {
                return [
                    [0, 7, 0],
                    [7, 7, 7],
                    [0, 0, 0],
                ];
            }
        }
        
        function drawMatrix(matrix, offset) {
            matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        context.fillStyle = colors[value];
                        context.fillRect(x + offset.x, y + offset.y, 1, 1);
                        context.strokeStyle = 'rgba(0,0,0,0.3)';
                        context.strokeRect(x + offset.x, y + offset.y, 1, 1);
                    }
                });
            });
        }
        
        function draw() {
            context.fillStyle = '#0f0f23';
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            drawMatrix(arena, {x: 0, y: 0});
            drawMatrix(player.matrix, player.pos);
        }
        
        function merge(arena, player) {
            player.matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        arena[y + player.pos.y][x + player.pos.x] = value;
                    }
                });
            });
        }
        
        function rotate(matrix, dir) {
            for (let y = 0; y < matrix.length; ++y) {
                for (let x = 0; x < y; ++x) {
                    [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
                }
            }
            if (dir > 0) {
                matrix.forEach(row => row.reverse());
            } else {
                matrix.reverse();
            }
        }
        
        function playerDrop() {
            player.pos.y++;
            if (collide(arena, player)) {
                player.pos.y--;
                merge(arena, player);
                playerReset();
                arenaSweep();
            }
            dropCounter = 0;
        }
        
        function playerMove(offset) {
            player.pos.x += offset;
            if (collide(arena, player)) {
                player.pos.x -= offset;
            }
        }
        
        function playerReset() {
            const pieces = 'TJLOSZI';
            player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
            player.pos.y = 0;
            player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
            
            if (collide(arena, player)) {
                arena.forEach(row => row.fill(0));
                player.score = 0;
                player.lines = 0;
                player.level = 1;
                dropInterval = 1000;
                updateScore();
                alert('Game Over! Score: ' + player.score);
            }
        }
        
        function playerRotate(dir) {
            const pos = player.pos.x;
            let offset = 1;
            rotate(player.matrix, dir);
            while (collide(arena, player)) {
                player.pos.x += offset;
                offset = -(offset + (offset > 0 ? 1 : -1));
                if (offset > player.matrix[0].length) {
                    rotate(player.matrix, -dir);
                    player.pos.x = pos;
                    return;
                }
            }
        }
        
        function updateScore() {
            scoreElement.textContent = player.score;
            linesElement.textContent = player.lines;
            levelElement.textContent = player.level;
        }
        
        document.addEventListener('keydown', event => {
            if (event.keyCode === 80) { // P
                pause = !pause;
                if (!pause) update();
                return;
            }
            if (pause) return;
            
            if (event.keyCode === 37) { // Left
                playerMove(-1);
            } else if (event.keyCode === 39) { // Right
                playerMove(1);
            } else if (event.keyCode === 40) { // Down
                playerDrop();
            } else if (event.keyCode === 38) { // Up
                playerRotate(1);
            } else if (event.keyCode === 32) { // Space
                while (!collide(arena, player)) {
                    player.pos.y++;
                }
                player.pos.y--;
                merge(arena, player);
                playerReset();
                arenaSweep();
                dropCounter = 0;
            }
        });
        
        const arena = createMatrix(12, 20);
        
        const player = {
            pos: {x: 0, y: 0},
            matrix: null,
            score: 0,
            lines: 0,
            level: 1,
        };
        
        playerReset();
        updateScore();
        
        function update(time = 0) {
            if (pause) return;
            
            const deltaTime = time - lastTime;
            lastTime = time;
            
            dropCounter += deltaTime;
            if (dropCounter > dropInterval) {
                playerDrop();
            }
            
            draw();
            requestAnimationFrame(update);
        }
        
        update();
    </script>
</body>
</html>`;

// 2048 Game
const GAME_2048 = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>2048</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', sans-serif;
            background: #faf8ef;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            color: #776e65;
        }
        h1 {
            font-size: 3rem;
            color: #776e65;
            margin-bottom: 1rem;
        }
        .score-container {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
        }
        .score-box {
            background: #bbada0;
            padding: 0.5rem 1.5rem;
            border-radius: 6px;
            color: white;
            text-align: center;
        }
        .score-box div:first-child {
            font-size: 0.8rem;
            text-transform: uppercase;
        }
        .score-box div:last-child {
            font-size: 1.5rem;
            font-weight: bold;
        }
        .game-container {
            background: #bbada0;
            padding: 10px;
            border-radius: 10px;
            position: relative;
        }
        .grid-container {
            display: grid;
            grid-template-columns: repeat(4, 100px);
            grid-template-rows: repeat(4, 100px);
            gap: 10px;
        }
        .grid-cell {
            background: rgba(238, 228, 218, 0.35);
            border-radius: 5px;
        }
        .tile {
            position: absolute;
            width: 100px;
            height: 100px;
            background: #eee4da;
            border-radius: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            font-weight: bold;
            transition: all 0.15s ease;
            animation: appear 0.2s ease;
        }
        @keyframes appear {
            0% { opacity: 0; transform: scale(0); }
            100% { opacity: 1; transform: scale(1); }
        }
        .tile-2 { background: #eee4da; color: #776e65; }
        .tile-4 { background: #ede0c8; color: #776e65; }
        .tile-8 { background: #f2b179; color: #f9f6f2; }
        .tile-16 { background: #f59563; color: #f9f6f2; }
        .tile-32 { background: #f67c5f; color: #f9f6f2; }
        .tile-64 { background: #f65e3b; color: #f9f6f2; }
        .tile-128 { background: #edcf72; color: #f9f6f2; font-size: 1.8rem; }
        .tile-256 { background: #edcc61; color: #f9f6f2; font-size: 1.8rem; }
        .tile-512 { background: #edc850; color: #f9f6f2; font-size: 1.8rem; }
        .tile-1024 { background: #edc53f; color: #f9f6f2; font-size: 1.5rem; }
        .tile-2048 { background: #edc22e; color: #f9f6f2; font-size: 1.5rem; }
        
        .controls {
            margin-top: 2rem;
            text-align: center;
            color: #8f7a66;
        }
        .btn {
            background: #8f7a66;
            color: #f9f6f2;
            border: none;
            padding: 0.8rem 1.5rem;
            border-radius: 6px;
            font-size: 1rem;
            cursor: pointer;
            margin-top: 1rem;
            transition: background 0.2s;
        }
        .btn:hover { background: #9f8b77; }
        .back {
            position: absolute;
            top: 20px;
            left: 20px;
            color: #8f7a66;
            text-decoration: none;
            font-size: 1.1rem;
        }
        .back:hover { text-decoration: underline; }
        .game-over {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(238, 228, 218, 0.8);
            display: none;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            border-radius: 10px;
            z-index: 100;
        }
        .game-over.show { display: flex; }
        .game-over h2 {
            font-size: 3rem;
            color: #776e65;
            margin-bottom: 1rem;
        }
    </style>
</head>
<body>
    <a href="/" class="back">← Back to Menu</a>
    <h1>2048</h1>
    <div class="score-container">
        <div class="score-box">
            <div>Score</div>
            <div id="score">0</div>
        </div>
        <div class="score-box">
            <div>Best</div>
            <div id="best">0</div>
        </div>
    </div>
    
    <div class="game-container">
        <div class="grid-container" id="grid">
            <div class="grid-cell"></div><div class="grid-cell"></div><div class="grid-cell"></div><div class="grid-cell"></div>
            <div class="grid-cell"></div><div class="grid-cell"></div><div class="grid-cell"></div><div class="grid-cell"></div>
            <div class="grid-cell"></div><div class="grid-cell"></div><div class="grid-cell"></div><div class="grid-cell"></div>
            <div class="grid-cell"></div><div class="grid-cell"></div><div class="grid-cell"></div><div class="grid-cell"></div>
        </div>
        <div class="game-over" id="gameOver">
            <h2>Game Over!</h2>
            <button class="btn" onclick="newGame()">Try Again</button>
        </div>
    </div>
    
    <div class="controls">
        <p>Use arrow keys to move tiles</p>
        <button class="btn" onclick="newGame()">New Game</button>
    </div>

    <script>
        let board = Array(4).fill().map(() => Array(4).fill(0));
        let score = 0;
        let bestScore = localStorage.getItem('best2048') || 0;
        document.getElementById('best').textContent = bestScore;
        
        function updateDisplay() {
            const grid = document.getElementById('grid');
            // Remove old tiles
            document.querySelectorAll('.tile').forEach(t => t.remove());
            
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    if (board[r][c] !== 0) {
                        const tile = document.createElement('div');
                        tile.className = 'tile tile-' + board[r][c];
                        tile.textContent = board[r][c];
                        tile.style.left = (10 + c * 110) + 'px';
                        tile.style.top = (10 + r * 110) + 'px';
                        grid.appendChild(tile);
                    }
                }
            }
            
            document.getElementById('score').textContent = score;
            if (score > bestScore) {
                bestScore = score;
                localStorage.setItem('best2048', bestScore);
                document.getElementById('best').textContent = bestScore;
            }
        }
        
        function addRandomTile() {
            const empty = [];
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    if (board[r][c] === 0) empty.push({r, c});
                }
            }
            if (empty.length > 0) {
                const {r, c} = empty[Math.floor(Math.random() * empty.length)];
                board[r][c] = Math.random() < 0.9 ? 2 : 4;
            }
        }
        
        function slideRowLeft(row) {
            const filtered = row.filter(x => x !== 0);
            for (let i = 0; i < filtered.length - 1; i++) {
                if (filtered[i] === filtered[i + 1]) {
                    filtered[i] *= 2;
                    score += filtered[i];
                    filtered[i + 1] = 0;
                }
            }
            const result = filtered.filter(x => x !== 0);
            while (result.length < 4) result.push(0);
            return result;
        }
        
        function moveLeft() {
            let moved = false;
            for (let r = 0; r < 4; r++) {
                const old = [...board[r]];
                board[r] = slideRowLeft(board[r]);
                if (old.join(',') !== board[r].join(',')) moved = true;
            }
            return moved;
        }
        
        function moveRight() {
            let moved = false;
            for (let r = 0; r < 4; r++) {
                const old = [...board[r]];
                board[r] = slideRowLeft(board[r].reverse()).reverse();
                if (old.join(',') !== board[r].join(',')) moved = true;
            }
            return moved;
        }
        
        function moveUp() {
            let moved = false;
            for (let c = 0; c < 4; c++) {
                const col = [board[0][c], board[1][c], board[2][c], board[3][c]];
                const old = [...col];
                const newCol = slideRowLeft(col);
                for (let r = 0; r < 4; r++) {
                    board[r][c] = newCol[r];
                }
                if (old.join(',') !== newCol.join(',')) moved = true;
            }
            return moved;
        }
        
        function moveDown() {
            let moved = false;
            for (let c = 0; c < 4; c++) {
                const col = [board[0][c], board[1][c], board[2][c], board[3][c]];
                const old = [...col];
                const newCol = slideRowLeft(col.reverse()).reverse();
                for (let r = 0; r < 4; r++) {
                    board[r][c] = newCol[r];
                }
                if (old.join(',') !== newCol.join(',')) moved = true;
            }
            return moved;
        }
        
        function canMove() {
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    if (board[r][c] === 0) return true;
                    if (c < 3 && board[r][c] === board[r][c + 1]) return true;
                    if (r < 3 && board[r][c] === board[r + 1][c]) return true;
                }
            }
            return false;
        }
        
        function checkWin() {
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    if (board[r][c] === 2048) return true;
                }
            }
            return false;
        }
        
        document.addEventListener('keydown', e => {
            if (document.getElementById('gameOver').classList.contains('show')) return;
            
            let moved = false;
            if (e.key === 'ArrowLeft') moved = moveLeft();
            else if (e.key === 'ArrowRight') moved = moveRight();
            else if (e.key === 'ArrowUp') moved = moveUp();
            else if (e.key === 'ArrowDown') moved = moveDown();
            
            if (moved) {
                addRandomTile();
                updateDisplay();
                if (!canMove()) {
                    document.getElementById('gameOver').classList.add('show');
                }
                if (checkWin()) {
                    setTimeout(() => alert('You won! You reached 2048!'), 100);
                }
            }
        });
        
        function newGame() {
            board = Array(4).fill().map(() => Array(4).fill(0));
            score = 0;
            document.getElementById('gameOver').classList.remove('show');
            addRandomTile();
            addRandomTile();
            updateDisplay();
        }
        
        // Touch support
        let touchStartX, touchStartY;
        document.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        document.addEventListener('touchend', e => {
            if (!touchStartX || !touchStartY) return;
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0) moveRight();
                else moveLeft();
            } else {
                if (dy > 0) moveDown();
                else moveUp();
            }
            addRandomTile();
            updateDisplay();
        });
        
        newGame();
    </script>
</body>
</html>`;
