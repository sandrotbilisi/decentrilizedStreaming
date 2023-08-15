attribute vec3 aColor;
varying vec3 uColor;
varying vec2 vUv;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionMatrix = projectionMatrix * viewPosition;

  gl_Position = projectionMatrix;

  uColor = aColor;
  
}