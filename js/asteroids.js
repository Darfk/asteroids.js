/* asteroids.js
   A simple asteroids game
*/
var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");
var objects = [];

// Config

// ship thrust in pixels/second/second
thrust = 100;
// Topspeed of ship in pixels/second
topSpeed = 500;
// Ship speed lost per second
speedDecay = 0.2;

ctx.fillStyle = "#000";
ctx.strokeStyle = "#ffffff";

// Moving object
function GameObject() {
    // Coordinates of center in  pixels (canvas coordinates)
    this.x = 400;
    this.y = 400;

    // Velocity in pixels/second
    this.vx = 0;
    this.vy = 0;
    
    // Radius of object in pixels
    this.r = 20;

    objects.push(this);
}

// Default object drawing
GameObject.prototype.draw = function() {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI);
    ctx.stroke();
};

// Update object state
GameObject.prototype.update = function(dt) {
    this.x += this.vx*dt;
    this.y += this.vy*dt;

    // Screen wrapping
    if (this.x - this.r > screen.width && this.vx > 0)
        this.x = 0 - this.r;
    if (this.x + this.r < 0 && this.vx < 0)
        this.x = screen.width + this.r;
    if (this.y - this.r > screen.height && this.vy > 0)
        this.y = 0 - this.r;
    if (this.y + this.r < 0 && this.vy < 0)
        this.y = screen.height + this.r;

};

// Update the scene
function update(dt) {
    // Update all the objects
    for (var i = 0, len = objects.length; i < len; i++) {
        objects[i].update(dt);
    }
}
// Draw the scene
function draw() { 
    // Clear the screen
    ctx.clearRect(0, 0, screen.width, screen.height);
    ctx.fillRect(0, 0, screen.width, screen.height);
    
    // Draw all the objects
    for (var i = 0, len = objects.length; i < len; i++) {
        objects[i].draw();
    }
}


var lastTick = null;
// Main loop
function run(time) {
    // Run at at no more than 30fps, to avoid hogging cpu
    setTimeout(function() {requestAnimationFrame(run);}, 1000/30);

    if (lastTick == null) lastTick = time;

    var ms = time - lastTick;
    lastTick = time;

    if (ms > 0) {
        if (ms > 100) ms = 100;
        var dt = ms/1000;
        update(dt);
    }
        draw();
}

var ship = new GameObject();
// Ship-specific state
ship.thrustingUp = false;
ship.thrustingDown = false;
ship.thrustingLeft = false;
ship.thrustingRight = false;

// Clockwise rotation of the ship in radians, with
// 0 = right.
ship.angle = 0;

// Ship-specific state update
ship.update = function(dt) {
    // Apply acceleration
    if (this.thrustingUp) {
        this.vx += Math.cos(this.angle) * thrust * dt;
        this.vy += Math.sin(this.angle) * thrust * dt;
    } if (this.thrustingDown) {
        this.vx -= Math.cos(this.angle) * thrust * dt;
        this.vy -= Math.sin(this.angle) * thrust * dt;
    }

    // Apply rotation
    if (this.thrustingLeft)
        this.angle -= Math.PI * dt;
    if (this.thrustingRight)
        this.angle += Math.PI * dt;
    
    // Velocity decay
    this.vx -= (this.vx * speedDecay * dt);
    this.vy -= (this.vy * speedDecay * dt);
    
    // Clamp top speed
    speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed / topSpeed > 1) {
        this.vx /= speed / topSpeed;
        this.vy /= speed / topSpeed;
    }

    GameObject.prototype.update.call(this, dt);
};

// Ship-specific drawing
ship.draw = function() {
    ctx.beginPath();
    ctx.save();
    console.log(this.angle);
    var pi = Math.PI;

    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    ctx.moveTo(this.r, 0);
    ctx.lineTo(Math.cos(2*pi/3)*this.r, -Math.sin(2*pi/3)*this.r);
    ctx.lineTo(0, 0);
    ctx.lineTo(Math.cos(4*pi/3)*this.r, -Math.sin(4*pi/3)*this.r);
    ctx.closePath();

    ctx.stroke()
    ctx.restore();

    GameObject.prototype.draw.call(this);
}

// Keyboard input
function handleKeydown(event) {
    // w, up
    if (event.keyCode == 38 || event.keyCode == 87)
        ship.thrustingUp = true;

    // d, right
    if (event.keyCode == 39 || event.keyCode == 68)
        ship.thrustingRight = true;

    // s, down
    if (event.keyCode == 40 || event.keyCode == 83)
        ship.thrustingDown = true;

    // a, left
    if (event.keyCode == 37 || event.keyCode == 65)
        ship.thrustingLeft = true;
}

function handleKeyup(event) {
    // w, up
    if (event.keyCode == 38 || event.keyCode == 87)
        ship.thrustingUp = false;

    // d, right
    if (event.keyCode == 39 || event.keyCode == 68)
        ship.thrustingRight = false;

    // s, down
    if (event.keyCode == 40 || event.keyCode == 83)
        ship.thrustingDown = false;

    // a, left
    if (event.keyCode == 37 || event.keyCode == 65)
        ship.thrustingLeft = false;
}

document.addEventListener('keydown', handleKeydown);
document.addEventListener('keyup', handleKeyup);

document.add
run();
