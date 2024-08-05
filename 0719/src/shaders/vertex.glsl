uniform float uFrequency;
uniform float uTime; //追加
uniform float uPositionX;

void main()
{
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  modelPosition.z += sin(modelPosition.x * uFrequency + uTime) * 0.1; //変更
  modelPosition.x += uPositionX; //追加

  gl_Position = projectionMatrix * viewMatrix * modelPosition;
}