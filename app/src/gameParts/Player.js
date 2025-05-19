export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 28;
    this.height = 28;
    this.baseColor = "green";
    this.color = this.baseColor;

    this.velX = 0;
    this.velY = 0;

    this.maxX = 800; // Assuming a fixed width for the canvas

    this.speed = 2.5;
    this.jumpStrength = -8;
    this.gravity = 0.4;
    this.onGround = false;
    this.onWall = false;

    this.dashAvailable = true;
    this.dashing = false;
    this.dashTime = 0;
    this.dashDuration = 150; // milliseconds
    this.dashSpeed = 8;
    this.dashDir = 0;

    this.dashDistance = 128; // how far the dash should travel (in pixels)
    this.dashTraveled = 0;   // how far we have dashed so far

    this.invincible = false;

    this.canJump = false;

    this.wallTouchDir = 0; 

    this.wallJumpTime = 0;
    this.wallJumpCooldown = 150; // ms

    this.afterImages = [];
    this.afterImageDuration = 400; // ms, how long an afterimage lasts
    this.afterImageInterval = 30;  // ms between afterimages
    this.lastAfterImageTime = 0;

  }

  touchingGround() {
    this.velY = 0;
    this.onGround = true;
    this.canJump = true;
    this.dashAvailable = true;
    //this.invincible = false;
    //this.dashing = false;
    //this.color = this.baseColor;
  }

  touchingWall(dir) {
    this.velX = 0;
    this.onWall = true;
    if (this.velY > 0.6) this.velY = 0.6;
    this.canJump = true;
    this.wallTouchDir = dir; // -1 if touching left wall, 1 if right
    }

  startDash(direction) {
    this.dashing = true;
    this.dashAvailable = false;
    this.dashTime = performance.now();
    this.dashTraveled = 0; // reset distance traveled
    this.dashDir = direction;
    this.color = "blue";
    this.invincible = true; // make player invincible during dash
  }

  update(keys, justPressed, canvasHeight) {

    // Dash logic
    if (this.dashing) {
      this.dashAvailable = false; // Disable dash until the current one is finished
      const dashStep = this.dashDir * this.dashSpeed;
      this.velX = dashStep;
      this.velY = 0; // Ignore gravity while dashing

      const now = performance.now();
      // Create afterimage every this.afterImageInterval ms
      if (now - this.lastAfterImageTime > this.afterImageInterval) {
        this.afterImages.push({
          x: this.x,
          y: this.y,
          opacity: 0.6,
          time: now,
        });
        this.lastAfterImageTime = now;
      }
      // Remove old afterimages
      this.afterImages = this.afterImages.filter(ai => now - ai.time < this.afterImageDuration);   

      this.dashTraveled += Math.abs(dashStep);

      if (this.dashTraveled >= this.dashDistance) {
        this.dashing = false;
        this.invincible = false;
        this.color = this.baseColor;
        this.velX = 0;
      }
    } else {

      if (!this.onGround && !this.onWall) {
        this.canJump = false; // prevent midair jumping
        }

      // Horizontal movement
        const now = performance.now();

        const allowHorizontalInput = now - this.wallJumpTime > this.wallJumpCooldown;

        if (allowHorizontalInput) {
        if (keys["ArrowLeft"] || keys["KeyA"]) this.velX = -this.speed;
        else if (keys["ArrowRight"] || keys["KeyD"]) this.velX = this.speed;
        else this.velX = 0;
        }


      // Jump
        if ((justPressed["Space"] || justPressed["KeyW"]) && this.canJump) {
            this.velY = this.jumpStrength;

            if (this.wallTouchDir !== 0 && !this.onGround) {
                this.velX = this.wallTouchDir * (this.speed * 1.5); // push away
                this.wallJumpTime = performance.now();
            }

            this.canJump = false;
            this.wallTouchDir = 0;
        }


      // Dash input
      if ((keys["KeyQ"] || keys["ShiftLeft"]) && this.dashAvailable) {
        var dir = 0;
        if(this.wallTouchDir === 0) {
            dir = keys["ArrowLeft"] || keys["KeyA"] ? -1 : 1;
        }
        else{
            dir = this.wallTouchDir;
        }
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

    // canvas bounds collision
    if (this.x + this.width > this.maxX) {
    this.x = this.maxX - this.width;
    this.velX = 0;
    } else if (this.x < 0) {
    this.x = 0;
    this.velX = 0;
    }

    //reset touching states
    this.wallTouchDir = 0;
    this.onWall = false;
    this.onGround = false;

  }

  draw(ctx) {
    const now = performance.now();

    // Draw afterimages
    for (const ai of this.afterImages) {
      const age = now - ai.time;
      const alpha = ai.opacity * (1 - age / this.afterImageDuration);
      ctx.fillStyle = `rgba(173, 216, 230, ${alpha})`; // light blue, fading out
      ctx.fillRect(ai.x, ai.y, this.width, this.height);
    }

    // Draw player normally
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

}
