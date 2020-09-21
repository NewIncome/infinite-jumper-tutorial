import Phaser from '../lib/phaser.js'

export default class GameOver extends Phaser.Scene {
  constructor() {
    super('game-over')
  }

  create() {
    const width = this.scale.width
    const height = this.scale.height

    this.add.text(width * 0.5, height * 0.4, 'Game Over', {
      fontSize: 48
    }).setOrigin(0.5) // so it is centered vertically and horizontally

    // instructions to restart the game
    this.add.text(width * 0.5, height * 0.7, '  to restart game\n[spaceBar] or click', {
      fontSize: 22
    }).setOrigin(0.5)

    this.input.keyboard.once('keydown_SPACE', () => {
      this.scene.start('game')
    })
    // we use .onceinstead.on. This saves us from having to clean up
    // the event since it will beautomatically cleaned up after the
    // event is fired once

    // to also enable restarting with a click/touch
    this.input.on('pointerdown', () => {
      this.scene.start('game')
    })
  }
}