export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 32;
    this.baseColor = "red";
    this.color = this.baseColor;

    this.velX = 0;
    this.velY = 0;

    this.speed = 2.5;
    this.jumpStrength = -8;
    this.gravity = 0.4;
    this.onGround = false;

    this.dashAvailable = true;
    this.dashing = false;
    this.dashTime = 0;
    this.dashDuration = 200; // milliseconds
    this.dashSpeed = 8;
    this.dashDir = 0;

    this.canJump = false;

    this.wallTouchDir = 0; 
  }

  touchingGround() {
    this.velY = 0;
    this.onGround = true;
    this.canJump = true;
    this.dashAvailable = true;
    this.dashing = false;
    this.color = this.baseColor;
  }

    touchingWall(dir) {
    this.velX = 0;
    if (this.velY > 1) this.velY = 1;
    this.canJump = true;
    this.wallTouchDir = dir; // -1 if touching left wall, 1 if right
    }

  startDash(direction) {
    this.dashing = true;
    this.dashAvailable = false;
    this.dashTime = performance.now();
    this.dashDir = direction;
    this.color = "blue";
  }

  update(keys, canvasHeight) {
    const now = performance.now();

    // Dash logic
    if (this.dashing) {
      // Lock movement
      this.velX = this.dashDir * this.dashSpeed;
      this.velY = 0; // Ignore gravity

      if (now - this.dashTime >= this.dashDuration) {
        this.dashing = false;
        this.color = this.baseColor;
      }
    } else {

      if (!this.onGround) {
        this.canJump = false; // prevent midair jumping
        }
      this.wallTouchDir = 0; // reset wall contact by default

      // Horizontal movement
      if (keys["ArrowLeft"] || keys["KeyA"]) this.velX = -this.speed;
      else if (keys["ArrowRight"] || keys["KeyD"]) this.velX = this.speed;
      else this.velX = 0;

      // Jump
        if ((keys["Space"] || keys["KeyW"]) && this.canJump) {
        this.velY = this.jumpStrength;
        if (this.wallTouchDir !== 0) {
            this.velX = -this.wallTouchDir * (this.speed * 1.5); // push away from wall
        }
        this.canJump = false;
        this.wallTouchDir = 0;
        }

      // Dash input
      if ((keys["KeyQ"] || keys["ShiftLeft"]) && this.dashAvailable) {
        const dir = keys["ArrowLeft"] || keys["KeyA"] ? -1 : 1;
        this.startDash(dir);
      }

      // Apply gravity
      this.velY += this.gravity;
      if (this.velY > 3.5) this.velY = 3.5; // Limit falling speed
      if (this.velY < -8) this.velY = -8; // Limit jumping speed
    }

    // Update position
    this.x += this.velX;
    this.y += this.velY;

    // Ground collision
    if (this.y + this.height >= canvasHeight) {
      this.touchingGround();
      this.y = canvasHeight - this.height;
    }
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
