const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 500,
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 600 }, debug: false }
    },
    scene: { preload, create, update }
};

new Phaser.Game(config);

let player, girl, groundSprite, cursors, keys, spaceKey;
let isCrouching = false;
let lightGfx1, lightGfx2, lightX1, lightX2, lightSpeed1, lightSpeed2;
let lives = 3, hitCooldown = 0;
let livesText, overlayText;
let particles = [];
let gameState = 'playing'; // 'playing' | 'kiss' | 'levelComplete' | 'gameOver'
let currentLevel = 1;
let kissTimer = 0;
let rKey;

const BEAM_SRC_RIGHT = 790;
const BEAM_SRC_LEFT  = 10;
const BEAM_HIT_HW    = 55;
const KISS_DIST      = 40;

function preload() {}

function create() {
    drawBackground(this);

    let groundGfx = this.make.graphics({ add: false });
    groundGfx.fillStyle(0x2d7a2d);
    groundGfx.fillRect(0, 0, 800, 10);
    groundGfx.fillStyle(0x5c3d1e);
    groundGfx.fillRect(0, 10, 800, 55);
    groundGfx.generateTexture('ground', 800, 65);
    groundGfx.destroy();

    groundSprite = this.physics.add.staticImage(400, 467, 'ground');
    drawBushes(this);

    lightGfx1 = this.add.graphics();
    lightGfx2 = this.add.graphics();
    lightX1 = 580;  lightSpeed1 = -140;
    lightX2 = 200;  lightSpeed2 =  110;

    // ── Chico de pie ─────────────────────────────────────────────
    let pg = this.make.graphics({ add: false });
    pg.fillStyle(0x111111);
    pg.fillRect(5, 0, 3, 5);
    pg.fillRect(9, 0, 4, 4);
    pg.fillRect(14, 1, 3, 5);
    pg.fillCircle(10, 10, 8);
    pg.lineStyle(3, 0x111111);
    pg.lineBetween(10, 18, 10, 42);
    pg.lineBetween(10, 24, 0, 34);
    pg.lineBetween(10, 24, 20, 34);
    pg.fillStyle(0x111111);
    pg.fillPoints([{x:4,y:42},{x:10,y:42},{x:9,y:58},{x:1,y:57}], true);
    pg.fillPoints([{x:10,y:42},{x:16,y:42},{x:19,y:57},{x:11,y:58}], true);
    pg.generateTexture('player_stand', 20, 60);
    pg.destroy();

    // ── Chico agachado ────────────────────────────────────────────
    let pg2 = this.make.graphics({ add: false });
    pg2.fillStyle(0x111111);
    pg2.fillRect(5, 24, 3, 4);
    pg2.fillRect(9, 23, 4, 4);
    pg2.fillRect(14, 24, 3, 4);
    pg2.fillCircle(10, 30, 7);
    pg2.lineStyle(3, 0x111111);
    pg2.lineBetween(10, 37, 10, 48);
    pg2.lineBetween(10, 41, 1, 50);
    pg2.lineBetween(10, 41, 19, 50);
    pg2.fillStyle(0x111111);
    pg2.fillPoints([{x:5,y:48},{x:10,y:48},{x:8,y:59},{x:2,y:57}], true);
    pg2.fillPoints([{x:10,y:48},{x:15,y:48},{x:18,y:57},{x:12,y:59}], true);
    pg2.generateTexture('player_crouch', 20, 60);
    pg2.destroy();

    player = this.physics.add.sprite(120, 370, 'player_stand');
    player.setCollideWorldBounds(true);
    this.physics.add.collider(player, groundSprite);

    // ── Chica ─────────────────────────────────────────────────────
    let gg = this.make.graphics({ add: false });
    gg.fillStyle(0x4488dd);
    gg.fillTriangle(0, 7, 6, 5, 2, 22);
    gg.fillTriangle(14, 5, 20, 7, 18, 22);
    gg.fillTriangle(5, 4, 15, 4, 10, 1);
    gg.fillStyle(0x111111);
    gg.fillCircle(10, 10, 8);
    gg.lineStyle(3, 0x111111);
    gg.lineBetween(10, 18, 10, 36);
    gg.lineBetween(10, 24, 0, 34);
    gg.lineBetween(10, 24, 20, 34);
    gg.fillStyle(0x881144);
    gg.fillTriangle(5, 36, 15, 36, 1, 57);
    gg.fillTriangle(5, 36, 15, 36, 19, 57);
    gg.lineStyle(2, 0x111111);
    gg.lineBetween(8, 50, 5, 57);
    gg.lineBetween(12, 50, 15, 57);
    gg.generateTexture('girl', 20, 60);
    gg.destroy();

    girl = this.physics.add.staticSprite(660, 405, 'girl');

    drawCameras(this);

    cursors   = this.input.keyboard.createCursorKeys();
    keys      = this.input.keyboard.addKeys({
        left:  Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D
    });
    spaceKey  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    keys.down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    rKey      = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    livesText = this.add.text(16, 16, '♥  ♥  ♥', {
        fontSize: '20px', color: '#ff6666', fontFamily: 'monospace'
    });

    // Texto de overlay (beso / nivel / game over) — oculto inicialmente
    overlayText = this.add.text(400, 200, '', {
        fontSize: '36px', color: '#ffffff', fontFamily: 'monospace',
        stroke: '#000000', strokeThickness: 5,
        align: 'center'
    }).setOrigin(0.5).setVisible(false);
}

function update(time, delta) {
    // R reinicia siempre (game over o nivel completado)
    if (Phaser.Input.Keyboard.JustDown(rKey)) {
        if (gameState === 'gameOver' || gameState === 'levelComplete') {
            restartLevel(this);
            return;
        }
    }

    if (gameState !== 'playing') {
        // Durante animación de beso el jugador se queda quieto
        if (gameState === 'kiss') {
            tickParticles(delta);
            kissTimer -= delta;
            if (kissTimer <= 0) {
                gameState = 'levelComplete';
                showOverlay('NIVEL ' + currentLevel + ' COMPLETADO!\n\nR — reiniciar   N — siguiente nivel');
            }
        }
        return;
    }

    const onGround = player.body.blocked.down;

    if (cursors.left.isDown || keys.left.isDown) {
        player.setVelocityX(-180);
    } else if (cursors.right.isDown || keys.right.isDown) {
        player.setVelocityX(180);
    } else {
        player.setVelocityX(0);
    }

    if (cursors.up.isDown && onGround) {
        player.setVelocityY(-520);
    }

    if ((spaceKey.isDown || keys.down.isDown) && onGround) {
        if (!isCrouching) {
            isCrouching = true;
            player.setTexture('player_crouch');
            player.body.setSize(20, 36);
            player.body.setOffset(0, 24);
        }
    } else if (isCrouching) {
        isCrouching = false;
        player.setTexture('player_stand');
        player.body.setSize(20, 60);
        player.body.setOffset(0, 0);
    }

    // ─── Mover y dibujar hazes ──────────────────────────────────
    lightX1 += lightSpeed1 * (delta / 1000);
    if (lightX1 > 700) { lightX1 = 700; lightSpeed1 = -Math.abs(lightSpeed1); }
    if (lightX1 < 300) { lightX1 = 300; lightSpeed1 =  Math.abs(lightSpeed1); }

    lightGfx1.clear();
    lightGfx1.fillStyle(0xffee00, 0.07);
    lightGfx1.fillPoints([
        {x:BEAM_SRC_RIGHT-15,y:0},{x:BEAM_SRC_RIGHT+15,y:0},
        {x:lightX1+80,y:435},{x:lightX1-80,y:435}
    ], true);
    lightGfx1.fillStyle(0xffee00, 0.22);
    lightGfx1.fillPoints([
        {x:BEAM_SRC_RIGHT-8,y:0},{x:BEAM_SRC_RIGHT+8,y:0},
        {x:lightX1+55,y:435},{x:lightX1-55,y:435}
    ], true);
    lightGfx1.fillStyle(0xfffde7, 0.42);
    lightGfx1.fillTriangle(BEAM_SRC_RIGHT-2,0,BEAM_SRC_RIGHT+2,0,lightX1,435);

    lightX2 += lightSpeed2 * (delta / 1000);
    if (lightX2 > 500) { lightX2 = 500; lightSpeed2 = -Math.abs(lightSpeed2); }
    if (lightX2 < 80)  { lightX2 = 80;  lightSpeed2 =  Math.abs(lightSpeed2); }

    lightGfx2.clear();
    lightGfx2.fillStyle(0xffee00, 0.07);
    lightGfx2.fillPoints([
        {x:BEAM_SRC_LEFT-15,y:0},{x:BEAM_SRC_LEFT+15,y:0},
        {x:lightX2+80,y:435},{x:lightX2-80,y:435}
    ], true);
    lightGfx2.fillStyle(0xffee00, 0.22);
    lightGfx2.fillPoints([
        {x:BEAM_SRC_LEFT-8,y:0},{x:BEAM_SRC_LEFT+8,y:0},
        {x:lightX2+55,y:435},{x:lightX2-55,y:435}
    ], true);
    lightGfx2.fillStyle(0xfffde7, 0.42);
    lightGfx2.fillTriangle(BEAM_SRC_LEFT-2,0,BEAM_SRC_LEFT+2,0,lightX2,435);

    // ─── Detección de luz ───────────────────────────────────────
    hitCooldown -= delta;

    const playerInBeam = !isCrouching && (
        Math.abs(player.x - lightX1) < BEAM_HIT_HW ||
        Math.abs(player.x - lightX2) < BEAM_HIT_HW
    );

    if (playerInBeam && hitCooldown <= 0) {
        lives--;
        hitCooldown = 2000;
        this.cameras.main.flash(300, 200, 20, 20);

        if (lives <= 0) {
            triggerGameOver(this);
        } else {
            livesText.setText(Array(lives).fill('♥').join('  '));
        }
    }

    // ─── Detección de beso ──────────────────────────────────────
    const nearGirl = Math.abs(player.x - girl.x) < KISS_DIST &&
                     Math.abs(player.y - girl.y) < 50;
    const beamOnCouple = !isCrouching && (
        Math.abs(player.x - lightX1) < BEAM_HIT_HW ||
        Math.abs(player.x - lightX2) < BEAM_HIT_HW
    );

    if (nearGirl && !beamOnCouple) {
        triggerKiss(this);
    }

    tickParticles(delta);
}

// ── Beso ──────────────────────────────────────────────────────────
function triggerKiss(scene) {
    gameState = 'kiss';
    kissTimer = 2200;
    player.setVelocityX(0);

    // Partículas rosas y doradas entre los dos personajes
    const cx = (player.x + girl.x) / 2;
    const cy = (player.y + girl.y) / 2 - 10;
    spawnParticles(scene, cx, cy);

    // Etiqueta flotante "+1 BESO ♥"
    let label = scene.add.text(cx, cy - 30, '+1 BESO ♥', {
        fontSize: '22px', color: '#ffaacc', fontFamily: 'monospace',
        stroke: '#440022', strokeThickness: 4
    }).setOrigin(0.5);

    scene.tweens.add({
        targets: label,
        y: cy - 80,
        alpha: 0,
        duration: 1800,
        ease: 'Quad.easeOut',
        onComplete: () => label.destroy()
    });
}

// ── Partículas manuales ───────────────────────────────────────────
function spawnParticles(scene, cx, cy) {
    const colors = [0xff88bb, 0xffdd55, 0xff44aa, 0xffff88, 0xff66cc];
    for (let i = 0; i < 28; i++) {
        let angle = Math.random() * Math.PI * 2;
        let speed = 60 + Math.random() * 110;
        let gfx = scene.add.graphics();
        let color = colors[Math.floor(Math.random() * colors.length)];
        let size = 3 + Math.random() * 4;
        gfx.fillStyle(color, 1);
        gfx.fillCircle(0, 0, size);
        gfx.x = cx + (Math.random() - 0.5) * 20;
        gfx.y = cy + (Math.random() - 0.5) * 20;
        particles.push({
            gfx,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 40,
            life: 900 + Math.random() * 700,
            maxLife: 900 + Math.random() * 700
        });
    }
}

function tickParticles(delta) {
    const dt = delta / 1000;
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.life -= delta;
        p.gfx.x += p.vx * dt;
        p.gfx.y += p.vy * dt;
        p.vy += 120 * dt; // gravedad suave
        p.gfx.alpha = Math.max(0, p.life / p.maxLife);
        if (p.life <= 0) {
            p.gfx.destroy();
            particles.splice(i, 1);
        }
    }
}

// ── Game over / nivel completo / reinicio ─────────────────────────
function triggerGameOver(scene) {
    gameState = 'gameOver';
    lightSpeed1 = 0;
    lightSpeed2 = 0;
    livesText.setText('♥'.repeat(0)).setColor('#ff2222');
    scene.cameras.main.shake(400, 0.012);
    showOverlay('GAME OVER\n\nR — reiniciar');
}

function showOverlay(msg) {
    overlayText.setText(msg).setVisible(true);
}

function restartLevel(scene) {
    // Limpiar partículas
    particles.forEach(p => p.gfx.destroy());
    particles = [];

    gameState   = 'playing';
    lives       = 3;
    hitCooldown = 0;
    isCrouching = false;
    lightSpeed1 = -140;
    lightSpeed2 =  110;
    lightX1     = 580;
    lightX2     = 200;

    player.setPosition(120, 370);
    player.setVelocity(0, 0);
    player.setTexture('player_stand');
    player.body.setSize(20, 60);
    player.body.setOffset(0, 0);

    livesText.setText('♥  ♥  ♥').setColor('#ff6666');
    overlayText.setVisible(false);
}

// ── Cámaras visuales ─────────────────────────────────────────────
function drawCameras(scene) {
    let cam = scene.add.graphics();

    // Cámara derecha
    cam.fillStyle(0x3a3a3a);
    cam.fillRect(781, 0, 14, 8);
    cam.fillRect(769, 7, 27, 18);
    cam.fillStyle(0x555555);
    cam.fillRect(769, 7, 3, 18);
    cam.fillStyle(0x1a1a1a);
    cam.fillCircle(773, 16, 7);
    cam.fillStyle(0xaa0000);
    cam.fillCircle(773, 16, 5);
    cam.fillStyle(0xff5555, 0.9);
    cam.fillCircle(773, 16, 2);

    // Cámara izquierda
    cam.fillStyle(0x3a3a3a);
    cam.fillRect(5, 0, 14, 8);
    cam.fillRect(4, 7, 27, 18);
    cam.fillStyle(0x555555);
    cam.fillRect(28, 7, 3, 18);
    cam.fillStyle(0x1a1a1a);
    cam.fillCircle(27, 16, 7);
    cam.fillStyle(0xaa0000);
    cam.fillCircle(27, 16, 5);
    cam.fillStyle(0xff5555, 0.9);
    cam.fillCircle(27, 16, 2);
}

function drawBackground(scene) {
    let bg = scene.add.graphics();

    bg.fillStyle(0x050510);
    bg.fillRect(0, 0, 800, 440);
    bg.fillStyle(0x090920, 0.4);
    bg.fillRect(0, 220, 800, 220);

    bg.fillStyle(0xffffff);
    [
        [50,30],[120,80],[200,20],[280,60],[350,30],[430,70],
        [500,25],[580,55],[650,35],[720,75],[90,120],[170,150],
        [240,100],[320,130],[400,110],[470,160],[540,90],[610,140],
        [680,100],[750,120],[30,200],[150,220],[260,190],[370,210],
        [480,200],[590,230],[700,195],[760,215],[75,250],[225,260],
        [445,50],[525,140],[335,85],[145,45],[695,250],[555,300]
    ].forEach(([x, y]) => bg.fillRect(x, y, 2, 2));

    bg.fillStyle(0xfffde7);
    bg.fillCircle(720, 55, 28);
    bg.fillStyle(0x050510);
    bg.fillCircle(710, 47, 22);

    [
        [100, 285, 0.8],
        [360, 258, 1.0],
        [625, 275, 0.7]
    ].forEach(([x, y, s]) => {
        bg.fillStyle(0x1a2a5a, 0.75);
        bg.fillEllipse(x, y, 80 * s, 28 * s);
        bg.fillEllipse(x + 22 * s, y - 12 * s, 55 * s, 24 * s);
        bg.fillEllipse(x - 20 * s, y - 8 * s, 45 * s, 20 * s);
    });
}

function drawBushes(scene) {
    let bushes = scene.add.graphics();
    bushes.fillStyle(0x1a4a1a);
    [[65,430],[215,427],[420,429],[605,427],[745,430]].forEach(([x, y]) => {
        bushes.fillCircle(x, y, 20);
        bushes.fillCircle(x + 18, y + 5, 16);
        bushes.fillCircle(x - 18, y + 5, 16);
        bushes.fillCircle(x + 5,  y - 8, 13);
    });
}
