// ============================================================
// sanchan - Shooting Game
// ============================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

// ---- Game State ----
let gameRunning = false;
let score = 0;
let lives = 3;
let stars = [];
let enemies = [];
let bullets = [];
let particles = [];
let enemyBullets = [];
let powerUps = [];
let enemySpawnTimer = 0;
let difficultyTimer = 0;
let spawnInterval = 60;
let frameCount = 0;

// ---- Input ----
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
});
window.addEventListener('keyup', (e) => { keys[e.key] = false; });

// ---- Player ----
class Player {
    constructor() {
        this.w = 32;
        this.h = 32;
        this.x = W / 2 - this.w / 2;
        this.y = H - 80;
        this.speed = 5;
        this.shootCooldown = 0;
        this.shootRate = 10;
        this.invincible = 0;
        this.powerLevel = 1;
    }

    update() {
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) this.x -= this.speed;
        if (keys['ArrowRight'] || keys['d'] || keys['D']) this.x += this.speed;
        if (keys['ArrowUp'] || keys['w'] || keys['W']) this.y -= this.speed;
        if (keys['ArrowDown'] || keys['s'] || keys['S']) this.y += this.speed;

        this.x = Math.max(0, Math.min(W - this.w, this.x));
        this.y = Math.max(0, Math.min(H - this.h, this.y));

        if (this.shootCooldown > 0) this.shootCooldown--;

        if (keys[' '] && this.shootCooldown <= 0) {
            this.shoot();
            this.shootCooldown = this.shootRate;
        }

        if (this.invincible > 0) this.invincible--;
    }

    shoot() {
        const cx = this.x + this.w / 2;
        bullets.push(new Bullet(cx - 2, this.y, 0, -8));
        if (this.powerLevel >= 2) {
            bullets.push(new Bullet(cx - 10, this.y + 5, -1, -8));
            bullets.push(new Bullet(cx + 6, this.y + 5, 1, -8));
        }
        if (this.powerLevel >= 3) {
            bullets.push(new Bullet(cx - 16, this.y + 10, -2, -7));
            bullets.push(new Bullet(cx + 12, this.y + 10, 2, -7));
        }
    }

    draw() {
        if (this.invincible > 0 && Math.floor(this.invincible / 3) % 2 === 0) return;

        ctx.save();
        const cx = this.x + this.w / 2;
        const cy = this.y + this.h / 2;

        // Ship body
        ctx.fillStyle = '#00d4ff';
        ctx.beginPath();
        ctx.moveTo(cx, this.y);
        ctx.lineTo(this.x, this.y + this.h);
        ctx.lineTo(cx, this.y + this.h - 8);
        ctx.lineTo(this.x + this.w, this.y + this.h);
        ctx.closePath();
        ctx.fill();

        // Engine glow
        ctx.fillStyle = `rgba(0, 150, 255, ${0.5 + Math.random() * 0.5})`;
        ctx.beginPath();
        ctx.moveTo(cx - 6, this.y + this.h - 6);
        ctx.lineTo(cx, this.y + this.h + 6 + Math.random() * 6);
        ctx.lineTo(cx + 6, this.y + this.h - 6);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    hit() {
        if (this.invincible > 0) return false;
        lives--;
        this.invincible = 90;
        this.powerLevel = 1;
        document.getElementById('lives').textContent = lives;
        spawnExplosion(this.x + this.w / 2, this.y + this.h / 2, '#00d4ff', 20);
        if (lives <= 0) {
            gameOver();
            return true;
        }
        return false;
    }
}

// ---- Bullet ----
class Bullet {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.w = 4;
        this.h = 10;
        this.vx = vx;
        this.vy = vy;
        this.alive = true;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.y < -10 || this.y > H + 10 || this.x < -10 || this.x > W + 10) {
            this.alive = false;
        }
    }

    draw() {
        ctx.fillStyle = '#ffff00';
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 6;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.shadowBlur = 0;
    }
}

// ---- Enemy Bullet ----
class EnemyBullet {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.r = 3;
        this.vx = vx;
        this.vy = vy;
        this.alive = true;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.y < -10 || this.y > H + 10 || this.x < -10 || this.x > W + 10) {
            this.alive = false;
        }
    }

    draw() {
        ctx.fillStyle = '#ff4444';
        ctx.shadowColor = '#ff4444';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// ---- Enemy ----
class Enemy {
    constructor(type) {
        this.type = type || 'basic';
        this.alive = true;
        this.shootTimer = 60 + Math.random() * 120;

        if (this.type === 'basic') {
            this.w = 28;
            this.h = 28;
            this.hp = 1;
            this.score = 100;
            this.x = Math.random() * (W - this.w);
            this.y = -this.h;
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = 1.5 + Math.random() * 1.5;
            this.color = '#ff4466';
        } else if (this.type === 'fast') {
            this.w = 22;
            this.h = 22;
            this.hp = 1;
            this.score = 150;
            this.x = Math.random() * (W - this.w);
            this.y = -this.h;
            this.vx = (Math.random() - 0.5) * 4;
            this.vy = 3 + Math.random() * 2;
            this.color = '#ff8800';
        } else if (this.type === 'tank') {
            this.w = 36;
            this.h = 36;
            this.hp = 5;
            this.score = 300;
            this.x = Math.random() * (W - this.w);
            this.y = -this.h;
            this.vx = (Math.random() - 0.5) * 1;
            this.vy = 0.8 + Math.random() * 0.5;
            this.color = '#aa44ff';
        } else if (this.type === 'shooter') {
            this.w = 30;
            this.h = 30;
            this.hp = 2;
            this.score = 200;
            this.x = Math.random() * (W - this.w);
            this.y = -this.h;
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = 1 + Math.random();
            this.color = '#44ff88';
            this.shootTimer = 40;
        }
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls
        if (this.x <= 0 || this.x + this.w >= W) {
            this.vx *= -1;
        }

        if (this.y > H + 40) {
            this.alive = false;
        }

        // Shooting
        if (this.type === 'shooter' || this.type === 'tank') {
            this.shootTimer--;
            if (this.shootTimer <= 0 && this.y > 0 && this.y < H * 0.6) {
                this.shootAtPlayer();
                this.shootTimer = this.type === 'tank' ? 80 : 50;
            }
        }
    }

    shootAtPlayer() {
        const cx = this.x + this.w / 2;
        const cy = this.y + this.h / 2;
        const dx = player.x + player.w / 2 - cx;
        const dy = player.y + player.h / 2 - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const speed = 3;
        enemyBullets.push(new EnemyBullet(cx, cy, (dx / dist) * speed, (dy / dist) * speed));
    }

    draw() {
        ctx.save();
        const cx = this.x + this.w / 2;
        const cy = this.y + this.h / 2;

        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;

        if (this.type === 'basic' || this.type === 'shooter') {
            // Diamond shape
            ctx.beginPath();
            ctx.moveTo(cx, this.y);
            ctx.lineTo(this.x + this.w, cy);
            ctx.lineTo(cx, this.y + this.h);
            ctx.lineTo(this.x, cy);
            ctx.closePath();
            ctx.fill();
        } else if (this.type === 'fast') {
            // Triangle
            ctx.beginPath();
            ctx.moveTo(cx, this.y + this.h);
            ctx.lineTo(this.x, this.y);
            ctx.lineTo(this.x + this.w, this.y);
            ctx.closePath();
            ctx.fill();
        } else if (this.type === 'tank') {
            // Hexagon
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i - Math.PI / 6;
                const px = cx + (this.w / 2) * Math.cos(angle);
                const py = cy + (this.h / 2) * Math.sin(angle);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
        }

        ctx.shadowBlur = 0;
        ctx.restore();
    }

    hit() {
        this.hp--;
        if (this.hp <= 0) {
            this.alive = false;
            score += this.score;
            document.getElementById('score').textContent = score;
            spawnExplosion(this.x + this.w / 2, this.y + this.h / 2, this.color, 12);
            // Chance to drop power-up
            if (Math.random() < 0.08) {
                powerUps.push(new PowerUp(this.x + this.w / 2, this.y + this.h / 2));
            }
        }
    }
}

// ---- Power-Up ----
class PowerUp {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.w = 16;
        this.h = 16;
        this.vy = 1.5;
        this.alive = true;
        this.timer = 0;
    }

    update() {
        this.y += this.vy;
        this.timer++;
        if (this.y > H + 20) this.alive = false;
    }

    draw() {
        ctx.save();
        const pulse = Math.sin(this.timer * 0.15) * 3;
        ctx.fillStyle = '#00ff88';
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 10 + pulse;
        ctx.fillRect(this.x - this.w / 2 - pulse / 2, this.y - this.h / 2 - pulse / 2,
            this.w + pulse, this.h + pulse);
        ctx.shadowBlur = 0;

        // P letter
        ctx.fillStyle = '#003322';
        ctx.font = 'bold 12px Courier New';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('P', this.x, this.y);
        ctx.restore();
    }
}

// ---- Particles ----
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 4;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 1;
        this.decay = 0.02 + Math.random() * 0.03;
        this.size = 2 + Math.random() * 3;
        this.color = color;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.life -= this.decay;
    }

    draw() {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        ctx.globalAlpha = 1;
    }
}

function spawnExplosion(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

// ---- Stars (background) ----
function initStars() {
    stars = [];
    for (let i = 0; i < 80; i++) {
        stars.push({
            x: Math.random() * W,
            y: Math.random() * H,
            speed: 0.5 + Math.random() * 2,
            size: Math.random() * 1.5 + 0.5,
            brightness: Math.random()
        });
    }
}

function updateStars() {
    for (const s of stars) {
        s.y += s.speed;
        if (s.y > H) {
            s.y = 0;
            s.x = Math.random() * W;
        }
    }
}

function drawStars() {
    for (const s of stars) {
        const alpha = 0.3 + s.brightness * 0.7;
        ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
        ctx.fillRect(s.x, s.y, s.size, s.size);
    }
}

// ---- Collision Detection ----
function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function circleRectOverlap(circle, rect) {
    const cx = Math.max(rect.x, Math.min(circle.x, rect.x + rect.w));
    const cy = Math.max(rect.y, Math.min(circle.y, rect.y + rect.h));
    const dx = circle.x - cx;
    const dy = circle.y - cy;
    return (dx * dx + dy * dy) < (circle.r * circle.r);
}

// ---- Spawn Enemies ----
function spawnEnemy() {
    const roll = Math.random();
    let type;
    if (score < 1000) {
        type = 'basic';
    } else if (score < 3000) {
        type = roll < 0.6 ? 'basic' : roll < 0.85 ? 'fast' : 'shooter';
    } else if (score < 6000) {
        type = roll < 0.35 ? 'basic' : roll < 0.55 ? 'fast' : roll < 0.8 ? 'shooter' : 'tank';
    } else {
        type = roll < 0.2 ? 'basic' : roll < 0.4 ? 'fast' : roll < 0.7 ? 'shooter' : 'tank';
    }
    enemies.push(new Enemy(type));
}

// ---- Game Flow ----
let player;

function resetGame() {
    player = new Player();
    score = 0;
    lives = 3;
    bullets = [];
    enemies = [];
    enemyBullets = [];
    particles = [];
    powerUps = [];
    enemySpawnTimer = 0;
    difficultyTimer = 0;
    spawnInterval = 60;
    frameCount = 0;
    document.getElementById('score').textContent = '0';
    document.getElementById('lives').textContent = '3';
}

function startGame() {
    resetGame();
    initStars();
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('gameover-screen').classList.add('hidden');
    gameRunning = true;
}

function gameOver() {
    gameRunning = false;
    document.getElementById('final-score').textContent = score;
    document.getElementById('gameover-screen').classList.remove('hidden');
}

// ---- Main Game Loop ----
function gameLoop() {
    requestAnimationFrame(gameLoop);

    // Clear
    ctx.fillStyle = '#0a0a2e';
    ctx.fillRect(0, 0, W, H);

    // Stars always animate
    updateStars();
    drawStars();

    if (!gameRunning) return;

    frameCount++;

    // Spawn enemies
    enemySpawnTimer++;
    difficultyTimer++;
    if (difficultyTimer % 600 === 0 && spawnInterval > 20) {
        spawnInterval -= 5;
    }
    if (enemySpawnTimer >= spawnInterval) {
        spawnEnemy();
        enemySpawnTimer = 0;
    }

    // Update
    player.update();

    for (const b of bullets) b.update();
    bullets = bullets.filter(b => b.alive);

    for (const eb of enemyBullets) eb.update();
    enemyBullets = enemyBullets.filter(b => b.alive);

    for (const e of enemies) e.update();
    enemies = enemies.filter(e => e.alive);

    for (const p of powerUps) p.update();
    powerUps = powerUps.filter(p => p.alive);

    for (const p of particles) p.update();
    particles = particles.filter(p => p.life > 0);

    // Bullet-Enemy collision
    for (const b of bullets) {
        for (const e of enemies) {
            if (b.alive && e.alive && rectsOverlap(b, e)) {
                b.alive = false;
                e.hit();
            }
        }
    }

    // Enemy-Player collision
    for (const e of enemies) {
        if (e.alive && rectsOverlap(player, e)) {
            e.alive = false;
            spawnExplosion(e.x + e.w / 2, e.y + e.h / 2, e.color, 12);
            if (player.hit()) return;
        }
    }

    // EnemyBullet-Player collision
    for (const eb of enemyBullets) {
        if (eb.alive && circleRectOverlap(eb, player)) {
            eb.alive = false;
            if (player.hit()) return;
        }
    }

    // PowerUp-Player collision
    for (const pu of powerUps) {
        if (pu.alive && rectsOverlap({
            x: pu.x - pu.w / 2, y: pu.y - pu.h / 2, w: pu.w, h: pu.h
        }, player)) {
            pu.alive = false;
            if (player.powerLevel < 3) player.powerLevel++;
            spawnExplosion(pu.x, pu.y, '#00ff88', 8);
        }
    }

    // Draw
    for (const e of enemies) e.draw();
    for (const b of bullets) b.draw();
    for (const eb of enemyBullets) eb.draw();
    for (const pu of powerUps) pu.draw();
    player.draw();
    for (const p of particles) p.draw();
}

// ---- Init ----
initStars();
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);
gameLoop();
