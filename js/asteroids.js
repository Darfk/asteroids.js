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
// Seconds between shots
shipFireTime = 0.3;
// Speed of bullets in pixels/second
// this gets added to the ship's velocity.
bulletSpeed = 100;

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
}

// Draw objects as a circle
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

// Asteroids have a random size, velocity, and start location
function Asteroid() {
    this.r = 10 + Math.random()*40;

    this.x = Math.random()*screen.width;
    this.y = Math.random()*screen.width;

    this.vx = 30 * Math.random();
    this.vy = 30 * Math.random();
}
Asteroid.prototype = new GameObject();

// The ship needs to be able to accelarate and shoot
function Ship() { 
    this.thrustingUp = false;
    this.thrustingDown = false;
    this.thrustingLeft = false;
    this.thrustingRight = false;
    this.firing = false;
    this.cooldown = 0; // time until bullet readied
    this.angle = 0;    // Clockwise rotation in radians, with 0 = right.
}
Ship.prototype = new GameObject();

// Somewhat-Newtonian physics
Ship.prototype.applyThrust = function(dt) {
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
};

// Produce bullets
Ship.prototype.updateWeapons = function(dt) {
    // Shoot
    if (this.cooldown >= 0)
        this.cooldown -= dt;
    if (this.firing && this.cooldown <= 0) {
        this.cooldown = shipFireTime
            objects.push(new Bullet(this));
    }
};

Ship.prototype.update = function(dt) {

    this.applyThrust(dt);

    // Velocity decay
    this.vx -= (this.vx * speedDecay * dt);
    this.vy -= (this.vy * speedDecay * dt);
    
    // Clamp top speed
    speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed / topSpeed > 1) {
        this.vx /= speed / topSpeed;
        this.vy /= speed / topSpeed;
    }

    this.updateWeapons(dt);

    GameObject.prototype.update.call(this, dt);
};

// Draw a trianglular shape to indicate direction
Ship.prototype.draw = function() {
    var pi = Math.PI;

    ctx.save();
    ctx.beginPath();    

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

// Bullets initial state depends on the ship that fired them
function Bullet(parent) {
    this.r = 5;
    this.x = parent.x + Math.cos(parent.angle) * (parent.r + this.r + 10);
    this.y = parent.y + Math.sin(parent.angle) * (parent.r + this.r + 10);
    this.vx = parent.vx + Math.cos(parent.angle) * bulletSpeed;
    this.vy = parent.vy + Math.sin(parent.angle) * bulletSpeed;
}
Bullet.prototype = new GameObject();


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

// Player ship

var ship = new Ship();
objects.push(ship);

// Keyboard input
function handleKeydown(event) {
    if (event.keyCode == 32)
        ship.firing = true;
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
    if (event.keyCode == 32)
        ship.firing = false;
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


// Asteroids
for (i=0; i < 5; i++) {
    objects.push(new Asteroid());
    
}

run();
