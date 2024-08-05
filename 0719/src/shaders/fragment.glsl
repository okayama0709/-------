uniform float uColor;

void main(){
  gl_FragColor = vec4(uColor, 0.0, 0.0, 1.0); //色の定義(赤、緑、青、不透明度)
}
