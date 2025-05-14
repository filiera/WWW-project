export class Goal {
  constructor(x, y, width = 32, height = 32) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = "goldenrod"; // Color for the goal
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  collidesWith(player) {
    return !(
      player.x + player.width < this.x ||
      player.x > this.x + this.width ||
      player.y + player.height < this.y ||
      player.y > this.y + this.height
    );
  }
}