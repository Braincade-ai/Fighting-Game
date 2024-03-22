class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        this.lastThrowTime = 0;
        this.score = 0;
    }

    preload() {
        // Load assets
        this.load.image('background', 'assets/bg.png'); // Background image
        this.load.image('player', 'assets/kid.png'); // Player's cake cannon
        this.load.image('platform', 'assets/plat2.png');
        this.load.image('projectile', 'assets/cake.png');
        this.load.image('enemy', 'assets/enemy_kid1.png');

    }

    create() {
        // Add background
        this.lastThrowTime = 0;
        this.score = 0;

        this.width = this.game.config.width;
        this.height = this.game.config.height;
        this.bg = this.add.sprite(0, 0, 'background').setOrigin(0, 0);
        this.bg.setScrollFactor(0);
        this.bg.displayHeight = this.game.config.height;
        this.bg.displayWidth = this.game.config.width;

        this.platforms = this.physics.add.staticGroup();
        let platform = this.platforms.create(470, 600, 'platform').setScale(2, .3);
        platform.refreshBody();
        platform.body.setSize(platform.body.width * 0.8, platform.body.height * 0.8, true);

        // Create the player and scale it to 0.2
        this.player = this.physics.add.sprite(100, 300, 'player').setScale(0.15);
        this.player.setBounce(0.2); // Optional bounce
        this.player.setCollideWorldBounds(true);
        this.player.body.setGravityY(500);
        this.player.body.setSize(this.player.body.width * 0.2, this.player.body.height * 0.8, true);

        this.enemy = this.physics.add.sprite(this.game.config.width - 200, 300, 'enemy').setScale(0.15);
        this.enemy.setBounce(0.2); // Optional bounce
        this.enemy.setCollideWorldBounds(true);
        this.enemy.body.setGravityY(500);
        this.enemy.body.setSize(this.enemy.body.width * 0.2, this.enemy.body.height * 0.8, true);

        this.projectiles = this.physics.add.group({
            defaultKey: 'projectile',
            maxSize: 1000, // Adjust as needed
        });



        // Enable collision between the player and the platform
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.enemy, this.platforms);
        this.physics.add.collider(this.projectiles, this.enemy, this.hitEnemy, null, this);


        // Input events
        this.cursors = this.input.keyboard.createCursorKeys();


    }

    update(time) {
        // console.log(time);
        this.player.setVelocityX(15);
        this.enemy.setVelocityX(-15);
        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-400); // Adjust the jump velocity as needed
        }

        if (this.cursors.right.isDown && time > this.lastThrowTime + 700) {
            this.throw();
            this.lastThrowTime = time; // Update last throw time
        }

    }
    throw() {
        let projectile = this.projectiles.get(this.player.x, this.player.y);
        if (projectile) {
            projectile.setActive(true).setVisible(true);
            projectile.body.gravity.y = 0;
            projectile.setScale(0.06);
            projectile.setVelocityX(300);

            projectile.body.setSize(projectile.body.width * 0.8, projectile.body.height * 0.6, true);


            // Destroy projectile after 8 seconds
            this.time.delayedCall(4000, () => {
                projectile.destroy();
            });
        }
    }
    hitEnemy(enemy, projectile) {
        this.score++;
        projectile.destroy();
        this.cameras.main.flash(50);
        let pointText = this.add.text(projectile.x, projectile.y, '+1', { fontSize: '32px', fontStyle: 'bold', color: '#000000' });

        // Tween to move the text up and fade it out
        this.tweens.add({
            targets: pointText,
            y: enemy.y - 150, // Move up by 50 pixels
            alpha: { from: 1, to: 0 }, // Fade out
            duration: 3000, // Duration of 1000 milliseconds
            ease: 'Linear', // Linear easing
            onComplete: () => {
                pointText.destroy(); // Destroy the text object to clean up
            }
        });
        console.log(this.score);

    }

}

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container', // This should match the ID of the element you want your game to go in
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 },
        },
    },
    scene: [MainScene]
};

new Phaser.Game(config);
