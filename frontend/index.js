import { backend } from 'declarations/backend';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score-value');
const highScoresList = document.getElementById('high-scores-list');

canvas.width = 320;
canvas.height = 480;

const bird = {
    x: 50,
    y: canvas.height / 2,
    radius: 20,
    velocity: 0,
    gravity: 0.5,
    jump: -10
};

const pipes = [];
const pipeWidth = 50;
const pipeGap = 150;

let score = 0;
let gameOver = false;

function drawBird() {
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD700';
    ctx.fill();
    ctx.closePath();

    // Draw eye
    ctx.beginPath();
    ctx.arc(bird.x + 10, bird.y - 5, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.closePath();

    // Draw beak
    ctx.beginPath();
    ctx.moveTo(bird.x + 20, bird.y);
    ctx.lineTo(bird.x + 30, bird.y + 5);
    ctx.lineTo(bird.x + 20, bird.y + 10);
    ctx.fillStyle = '#FF6347';
    ctx.fill();
    ctx.closePath();
}

function drawPipes() {
    pipes.forEach(pipe => {
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
        ctx.fillRect(pipe.x, pipe.bottom, pipeWidth, canvas.height - pipe.bottom);
    });
}

function drawBackground() {
    // Sky
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sun
    ctx.beginPath();
    ctx.arc(canvas.width - 50, 50, 30, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD700';
    ctx.fill();
    ctx.closePath();

    // Clouds
    ctx.fillStyle = '#FFFFFF';
    drawCloud(50, 50, 30);
    drawCloud(200, 80, 40);
}

function drawCloud(x, y, size) {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.arc(x + size, y - size / 2, size * 0.8, 0, Math.PI * 2);
    ctx.arc(x + size * 1.5, y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}

function updateGame() {
    if (gameOver) return;

    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y + bird.radius > canvas.height) {
        gameOver = true;
    }

    pipes.forEach(pipe => {
        pipe.x -= 2;

        if (pipe.x + pipeWidth < 0) {
            pipes.shift();
            score++;
            scoreElement.textContent = score;
        }

        if (
            bird.x + bird.radius > pipe.x &&
            bird.x - bird.radius < pipe.x + pipeWidth &&
            (bird.y - bird.radius < pipe.top || bird.y + bird.radius > pipe.bottom)
        ) {
            gameOver = true;
        }
    });

    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
        const pipeY = Math.floor(Math.random() * (canvas.height - pipeGap - 100)) + 50;
        pipes.push({
            x: canvas.width,
            top: pipeY,
            bottom: pipeY + pipeGap
        });
    }
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    drawPipes();
    drawBird();

    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '30px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 70, canvas.height / 2);
        ctx.font = '20px Arial';
        ctx.fillText('Click to restart', canvas.width / 2 - 60, canvas.height / 2 + 40);
    }
}

function gameLoop() {
    updateGame();
    drawGame();
    requestAnimationFrame(gameLoop);
}

function restartGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes.length = 0;
    score = 0;
    scoreElement.textContent = score;
    gameOver = false;
}

canvas.addEventListener('click', () => {
    if (gameOver) {
        backend.addScore(score);
        updateHighScores();
        restartGame();
    } else {
        bird.velocity = bird.jump;
    }
});

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        if (gameOver) {
            backend.addScore(score);
            updateHighScores();
            restartGame();
        } else {
            bird.velocity = bird.jump;
        }
    }
});

async function updateHighScores() {
    const highScores = await backend.getHighScores();
    highScoresList.innerHTML = '';
    highScores.forEach(score => {
        const li = document.createElement('li');
        li.textContent = score;
        highScoresList.appendChild(li);
    });
}

updateHighScores();
gameLoop();
