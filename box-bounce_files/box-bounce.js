
var gl;
var box = vec2(0.0, 0.0);
var dX, dY;
var maxX = 1.0;
var maxY = 1.0;
var boxRad = 0.05;
var boxVertices = [
    vec2(-0.05, -0.05),
    vec2( 0.05, -0.05),
    vec2( 0.05,  0.05),
    vec2(-0.05,  0.05)
];
var locBox;


var paddleVertices = [
    vec2(-0.1, -0.9),
    vec2(-0.1, -0.86),
    vec2( 0.1, -0.86),
    vec2( 0.1, -0.9)
];
var paddleBuffer;
var mouseX;
var movement = false;


window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);

    dX = Math.random()*0.05 - 0.025;
    dY = 0.03;

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var boxBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(boxVertices), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    locBox = gl.getUniformLocation(program, "boxPos");

    paddleBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, paddleBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(paddleVertices), gl.DYNAMIC_DRAW);

    canvas.addEventListener("mousedown", function(e){
        movement = true;
        mouseX = e.offsetX;
    });
    canvas.addEventListener("mouseup", function(){ movement = false; });
    canvas.addEventListener("mousemove", function(e){
        if (movement) {
            var xmove = 2*(e.offsetX - mouseX)/canvas.width;
            mouseX = e.offsetX;
            for (i=0; i<4; i++) {
                paddleVertices[i][0] += xmove;
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, paddleBuffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(paddleVertices));
        }
    });

    render();
};


function render() {
    if (Math.abs(box[0] + dX) > maxX - boxRad) dX = -dX;
    if (box[1] + dY > maxY - boxRad) dY = -dY;

    var paddleTop = paddleVertices[1][1];
    var paddleBottom = paddleVertices[0][1];
    var paddleLeft = paddleVertices[0][0];
    var paddleRight = paddleVertices[2][0];

    if (box[1] - boxRad + dY <= paddleTop &&
        box[1] - boxRad >= paddleBottom &&
        box[0] >= paddleLeft &&
        box[0] <= paddleRight) {
        dY = -dY;
    }
    else if (box[1] + dY < -maxY + boxRad) {
        dY = -dY;
    }

    box[0] += dX;
    box[1] += dY;

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, paddleBuffer);
    var vPosition = gl.getAttribLocation(gl.getParameter(gl.CURRENT_PROGRAM), "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    gl.uniform2fv(locBox, flatten(vec2(0.0,0.0)));
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    var boxBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(boxVertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    gl.uniform2fv(locBox, flatten(box));
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    window.requestAnimFrame(render);
}
