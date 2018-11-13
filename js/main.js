// =============================================================================
// Sprites
// =============================================================================

function Hero(game, x, y) {
    // call Phaser.Sprite constructor
    Phaser.Sprite.call(this, game, x, y, 'hero');

    // anchor
    this.anchor.set(0.5, 0.5);
    // physics properties
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;
    // animations
    this.animations.add('stop', [0]);
    this.animations.add('run', [1, 2], 8, true); // 8fps looped
    this.animations.add('jump', [3]);
    this.animations.add('fall', [4]);
    this.animations.add('die', [5, 6, 5, 6, 5, 6, 5, 6], 12); // 12fps no loop
    this.animations.add('climb', [7, 8], 6, true);
    this.animations.add('ladder', [7]);


    // starting animation
    this.animations.play('stop');
}

// inherit from Phaser.Sprite
Hero.prototype = Object.create(Phaser.Sprite.prototype);
Hero.prototype.constructor = Hero;

Hero.prototype.move = function (direction) {
    // guard
    if (this.isFrozen) { return; }

    const SPEED = 200;
    this.body.velocity.x = direction * SPEED;

    // update image flipping & animations
    if (this.body.velocity.x < 0) {
        this.scale.x = -1;
    }
    else if (this.body.velocity.x > 0) {
        this.scale.x = 1;
    }
};
Hero.prototype.climb = function (direction) {
    // guard
    if (this.isFrozen) { return; }

    const SPEED = 200;
    this.body.velocity.y = direction * SPEED;
};

Hero.prototype.jump = function () {
    const JUMP_SPEED = 400;
    let canJump = this.body.touching.down && this.alive && !this.isFrozen;

    if (canJump || this.isBoosting) {
        this.body.velocity.y = -JUMP_SPEED;
        this.isBoosting = true;
    }

    return canJump;
};

Hero.prototype.stopJumpBoost = function () {
    this.isBoosting = false;
};

Hero.prototype.bounce = function () {
    const BOUNCE_SPEED = 200;
    this.body.velocity.y = -BOUNCE_SPEED;
};

Hero.prototype.update = function () {
    // update sprite animation, if it needs changing
    let animationName = this._getAnimationName();
    if (this.animations.name !== animationName) {
        this.animations.play(animationName);
    }
};

Hero.prototype.freeze = function () {
    this.body.enable = false;
    this.isFrozen = true;
};

Hero.prototype.die = function () {
    this.alive = false;
    this.body.enable = false;

    this.animations.play('die').onComplete.addOnce(function () {
        this.kill();
    }, this);
};

// returns the animation name that should be playing depending on
// current circumstances
Hero.prototype._getAnimationName = function () {
    let name = 'stop'; // default animation

    if (!this.alive) {
        name = 'die';
    }
    else if (this.isFrozen) {
        name = 'stop';
    }
    else if (this.isClimbing && this.body.velocity.y !== 0) {
        name = 'climb';
    }
    else if (this.isClimbing) {
        name = 'ladder';
    }
    else if (this.body.velocity.y < 0) {
        name = 'jump';
    }
    else if (this.body.velocity.y >= 0 && !this.body.touching.down) {
        name = 'fall';
    }
    else if (this.body.velocity.x !== 0 && this.body.touching.down) {
        name = 'run';
    }

    return name;
};

//
// Spider (enemy)
//

function Spider(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'spider');

    // anchor
    this.anchor.set(0.5);
    // animation
    this.animations.add('crawl', [0, 1, 2], 8, true);
    this.animations.add('die', [0, 4, 0, 4, 0, 4, 3, 3, 3, 3, 3, 3], 12);
    this.animations.play('crawl');

    // physic properties
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;
    this.body.velocity.x = Spider.SPEED;
}

Spider.SPEED = 100;

// inherit from Phaser.Sprite
Spider.prototype = Object.create(Phaser.Sprite.prototype);
Spider.prototype.constructor = Spider;

Spider.prototype.update = function () {
    // check against walls and reverse direction if necessary
    if (this.body.touching.right || this.body.blocked.right) {
        this.body.velocity.x = -Spider.SPEED; // turn left
    }
    else if (this.body.touching.left || this.body.blocked.left) {
        this.body.velocity.x = Spider.SPEED; // turn right
    }
};

Spider.prototype.die = function () {
    this.body.enable = false;

    this.animations.play('die').onComplete.addOnce(function () {
        this.kill();
    }, this);
};

// =============================================================================
// Loading state
// =============================================================================

LoadingState = {};

LoadingState.init = function () {
    // keep crispy-looking pixels
    this.game.renderer.renderSession.roundPixels = true;
    // TODO: use this to scale the game!
    this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
    this.game.scale.setUserScale(1, 1);
    // enable crisp rendering
    this.game.renderer.renderSession.roundPixels = true;
    Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
};

LoadingState.preload = function () {
    this.game.load.text('level:0', 'data/level00.yaml');
    this.game.load.text('level:1', 'data/level01.yaml');

    this.game.load.image('font:numbers', 'images/numbers.png');
    this.game.load.image('font:full', 'images/font.png');

    this.game.load.image('icon:coin', 'images/coin_icon.png');
    this.game.load.image('background', 'images/background.png');
    this.game.load.image('background_title', 'images/background_title.png');
    this.game.load.image('title', 'images/title.png');
    this.game.load.image('level_1', 'images/level_1.png');
    this.game.load.image('level_2', 'images/level_2.png');
    this.game.load.image('level_3', 'images/level_3.png');
    this.game.load.image('level_indicator', 'images/level_indicator.png');
    this.game.load.image('invisible-wall', 'images/invisible_wall.png');
    this.game.load.image('ground', 'images/ground.png');
    this.game.load.image('platform:full', 'images/platform_full.png');
    this.game.load.image('platform:side', 'images/platform_side.png');
    this.game.load.image('ladder:1x4', 'images/ladder_1x4.png');
    this.game.load.image('water', 'images/water.png');
    this.game.load.image('darkness', 'images/darkness.png');
    this.game.load.image('darkness_stage', 'images/darkness_stage.png');
    this.game.load.image('chair_justin', 'images/chair_justin.png');
    this.game.load.image('chair_travis', 'images/chair_travis.png');
    this.game.load.image('chair_griffin', 'images/chair_griffin.png');
    this.game.load.image('dialogue_box', 'images/dialogue_box.png');
    this.game.load.image('table', 'images/table.png');
    this.game.load.image('justin', 'images/justin.png');
    this.game.load.image('travis', 'images/travis.png');
    this.game.load.image('griffin', 'images/griffin.png');
    this.game.load.image('bubble', 'images/bubble.png');
    this.game.load.image('crowd', 'images/crowd.png');
    this.game.load.image('stage', 'images/stage.png');

    this.game.load.spritesheet('decoration', 'images/decor.png', 42, 42);
    this.game.load.spritesheet('hero', 'images/hero.png', 38, 48);
    this.game.load.spritesheet('spotlights', 'images/spotlights.png', 270, 74);
    this.game.load.spritesheet('switch', 'images/switch.png', 42, 78);
    this.game.load.spritesheet('stage:lighting', 'images/stage_lighting.png', 338, 294);
    this.game.load.spritesheet('coin', 'images/coin_animated.png', 22, 22);
    this.game.load.spritesheet('timer', 'images/timer.png', 72, 60);
    this.game.load.spritesheet('spider', 'images/spider.png', 42, 32);
    this.game.load.spritesheet('fusebox', 'images/fusebox.png', 110, 110);
    this.game.load.spritesheet('icon:water', 'images/water_icon.png', 20, 34);

    this.game.load.audio('sfx:jump', 'audio/jump.wav');
    this.game.load.audio('sfx:timer_drop', 'audio/timer_drop.wav');
    this.game.load.audio('sfx:electricity', 'audio/electricity.wav');
    this.game.load.audio('sfx:switch', 'audio/switch.wav');
    this.game.load.audio('sfx:breaker', 'audio/breaker.wav');
    this.game.load.audio('sfx:coin', 'audio/coin.wav');
    this.game.load.audio('sfx:water', 'audio/water.wav');
    this.game.load.audio('sfx:stomp', 'audio/stomp.wav');
    this.game.load.audio('sfx:door', 'audio/door.wav');
    this.game.load.audio('bgm', ['audio/bgm.mp3', 'audio/bgm.ogg']);

    // Best font size: 17
    this.game.load.bitmapFont('SilkscreenBitmap', 'fonts/SilkscreenBitmap.png', 'fonts/SilkscreenBitmap.fnt');
};

LoadingState.create = function () {
    // TODO: switch back to title
    this.game.state.start('play', true, false, {level: 0});
};

// =============================================================================
// Title Screen
// =============================================================================

TitleState = {};

TitleState.init = function () {
    console.log('title screen')
};

TitleState.create = function () {
    this.keys = this.game.input.keyboard.addKeys({
        up: Phaser.KeyCode.UP,
        down: Phaser.KeyCode.DOWN,
        enter: Phaser.KeyCode.ENTER,
    });

    this.keys.down.onUp.add(() => this._updateSelectedOption(1));
    this.keys.up.onUp.add(() => this._updateSelectedOption(-1));
    this.keys.enter.onUp.add(() => this._startGame());

    this.game.add.image(0, 0, 'background_title');
    this.game.add.image(100, 100, 'title');

    this.options = this.game.add.group();
    const level_1 = this.game.make.image(50, 0, 'level_1');
    const level_2 = this.game.make.image(50, 100, 'level_2');
    const level_3 = this.game.make.image(50, 200, 'level_3');
    
    this.optionSelected = 0;
    this.level_indicator = this.game.make.image(0, this.optionSelected * 100,
        'level_indicator');

    this.options.add(level_1);
    this.options.add(level_2);
    this.options.add(level_3);
    this.options.add(this.level_indicator);
    this.options.position.set(this.game.width - 400, 300);
};
TitleState._startGame = function () {
    const level = 0; // TODO: this.optionSelected
    this.game.state.start('play', true, false, {level});
};

TitleState._updateSelectedOption = function (direction) {
    this.optionSelected += direction;
    if (this.optionSelected < 0) {
        this.optionSelected = 0;
    }
    if (this.optionSelected > 2) {
        this.optionSelected = 2;
    }
    this.level_indicator.position.set(0, this.optionSelected * 100);
    console.log(this.optionSelected)
}

TitleState.update = function () {

};

// =============================================================================
// Play state
// =============================================================================

PlayState = {};

const LEVEL_COUNT = 2;

PlayState.init = function (data) {
    this.keys = this.game.input.keyboard.addKeys({
        one: Phaser.KeyCode.ONE,
        two: Phaser.KeyCode.TWO,
        three: Phaser.KeyCode.THREE,

        x: Phaser.KeyCode.X,
        left: Phaser.KeyCode.LEFT,
        right: Phaser.KeyCode.RIGHT,
        up: Phaser.KeyCode.UP,
        down: Phaser.KeyCode.DOWN,
        space: Phaser.KeyCode.SPACEBAR,
    });

    this.coinPickupCount = 0;
    this.hasWater = false;
    this.level = (data.level || 0) % LEVEL_COUNT;

    this.debug = false;
    this.instructionCount = 0;
};

PlayState.create = function () {
    // fade in (from black)
    this.camera.flash('#000000');

    // create sound entities
    this.sfx = {
        jump: this.game.add.audio('sfx:jump'),
        timerDrop: this.game.add.audio('sfx:timer_drop'),
        electricity: this.game.add.audio('sfx:electricity'),
        switch: this.game.add.audio('sfx:switch'),
        breaker: this.game.add.audio('sfx:breaker'),
        coin: this.game.add.audio('sfx:coin'),
        water: this.game.add.audio('sfx:water'),
        stomp: this.game.add.audio('sfx:stomp'),
        door: this.game.add.audio('sfx:door')
    };
    this.sfx.electricity.onStop.add(() => {
        this.sfx.switch.play();
    });
    //this.bgm = this.game.add.audio('bgm');
    //this.bgm.loopFull();

    // create level entities and decoration
    this.game.add.image(0, 0, 'background');

    let sortaYAML = this.game.cache.getText(`level:${this.level}`)
    sortaYAML = sortaYAML.replace(/\/\/.*?(?:\n|$)/g, '');
    this._loadLevel(JSON.parse(sortaYAML));

    // create UI score boards
    this._createHud();
    this._createDialogueBox();

    this.keys.one.onUp.add(() => this._lightsOut());
    this.keys.two.onUp.add(() => this._timerFall());
    this.keys.three.onUp.add(() => this._spotlightsOff());
    
    this._addInstruction('Press 1 to blow a fuse');
    this._addInstruction('Press 2 to knock the timer over');
    this._addInstruction('Press 3 to turn the spotlights off');

    //  Create our Timer
    timer = this.game.time.create(false);
    this.timeLeft = 260; // Seconds left in level
    timer.loop(1000, this._updateTimer, this);
    timer.start();
};

PlayState._addInstruction = function (ins) {
    this.bgDecoration.add(this.game.add.bitmapText(100,
        60 + 20*this.instructionCount, 'SilkscreenBitmap', ins, 17));
    this.instructionCount ++;
}

PlayState._updateTimer = function () {
    if (this.timeLeft === 0) {
        // TODO: end the level
        console.log('Level over!')
    } else {
        this.timeLeft--;
    }
};
PlayState._lightsOut = function () {
    if (!this.isDark) {
        this.fusebox.animations.play('dying');
        this.fusebox.animations.currentAnim.onComplete.add(function () { this.isDark = true; }, this);
        this.sfx.electricity.play();
    }
};
PlayState._lightsOn = function () {
    if (this.isDark) {
        this.fusebox.animations.play('fixed');
        this.isDark = false;
        this.sfx.switch.play();
    }
};
PlayState._spotlightsOff = function () {
    if (this.stageLighting.visible === true) {
        this.stageLighting.visible = false;
        this.stageDarkness.visible = true;
        this.spotlights.animations.play('off');
        this.spotlightSwitch.animations.play('off');
        this.sfx.breaker.play();
    }
};
PlayState._spotlightsOn = function () {
    if (this.stageLighting.visible === false) {
        this.stageLighting.visible = true;
        this.stageDarkness.visible = false;
        this.spotlights.animations.play('on');
        this.spotlightSwitch.animations.play('on');
        this.sfx.coin.play();
    }
};
PlayState._timerFall = function () {
    if (!this.timerDown) {
        this.timerDown = true;
        this.timerText.visible = false;
        this.timer.animations.play('falling');
        this.sfx.timerDrop.play();
    }
};
PlayState._timerFix = function () {
    if (this.timerDown) {
        this.timerDown = false;
        this.timerText.visible = true;
        this.timer.animations.play('up');
        this.sfx.coin.play();
    }
};

PlayState.update = function () {
    const {onLadder} = this._handleCollisions();
    this._handleInput(onLadder);

    // update darkness
    if (!this.isDark) {
        this.isDarkness.visible = false;
    }
    else {
        this.isDarkness.visible = true;
        this.isDarkness.x = this.hero.x;
        this.isDarkness.y = this.hero.y;
    }

    // update hud
    this.waterIcon.frame = this.hasWater ? 1 : 0;
    this.coinScoreText.text = `x${this.coinPickupCount}`;
    const timeStr = `${Math.floor(this.timeLeft/60)}:${("0" +
        (this.timeLeft % 60)).slice(-2)}`;
    this.timeLeftText.text = timeStr;
    this.timerText.text = timeStr;
    if (this.debug) {
        this.mousePosText.text = `${Math.floor(this.game.input.activePointer.x)}` +
            ` ${Math.floor(this.game.input.activePointer.y)}`;
    }
};

PlayState.shutdown = function () {
    this.bgm.stop();
};

PlayState._handleCollisions = function () {
    this.game.physics.arcade.collide(this.spiders, this.platforms);
    this.game.physics.arcade.collide(this.spiders, this.enemyWalls);
    this.game.physics.arcade.collide(this.hero, this.platforms);

    // hero vs coins (pick up)
    this.game.physics.arcade.overlap(this.hero, this.coins, this._onHeroVsCoin,
        null, this);
    // hero vs ladder (climb)
    const onLadder = this.game.physics.arcade.overlap(this.hero, this.ladders);
    // hero vs water (pick up)
    this.game.physics.arcade.overlap(this.hero, this.water, this._onHeroVsWater,
        null, this);
    // hero vs boy (deliver item)
    this.game.physics.arcade.overlap(this.hero, this.griffin, this._onHeroVsGriffin,
        null, this);
    //
    this.game.physics.arcade.overlap(this.hero, this.fusebox, this._lightsOn,
        null, this);
    this.game.physics.arcade.overlap(this.hero, this.timer, this._timerFix,
        null, this);
    this.game.physics.arcade.overlap(this.hero, this.spotlightSwitch, this._spotlightsOn,
        null, this);
    // collision: hero vs enemies (kill or die)
    this.game.physics.arcade.overlap(this.hero, this.spiders,
        this._onHeroVsEnemy, null, this);
    return {onLadder};
};

PlayState._handleInput = function (onLadder) {
    const speed = this.keys.x.isDown ? 2 : 1;
    if (this.keys.left.isDown) { // move hero left
        this.hero.move(-1 * speed);
    }
    else if (this.keys.right.isDown) { // move hero right
        this.hero.move(1 * speed);
    }
    else { // stop
        this.hero.move(0);
    }

    this.hero.isClimbing = onLadder &&
        (this.hero.isClimbing || this.keys.up.isDown || this.keys.down.isDown)
    this.hero.body.allowGravity = !this.hero.isClimbing;

    if (onLadder && this.hero.isClimbing) {
        if (this.keys.up.isDown) {
            this.hero.climb(-1 * speed);
        } else if (this.keys.down.isDown) {
            this.hero.climb(1 * speed);
        } else {
            this.hero.climb(0);
        }
    }

    // handle jump
    const JUMP_HOLD = 1; // ms -- 200 originally, changed to "1" as in 
    if (this.keys.space.downDuration(JUMP_HOLD)) {
        let didJump = this.hero.jump();
        if (didJump) { this.sfx.jump.play(); }
    }
    else {
        this.hero.stopJumpBoost();
    }
};

PlayState._onHeroVsWater = function (hero, water) {
    this.sfx.water.play();
    water.kill();
    this.hasWater = true;
};

PlayState._onHeroVsCoin = function (hero, coin) {
    this.sfx.coin.play();
    coin.kill();
    this.coinPickupCount++;
};

PlayState._onHeroVsEnemy = function (hero, enemy) {
    // the hero can kill enemies when is falling (after a jump, or a fall)
    if (hero.body.velocity.y > 0) {
        enemy.die();
        hero.bounce();
        this.sfx.stomp.play();
    }
    else { // game over -> play dying animation and restart the game
        hero.die();
        this.sfx.stomp.play();
        hero.events.onKilled.addOnce(function () {
            this.game.state.restart(true, false, {level: this.level});
        }, this);

        // NOTE: bug in phaser in which it modifies 'touching' when
        // checking for overlaps. This undoes that change so spiders don't
        // 'bounce' agains the hero
        enemy.body.touching = enemy.body.wasTouching;
    }
};

PlayState._onHeroVsGriffin = function (hero, griffin) {
    if (this.hasWater) {
        this.hasWater = false;
        this.coinPickupCount++;
        this.bubbleIndex['griffin'].bubble.visible = false;
        //this.water.revive();
    }
};

PlayState._goToNextLevel = function () {
    this.camera.fade('#000000');
    this.camera.onFadeComplete.addOnce(function () {
        // change to next level
        this.game.state.restart(true, false, {
            level: this.level + 1
        });
    }, this);
};

PlayState._loadLevel = function (data) {
    // create all the groups/layers that we need
    this.bgDecoration = this.game.add.group();
    this.platforms = this.game.add.group();
    this.ladders = this.game.add.group();
    this.coins = this.game.add.group();
    this.spiders = this.game.add.group();
    this.enemyWalls = this.game.add.group();
    this.enemyWalls.visible = false;
    this.bubbles = this.game.add.group();
    this.bubbleIndex = {};

    // spawn hero and enemies
    this._spawnCharacters({hero: data.hero, spiders: data.spiders});

    // spawn level decoration
    data.decoration.forEach(function (deco) {
        this.bgDecoration.add(
            this.game.add.image(deco.x, deco.y, 'decoration', deco.frame));
    }, this);

    this.overlays = this.game.add.group();
    
    // spawn platforms
    data.platforms.forEach(this._spawnPlatform, this);

    // spawn important objects
    data.ladders.forEach(this._spawnLadder, this);
    data.coins.forEach(this._spawnCoin, this);
    this._spawnStage(data.stage.x, data.stage.y);
    this._spawnWater(data.water.x, data.water.y);
    this._spawnTable(data.table.x, data.table.y);
    this._spawnTimer(data.timer.x, data.timer.y);
    this._spawnFusebox(data.fusebox.x, data.fusebox.y);
    this._spawnSpotlights(data.spotlights.x, data.spotlights.y);

    // 
    this._spawnStageDarkness(data.stage.x, data.stage.y);
    this._spawnDarkness(data.hero.x, data.hero.y);

    // spawn goal
    this._startGoals();

    // enable gravity
    const GRAVITY = 1200;
    this.game.physics.arcade.gravity.y = GRAVITY;
};

PlayState._startGoals = function () {
    this.bubbleIndex['griffin'].bubble.visible = true;
}

PlayState._spawnCharacters = function (data) {
    // spawn spiders
    data.spiders.forEach(function (spider) {
        let sprite = new Spider(this.game, spider.x, spider.y);
        this.spiders.add(sprite);
    }, this);

    // spawn hero
    this.hero = new Hero(this.game, data.hero.x, data.hero.y);
    this.game.add.existing(this.hero);
};

PlayState._spawnPlatform = function (platform) {
    let sprite = this.platforms.create(
        platform.x, platform.y, platform.image);

    // physics for platform sprites
    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;
    sprite.body.immovable = true;

    // spawn invisible walls at each side, only detectable by enemies
    this._spawnEnemyWall(platform.x, platform.y, 'left');
    this._spawnEnemyWall(platform.x + sprite.width, platform.y, 'right');
};

PlayState._spawnLadder = function (ladder) {
    let sprite = this.ladders.create(ladder.x, ladder.y, ladder.image);

    // physics (so we can detect overlap with the hero)
    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;
};

PlayState._spawnEnemyWall = function (x, y, side) {
    let sprite = this.enemyWalls.create(x, y, 'invisible-wall');
    // anchor and y displacement
    sprite.anchor.set(side === 'left' ? 1 : 0, 1);
    // physic properties
    this.game.physics.enable(sprite);
    sprite.body.immovable = true;
    sprite.body.allowGravity = false;
};

PlayState._spawnCoin = function (coin) {
    let sprite = this.coins.create(coin.x, coin.y, 'coin');
    sprite.anchor.set(0.5, 0.5);

    // physics (so we can detect overlap with the hero)
    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;

    // animations
    sprite.animations.add('rotate', [0, 1, 2, 1], 6, true); // 6fps, looped
    sprite.animations.play('rotate');
};

PlayState._spawnWater = function (x, y) {
    this.water = this.bgDecoration.create(x, y, 'water');
    this.water.anchor.set(0.5, 0.5);
    // enable physics to detect collisions, so the hero can pick the water up
    this.game.physics.enable(this.water);
    this.water.body.allowGravity = false;

    // add a small 'up & down' animation via a tween
    this.water.y -= 3;
    this.game.add.tween(this.water)
        .to({y: this.water.y + 6}, 800, Phaser.Easing.Sinusoidal.InOut)
        .yoyo(true)
        .loop()
        .start();
};
PlayState._spawnDarkness = function (x, y) {
    this.isDarkness = this.overlays.create(x, y, 'darkness');
    this.isDarkness.anchor.set(0.5, 0.5);
};
PlayState._spawnStage = function (x, y) {
    this.bgDecoration.create(x, y, 'crowd');
    this.bgDecoration.create(x, y, 'stage');
};
PlayState._spawnStageDarkness = function (x, y) {
    this.stageDarkness = this.bgDecoration.create(x, y, 'darkness_stage');
    this.stageDarkness.visible = false;
};

PlayState._spawnImage = function (imgName, x, y) {
    const img = this.bgDecoration.create(x, y, imgName);
    img.anchor.setTo(0.5, 1);
    return img;
};
PlayState._spawnBoy = function (imgName, x, y) {
    const boy = this._spawnImage(imgName, x, y - 4);
    this.game.physics.enable(boy);
    boy.body.allowGravity = false;

    this._spawnImage('chair_' + imgName, x, y + 4);

    const bubble = this.game.add.group(this.bubbles);
    bubble.add(this._spawnImage('bubble', x, y - 58));
    bubble.add(this._spawnImage('water', x, y - 70));    

    // add a small 'up & down' animation via a tween
    bubble.y -= 3;
    this.game.add.tween(bubble)
        .to({y: bubble.y + 8}, 600, Phaser.Easing.Sinusoidal.InOut)
        .yoyo(true)
        .loop()
        .start();

    bubble.visible = false;
    this.bubbleIndex[imgName] = {bubble, x, y: y - 48};
    
    return boy;
};
PlayState._spawnTimer = function (x, y) {
    const timerGroup = this.game.add.group();
    const sprite = this._spawnImage('timer', 0, 0);
    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;
    sprite.animations.add('up', [0], 6, true);
    sprite.animations.add('falling', [3, 2, 4], 2, false);
    sprite.animations.add('down', [4], 6, true);
    this.timer = sprite;

    this.timerText = this.game.add.bitmapText(-30, -16, "SilkscreenBitmap", "4:20", 17);
    this.timerText.smoothed = false;
    this.timerText.tint = 0xd41e1e;

    timerGroup.add(this.timer);
    timerGroup.add(this.timerText);
    timerGroup.position.set(x, y);
    this.bgDecoration.add(timerGroup);  
};
PlayState._spawnFusebox = function (x, y) {
    this.fusebox = this._spawnImage('fusebox', x, y);
    this.game.physics.enable(this.fusebox);
    this.fusebox.body.allowGravity = false;
    this.fusebox.animations.add('closed', [0]);
    this.fusebox.animations.add('dying', [0, 1, 0, 1, 2, 4, 2, 4, 2, 4, 3], 5, false);
    this.fusebox.animations.add('fixed', [2, 0], 1, false);
};
PlayState._spawnSpotlights = function (x, y) {
    const sprite = this.overlays.create(x, y, 'spotlights');
    sprite.anchor.set(0.5, 0.5)
    sprite.animations.add('on', [0], 6, false);
    sprite.animations.add('off', [1], 6, false);
    this.spotlights = sprite;

    const swtch = this.bgDecoration.create(x + 35, y - 90, 'switch');
    this.game.physics.enable(swtch);
    swtch.body.allowGravity = false;
    swtch.animations.add('on', [0], 6, false);
    swtch.animations.add('off', [4], 6, false);
    this.spotlightSwitch = swtch;

    this.stageLighting = this.overlays.create(x, y, 'stage:lighting');
    this.stageLighting.anchor.set(0.5, 0);
};

PlayState._spawnTable = function (x, y) {
    this.table = this._spawnImage('table', x, y);
    this.justin = this._spawnBoy('justin', x - 50, y);
    this.travis = this._spawnBoy('travis', x, y);
    this.griffin = this._spawnBoy('griffin', x + 50, y);
};

PlayState._createHud = function () {
    this.waterIcon = this.game.make.image(0, 19, 'icon:water');
    this.waterIcon.anchor.set(0, 0.5);

    const coinIcon = this.game.make.image(this.waterIcon.width + 7, 0, 'icon:coin');
    const y = 4;

    this.mousePosText = this.game.add.bitmapText(600, y, "SilkscreenBitmap", "", 34);
    this.mousePosText.smoothed = false;
    this.coinScoreText = this.game.add.bitmapText(coinIcon.x + coinIcon.width, y, "SilkscreenBitmap", "", 34);
    this.coinScoreText.smoothed = false;
    this.timeLeftText = this.game.add.bitmapText(200, y, "SilkscreenBitmap", "", 34);
    this.timeLeftText.smoothed = false;

    this.hud = this.game.add.group();
    this.hud.add(coinIcon);
    this.hud.add(this.coinScoreText);
    this.hud.add(this.mousePosText);
    this.hud.add(this.timeLeftText);
    this.hud.add(this.waterIcon);
    this.hud.position.set(10, 8);
};

PlayState._createDialogueBox = function () {
    this.dialogueBox = this.game.add.group();
    this.dialogueBox.add(this.game.make.image(0, 0, "dialogue_box"));

    const text = this.game.add.bitmapText(16, 16, "SilkscreenBitmap", "", 17);
    text.maxWidth = 280;
    text.smoothed = false;
    text.text = "Hello and welcome to My Brother, My Brother, and Me!";

    this.dialogueBox.position.set(323, 250);
    this.dialogueBox.add(text);

    // this.dialogueBox.y -= 3;
    // this.game.add.tween(this.dialogueBox)
    //     .to({y: this.dialogueBox.y + 6}, 800, Phaser.Easing.Sinusoidal.InOut)
    //     .yoyo(true)
    //     .loop()
    //     .start();
};

// =============================================================================
// entry point
// =============================================================================

window.onload = function () {
    let game = new Phaser.Game(960, 600, Phaser.AUTO, 'game');
    game.state.add('play', PlayState);
    game.state.add('title', TitleState);
    game.state.add('loading', LoadingState);
    game.state.start('loading');
};
