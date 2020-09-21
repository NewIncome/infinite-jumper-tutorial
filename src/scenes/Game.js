import Phaser from '../lib/phaser.js'

import Carrot from '../game/carrot.js'

export default class Game extends Phaser.Scene {
  // /** @type {Phaser.Physics.Arcade.Sprite} */ //not working in Browser
  // player

  // /** @type {Phaser.Physics.Arcade.StaticGroup} */
  // platforms

  // /** @type {Phaser.Physics.Arcade.Group} */
  // carrots
  

  // /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
  // cursors

  constructor() {
    super('game') // is so every Scene has to define a unique key
  }

  // to reset the cCollected variable after restarting the Game
  init() {
    this.carrotsCollected = 0
  }

  // preload and create are hooks that get called at appropriate times
  // by Phaser
  preload() { // allows to load assets before starting the Scene
    // 'this' refers to the instance of the class
    // so here 'this' is the current instance of the 'Game' Scene
    console.log('...in preload...');
    this.load.image('background', 'assets/bg_layer1.png')

    this.load.image('platform', 'assets/ground_grass.png')

    this.load.image('bunny-stand', 'assets/bunny1_stand.png')

    this.load.image('bunny-jump', 'assets/bunny1_jump.png')

    this.load.image('carrot', 'assets/carrot.png')

    this.load.audio('jump', 'assets/sfx/phaseJump1.wav')

    this.cursors = this.input.keyboard.createCursorKeys()
    // this can also be in the create()
  }

  create() { // is called once all the assets for the Scene+
             // have been loaded
// Only assets that have been loaded can be used in create()
// Trying to use an unloaded asset will result in an error
    console.log('...in create...');

    this.add.image(240, 320, 'background') // (posX, posY, 'key')
      .setScrollFactor(1, 0) // so the background doesn't scroll
      // here we stop the scrolling on Y by setting it to 0.
    // ===================== create the platforms =====================
    // this.add.image(240, 320, 'platform') // this just makes an image
    //   .setScale(0.5)
    // this.physics.add.image(240, 320, 'platform') // this makes a
                          // physical body with properties & movement
    // this.physics.add.staticImage(240, 320, 'platform') // this makes
                          // a physical body with properties& 0 movement
    // const platforms = this.physics.add.staticGroup() // LOCAL VARIABLE
    this.platforms = this.physics.add.staticGroup() // CLASS PROPERTY

    // the above and below are to add many repeated elements
    for (let i=0 ; i<5 ; i++) { // to create 5 platforms
      const x = Phaser.Math.Between(80, 400) // at random x pos
      const y = 150 * i // and 150 pixels apart from each other

      /** @type {Phaser.Physics.Arcade.Spritea } */ // is a JSDoc annotation
      const platform = this.platforms.create(x, y, 'platform')
      platform.scale = 0.5 // we give each platform a scale

      /** @type {Phaser.Physics.Arcade.StaticBody} */ // these help VScode
                                      // give us the right code completion
      const body = platform.body
      body.updateFromGameObject()
      // the uFGO() is to refresh the physics body based on any changes
      // made to the GameObject like position and scale

    }
    // ======================= create the Bunny =======================
    // const player = this.physics.add.sprite(240, 320, 'bunny-stand')
    //   .setScale(0.5)
    // now we'll use the class property
    this.player = this.physics.add.sprite(240, 320, 'bunny-stand')
      .setScale(0.5)

    // ======================= create the Carrot =======================
    // // this is to add only one carrot
    // const carrot = new Carrot(this, 240, 320, 'carrot')
    // this.add.existing(carrot)
    // // now, to add many
    this.carrots = this.physics.add.group({
      classType: Carrot
    })
    // this.carrots.get(240, 320, 'carrot') // this makes some sort of noise
    // no clue what's happening there
    // so far it makes

    // ======================= Collisions =======================
    // this.physics.add.collider(platforms, player) // same thing here
    this.physics.add.collider(this.platforms, this.player)
    // * the this.player is so it is available outside of this function

    // collider between platforms and carrots
    this.physics.add.collider(this.platforms, this.carrots)

    // The Phaser.Physics.Arcade.Body class has a checkCollision
    // property where we can set which directions we want collision for
    this.player.body.checkCollision.up = false
    this.player.body.checkCollision.left = false
    this.player.body.checkCollision.right = false
    // this is so the bunny only bounces when colliding down on platforms

    // ======================= Camera Movement =======================
    // to follow the bunny as it jumps
    this.cameras.main.startFollow(this.player)
    // to stop the camera from moving left and right, done with DEAD-ZONES
    this.cameras.main.setDeadzone(this.scale.width * 1.5)
    // We are using the Phaser SCALE manager to get the width of the Game
    // that is the recommended way to get the width and height of the Game.
    // Now we will make the Bunny wrap around the screen when it goes left
    // or right, over our defined limit (our defined Scene Width)

    // ======================= Carrot Collecting =======================
    this.physics.add.overlap(
      this.player,
      this.carrots,
      this.handleCollectCarrot, // called on overlap = collideCallBack
      undefined,
      this // callback CONTEXT
    )

    // carrot count
    const style = {color: '#000', fontSize: 24}
    this.carrotsCollectedText = this.add.text(240, 10, 'Carrots: 0', style)
      .setScrollFactor(0)
      .setOrigin(0.5, 0)

    // ================ TEST, See present Velocity ================
    this.velText = this.add.text(10, 40, 'Velocity X: , Velocity Y:', style)
      .setScrollFactor(0)
  }


  // this gets run over and over again = 'update loop'
  update(t, dt) {
    // ================ create the rest New Platforms ================
    // to just repeat the already created platforms and position them
    // at the camera position + (50...100) on the y axis
    this.platforms.children.iterate(child => {
      /** @type {Phaser.Physics.Arcade.Sprite} */
      const platform = child
      const scrollY = this.cameras.main.scrollY
      if (platform.y >= scrollY + 700) {
        platform.y = scrollY - Phaser.Math.Between(50, 100)
        platform.body.updateFromGameObject()

        // create a carrot above the platform being reused
        this.addCarrotAbove(platform)
      }
    })

    // to make the bunny hop after landing on a platform
    const touchingDown = this.player.body.touching.down

    if (touchingDown) {
      this.player.setVelocityY(-300)

      // change bunny image
      this.player.setTexture('bunny-jump')

      // play jump sound
      this.sound.play('jump')
    }

    // for changing the bunny (player) image, to seem like a jump
    const vy = this.player.body.velocity.y
    if (vy > 0 && this.player.texture.key !== 'bunny-stand') {
      this.player.setTexture('bunny-stand')
    }

    // left n right movement logic
    if (this.cursors.left.isDown && !touchingDown) {
      this.player.setVelocityX(-200)
    }
    else if (this.cursors.right.isDown && !touchingDown) {
      this.player.setVelocityX(200)
    }
    else {
      this.player.setVelocityX(0) // stop X movement
    }

    // calls the wrapping function on the player(bunny)
    this.horizontalWrap(this.player)

    // set the bottom boundary for GameOver
    const bottomPlatform = this.findBottomMostPlatform()
    if (this.player.y > bottomPlatform.y + 200) {
      this.scene.start('game-over')
    }

    // ================ TEST, See present Velocity ================
    this.velText.text = `
      VelocityX: ${Math.round(this.player.body.velocity.x)}
      VelocityY: ${Math.round(this.player.body.velocity.y)}
    `
  }

  // ======================= player screen wrap =======================
  /**
   * @param {Phaser.GameObjects.Sprite} sprite
   */
  horizontalWrap(sprite) { // method can wrap in the screen any sprite
    const halfWidth = sprite.displayWidth * 0.5 // cutting sprite in half
    const gameWidth = this.scale.width
    if (sprite.x < -halfWidth) {
      sprite.x = gameWidth + halfWidth
    } else if (sprite.x > gameWidth + halfWidth) {
      sprite.x = -halfWidth
    }
  }

  // ================= add-carrot-above-sprite method =================
  /**
   * @param {Phaser.GameObjects.Sprite} sprite
   */
  addCarrotAbove(sprite) {
    const y = sprite.y - sprite.displayHeight
    // A more accurate formula is to subtract half of
    // sprite.displayHeightand half of the carrot’s
    // displayHeight from sprite.y

    const carrot = this.carrots.get(sprite.x, y, 'carrot')

    carrot.setActive(true) // to make sure carrots are active and visible
    carrot.setVisible(true) // both lines

    this.add.existing(carrot)
    carrot.body.setSize(carrot.width, carrot.height) // resizes physics body

    this.physics.world.enable(carrot) // make sure body is enabled in p w

    return carrot
  }

  // ================= collect-carrots method =================
  /**
   * @param {Phaser.Physics.Arcade.Sprite} player
   * @param {Carrot} carrot
   */
  handleCollectCarrot(player, carrot) {
    this.carrots.killAndHide(carrot) // hide from display

    this.physics.world.disableBody(carrot.body) // disable from physics world

    this.carrotsCollected++

    const value = `Carrots: ${this.carrotsCollected}`
    this.carrotsCollectedText.text = value
  }

  // ================= find-last-platform method =================
  findBottomMostPlatform() {
    const platforms = this.platforms.getChildren()
    let bottomPlatform = platforms[0]

    for (let i=1 ; i < platforms.length ; i++) {
      const platform = platforms[i]

      if (platform.y < bottomPlatform.y) {
        continue
      }
      bottomPlatform = platform
    }
    return bottomPlatform
  }
}