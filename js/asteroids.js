/* asteroids.js
   A simple asteroids game
*/
var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");
var objects = [];

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
    this.r = 50;

    objects.push(this);
}

// Default object drawing
GameObject.prototype.draw = function() {
    ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI);
    ctx.stroke();
};

// Update object state
GameObject.prototype.update = function(dt) {
    this.x += this.vx*dt;
    this.y += this.vy*dt;
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

    //console.log(time);

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

var testObject = new GameObject();

run();
