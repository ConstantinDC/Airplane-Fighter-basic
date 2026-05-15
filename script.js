const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const timerElement = document.getElementById('timer');

const airplane = {
    x: 50,
    y: 50,
    size: 30,
    speed: 5,
    color: '#00ff00'
};

const enemies = [];
const enemySize = 20;
const enemySpeed = 2;

let keys = {};
let gameOver = false;
let timerInterval = null;
let elapsedSeconds = 0;
let gameRunning = false;

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateTimerDisplay() {
    timerElement.textContent = `Time: ${formatTime(elapsedSeconds)}`;
}

function resetTimer() {
    stopTimer();
    elapsedSeconds = 0;
    updateTimerDisplay();
}

function startTimer() {
    resetTimer();
    timerInterval = setInterval(() => {
        elapsedSeconds += 1;
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function stopGame() {
    gameRunning = false;
    stopTimer();
}

function generateEnemies() {
    const numEnemies = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < numEnemies; i++) {
        enemies.push({
            x: canvas.width,
            y: Math.random() * (canvas.height - enemySize),
            size: enemySize,
            color: '#ff0000'
        });
    }
}

function isColliding(a, b) {
    return a.x < b.x + b.size &&
           a.x + a.size > b.x &&
           a.y < b.y + b.size &&
           a.y + a.size > b.y;
}

function checkCollisions() {
    for (const enemy of enemies) {
        if (isColliding(airplane, enemy)) {
            gameOver = true;
            gameRunning = false;
            stopTimer();
            break;
        }
    }
}

function update() {
    if (gameOver || !gameRunning) {
        return;
    }

    enemies.forEach(enemy => {
        enemy.x -= enemySpeed;
    });

    enemies.splice(0, enemies.length, ...enemies.filter(enemy => enemy.x > -enemy.size));

    if (Math.random() < 0.01) {
        generateEnemies();
    }

    checkCollisions();         
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = airplane.color;
    ctx.fillRect(airplane.x, airplane.y, airplane.size, airplane.size);

    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
    });

    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 24);
        ctx.font = '24px Arial';
        ctx.fillText('Press Enter to restart', canvas.width / 2, canvas.height / 2 + 32);
    }
}

function gameLoop() {
    update();
    draw();
    if (!gameOver && gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

window.addEventListener('keydown', (e) => {
    if (['ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        keys[e.key] = true;
        e.preventDefault();

        if (keys.ArrowRight) {
            airplane.x += airplane.speed;
        }

        if (keys.ArrowUp) {
            airplane.y -= airplane.speed;
        }

        if (keys.ArrowDown) {
            airplane.y += airplane.speed;
        } 
    }
    
    airplane.y = Math.max(0, Math.min(canvas.height - airplane.size, airplane.y));
});

window.addEventListener('keyup', (e) => {
    if (['ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        keys[e.key] = false;
        e.preventDefault();
    }

    if (e.key === 'Enter' && gameOver) {
        startGame();
    }
});

function startGame() {
    gameOver = false;
    gameRunning = true;
    airplane.x = 50;
    airplane.y = 50;
    enemies.splice(0, enemies.length);
    keys = {};
    resetTimer();
    startTimer();
    gameLoop();
}

startGame();
