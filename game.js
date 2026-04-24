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

let player, groundSprite, cursors, keys;

function preload() {}

function create() {
    drawBackground(this);

    // Suelo: textura generada (pasto + tierra)
    let groundGfx = this.make.graphics({ add: false });
    groundGfx.fillStyle(0x2d7a2d);
    groundGfx.fillRect(0, 0, 800, 10);
    groundGfx.fillStyle(0x5c3d1e);
    groundGfx.fillRect(0, 10, 800, 55);
    groundGfx.generateTexture('ground', 800, 65);
    groundGfx.destroy();

    // y=467 centra la textura de 65px entre y=435 y y=500
    groundSprite = this.physics.add.staticImage(400, 467, 'ground');

    drawBushes(this);

    // Jugador: stick figure generado como textura
    let pg = this.make.graphics({ add: false });
    pg.fillStyle(0x111111);
    pg.fillCircle(10, 10, 8);        // cabeza
    pg.lineStyle(3, 0x111111);
    pg.lineBetween(10, 18, 10, 42);  // cuerpo
    pg.lineBetween(10, 24, 0,  34);  // brazo izq
    pg.lineBetween(10, 24, 20, 34);  // brazo der
    pg.lineBetween(10, 42, 3,  57);  // pierna izq
    pg.lineBetween(10, 42, 17, 57);  // pierna der
    pg.generateTexture('player', 20, 60);
    pg.destroy();

    player = this.physics.add.sprite(120, 370, 'player');
    player.setCollideWorldBounds(true);
    this.physics.add.collider(player, groundSprite);

    cursors = this.input.keyboard.createCursorKeys();
    keys = this.input.keyboard.addKeys({
        left:  Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D
    });
}

function update() {
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
}

function drawBackground(scene) {
    let bg = scene.add.graphics();

    // Cielo nocturno
    bg.fillStyle(0x050510);
    bg.fillRect(0, 0, 800, 440);
    bg.fillStyle(0x090920, 0.4);
    bg.fillRect(0, 220, 800, 220);

    // Estrellas
    bg.fillStyle(0xffffff);
    [
        [50,30],[120,80],[200,20],[280,60],[350,30],[430,70],
        [500,25],[580,55],[650,35],[720,75],[90,120],[170,150],
        [240,100],[320,130],[400,110],[470,160],[540,90],[610,140],
        [680,100],[750,120],[30,200],[150,220],[260,190],[370,210],
        [480,200],[590,230],[700,195],[760,215],[75,250],[225,260],
        [445,50],[525,140],[335,85],[145,45],[695,250],[555,300]
    ].forEach(([x, y]) => bg.fillRect(x, y, 2, 2));

    // Luna creciente
    bg.fillStyle(0xfffde7);
    bg.fillCircle(720, 55, 28);
    bg.fillStyle(0x050510);
    bg.fillCircle(710, 47, 22);

    // Nubes oscuras
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
