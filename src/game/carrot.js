// this file is to create the Carrot class
import Phaser from '../lib/phaser.js'

// export default class Carrot extends Phaser.GameObjects.Sprite {
// the above works fine, but just for tidyness, since we are using a
// Physics group we use:
export default class Carrot extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} Scene
   * @param {number} x
   * @param {number} y
   * @param {string} texture
   */
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture)

    this.setScale(0.5)
  }
}