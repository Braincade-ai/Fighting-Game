const assets_list = {
    "background": "assets/bg.png",
    "platform": "assets/plat2.png",
    "player": "assets/kid.png",
    "enemy": "assets/enemy_kid1.png",
    "projectile": "assets/cake.png",
    "collectible": "assets/runner.png",
    "avoidable": "assets/runner.png",
};

const assetsLoader = {
    "background": "background",
    "player": "player",
    "platform": "platform",
    "enemy": "enemy",
    "projectile": "projectile"
};

// Custom UI Elements
const gameTitle = `Game Title`
const gameDescription = `Game Description`
const gameInstruction =
    `Instructions:
  1. Use UP arrow to jump
  2. Use RIGHT arrow to throw`;


// Custom Font Colors
const globalPrimaryFontColor = "#FFF";
const globalSecondaryFontColor = "#0F0"

const orientationSizes = {
    "landscape": {
        "width": 1280,
        "height": 720,
    },
    "portrait": {
        "width": 720,
        "height": 1280,
    }
}

// Game Orientation
const orientation = "landscape";

// Touuch Screen Controls
const joystickEnabled = false;
const buttonEnabled = false;

/*
------------------- GLOBAL CODE STARTS HERE -------------------
*/


// JOYSTICK DOCUMENTATION: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/virtualjoystick/
const rexJoystickUrl = "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js";

// BUTTON DOCMENTATION: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/button/
const rexButtonUrl = "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexbuttonplugin.min.js";


// Start Scene
class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }

    preload() {
        startScenePreload(this);
        loadBlurredBg(this);
    }

    create() {

        this.width = this.game.config.width;
        this.height = this.game.config.height;
        createBlurredBg(this);

        // Add UI elements
        this.add.text(this.width / 2, this.height / 2 - 300, gameTitle, { fontSize: '32px', fill: globalPrimaryFontColor }).setOrigin(0.5);
        this.add.text(this.width / 2, this.height / 2 - 200, gameDescription, { fontSize: '24px', fill: globalPrimaryFontColor }).setOrigin(0.5);
        this.add.text(this.width / 2, this.height / 2 - 100, gameInstruction, { fontSize: '20px', fill: globalPrimaryFontColor }).setOrigin(0.5);

        const startButton = this.add.text(this.width / 2, this.height / 2, 'Start', { fontSize: '24px', fill: globalSecondaryFontColor }).setOrigin(0.5);
        startButton.setInteractive({ cursor: 'pointer' });
        startButton.on('pointerdown', () => this.scene.start('GameScene'));
    }
}

// Game Over Scene
class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    preload() {
        this.width = this.game.config.width;
        this.height = this.game.config.height;
        gameOverScenePreload(this);
        loadBlurredBg(this);

    }

    create(data) {

        this.width = this.game.config.width;
        this.height = this.game.config.height;
        createBlurredBg(this);

        // Add UI elements
        this.add.text(this.width / 2, 100, 'GAME OVER', { fontSize: '32px', fill: globalPrimaryFontColor }).setOrigin(0.5);
        this.add.text(this.width / 2, 200, `Score: ${data.score}`, { fontSize: '24px', fill: globalPrimaryFontColor }).setOrigin(0.5);

        const restartButton = this.add.text(this.width / 2, this.height / 2, 'Restart', { fontSize: '24px', fill: globalSecondaryFontColor }).setOrigin(0.5);
        restartButton.setInteractive({ cursor: 'pointer' });
        restartButton.on('pointerdown', () => this.scene.start('GameScene'));
    }
}

// Pause Scene
class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseScene' });
    }

    preload() {
        pauseScenePreload(this);
        loadBlurredBg(this);
    }

    create() {

        this.width = this.game.config.width;
        this.height = this.game.config.height;
        createBlurredBg(this)

        // Add UI elements
        const resumeButton = this.add.text(this.game.config.width / 2, this.game.config.height / 2, 'Resume', { fontSize: '24px', fill: globalSecondaryFontColor }).setOrigin(0.5);
        resumeButton.setInteractive({ cursor: 'pointer' });
        resumeButton.on('pointerdown', () => this.resumeGame());

        this.input.keyboard.on('keydown-ESC', () => this.resumeGame());
    }

    resumeGame() {
        this.scene.resume('GameScene');
        this.scene.stop();
    }
}

// Game Scene
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.lastThrowTime = 0;
        this.score = 0;

    }

    preload() {
        this.score = 0;

        this.load.plugin('rexvirtualjoystickplugin', rexJoystickUrl, true);
        this.load.plugin('rexbuttonplugin', rexButtonUrl, true);

        // Load In-Game Assets from assetsLoader
        for (const key in assetsLoader) {
            this.load.image(key, assets_list[assetsLoader[key]]);
        }

        gameScenePreload(this);
        displayProgressLoader.call(this);
    }

    create() {
        this.lastThrowTime = 0;
        this.score = 0;

        this.width = this.game.config.width;
        this.height = this.game.config.height;
        this.bg = this.add.sprite(0, 0, 'background').setOrigin(0, 0);
        this.bg.setScrollFactor(0);
        this.bg.displayHeight = this.game.config.height;
        this.bg.displayWidth = this.game.config.width;

        // Add UI elements
        this.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '20px', fill: globalPrimaryFontColor });

        // Add input listeners
        this.input.keyboard.on('keydown-ESC', () => this.pauseGame());
        const pauseButton = this.add.text(this.game.config.width - 20, 10, 'Pause', { fontSize: '16px', fill: globalSecondaryFontColor }).setOrigin(1, 0);
        pauseButton.setInteractive({ cursor: 'pointer' });
        pauseButton.on('pointerdown', () => this.pauseGame());

        const joyStickRadius = 50;

        if (joystickEnabled) {
            this.joyStick = this.plugins.get('rexvirtualjoystickplugin').add(this, {
                x: joyStickRadius * 2,
                y: this.height - (joyStickRadius * 2),
                radius: 50,
                base: this.add.circle(0, 0, 80, 0x888888, 0.5),
                thumb: this.add.circle(0, 0, 40, 0xcccccc, 0.5),
                // dir: '8dir',   // 'up&down'|0|'left&right'|1|'4dir'|2|'8dir'|3
                // forceMin: 16,
            });
        }

        if (buttonEnabled) {
            this.buttonA = this.add.rectangle(this.width - 80, this.height - 100, 80, 80, 0xcccccc, 0.5)
            this.buttonA.button = this.plugins.get('rexbuttonplugin').add(this.buttonA, {
                mode: 1,
                clickInterval: 100,
            });

            this.buttonA.button.on('down', function (button, gameObject) {
                console.log("button clicked");
            });
        }

        gameSceneCreate(this);

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

        // How to use joystick with keyboard

        // var joystickKeys = this.joyStick.createCursorKeys();
        // var keyboardKeys = this.input.keyboard.createCursorKeys();
        // if (joystickKeys.right.isDown || keyboardKeys.right.isDown) {
        //     console.log("right");
        // }

        // How to use button

        // if (this.buttonA.button.isDown) {
        //     console.log("button pressed");
        // }

        gameSceneUpdate(this);
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
        // this.score++;
        this.updateScore(10);
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

    updateScore(points) {
        this.score += points;
        this.updateScoreText();
    }

    updateScoreText() {
        this.scoreText.setText(`Score: ${this.score}`);
    }

    gameOver() {
        this.scene.start('GameOverScene', { score: this.score });
    }

    pauseGame() {
        this.scene.pause();
        this.scene.launch('PauseScene');
    }
}

function loadBlurredBg(game) {
    if (typeof assetsLoader === 'undefined') return;
    game.blurredBg = Object.keys(assetsLoader).find(dataKey => dataKey.includes("background"));
    if (game.blurredBg) {
        game.load.image(game.blurredBg, assets_list[assetsLoader[game.blurredBg]]);
    }
}

function createBlurredBg(game) {
    if (!game.blurredBg) return;
    game.blurredBg = game.add.image(0, 0, game.blurredBg).setOrigin(0, 0);
    game.blurredBg.displayHeight = game.game.config.height;
    game.blurredBg.displayWidth = game.game.config.width;
    game.blurredBg.preFX.addGradient("black", "black", 0.3)
    game.blurredBg.preFX.addBlur(0, 2, 2, 0.3);
}

function displayProgressLoader() {
    let width = 320;
    let height = 50;
    let x = (this.game.config.width / 2) - 160;
    let y = (this.game.config.height / 2) - 50;

    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(x, y, width, height);

    const loadingText = this.make.text({
        x: this.game.config.width / 2,
        y: this.game.config.height / 2 + 20,
        text: 'Loading...',
        style: {
            font: '20px monospace',
            fill: '#ffffff'
        }
    }).setOrigin(0.5, 0.5);
    loadingText.setOrigin(0.5, 0.5);

    const progressBar = this.add.graphics();
    this.load.on('progress', (value) => {
        progressBar.clear();
        progressBar.fillStyle(0x364afe, 1);
        progressBar.fillRect(x, y, width * value, height);
    });
    this.load.on('fileprogress', function (file) {
        console.log(file.src);
    });
    this.load.on('complete', function () {
        progressBar.destroy();
        progressBox.destroy();
        loadingText.destroy();
    });
}

/*
------------------- GLOBAL CODE ENDS HERE -------------------
*/

// Configuration object
const config = {
    type: Phaser.AUTO,
    width: orientationSizes[orientation].width,
    height: orientationSizes[orientation].height,
    scene: [StartScene, GameScene, PauseScene, GameOverScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    /*
    ADD CUSTOM CONFIG ELEMENTS HERE
    */
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false,
        },
    },
};

// Game instance
const game = new Phaser.Game(config);

// START SCENE PHASER FUNCTIONS
function startScenePreload(game) { }
function startSceneCreate(game) { }
function startSceneUpdate(game) { }

// PAUSE SCENE PHASER FUNCTIONS
function pauseScenePreload(game) { }
function pauseSceneCreate(game) { }
function pauseSceneUpdate(game) { }

// GAME OVER SCENE PHASER FUNCTIONS
function gameOverScenePreload(game) { }
function gameOverSceneCreate(game) { }
function gameOverSceneUpdate(game) { }



// GAME SCENE PHASER FUNCTIONS
function gameScenePreload(game) {
}

//CREATE FUNCTION FOR THE GAME SCENE
function gameSceneCreate(game) {

}

//UPDATE FUNCTION FOR THE GAME SCENE
function gameSceneUpdate(game) {
    // Use updateScore(10) to increment score
    // Use gameOver() for game over
}