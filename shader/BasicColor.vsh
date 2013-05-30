attribute vec3 aVertexPosition;
attribute vec4 aVertexColor;

uniform mat4 uPMatrix;
uniform mat4 uMVMatrix;

varying vec4 vVertexColor;

void main(void) {
    vVertexColor = aVertexColor;
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}