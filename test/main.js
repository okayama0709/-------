import "./style.css";
import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js"; //追加
import { TextGeometry } from "three/addons/geometries/TextGeometry.js"; //追加
import { OrbitControls } from "three/addons/controls/OrbitControls.js"; //追加
import Stats from "stats-js";

//FPSデバッグ
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

// 必須事項
//キャンバスの取得
const canvas = document.querySelector("#webgl");

//サイズ
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

//シーン
const scene = new THREE.Scene();

//カメラ
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.set(0, 0, 10);
scene.add(camera);

//レンダラー
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);

let text;
const material = new THREE.MeshNormalMaterial();

//グループを作ってシーンに追加
const group = new THREE.Group();
scene.add(group);

//桁数を揃える
const leftFillNum = (num) => {
  return num.toString().padStart(2, "0");
};

//現在の時間を取得する
const drawTime = (font) => {
  group.remove(text); //シーンをグループに変更

  const now = new Date();
  const hour = leftFillNum(now.getHours()); //変更
  const minute = leftFillNum(now.getMinutes());
  const second = leftFillNum(now.getSeconds());
  const milliSecond = now.getMilliseconds(); //追加
  const currentTime = `${hour}:${minute}:${second}`; //変更

  const material = new THREE.MeshPhongMaterial({
    color: 0x000000,
    emissive: 0x00ff00,
  });
  const textGeometry = new TextGeometry(currentTime, {
    //変更
    font: font,
    size: 3.5,
    depth: 0.8,
    curveSegments: 20,
    bevelEnabled: true,
    bevelThickness: 0.2,
    bevelSize: 0.1,
    bevelOffset: 0,
    bevelSegments: 3,
  });
  textGeometry.center();

  text = new THREE.Mesh(textGeometry, material);
  group.add(text);

  setTimeout(drawTime, 1000 - milliSecond, font);
};
//フォントの読み込み
const fontLoader = new FontLoader();
fontLoader.load("./fonts/M_PLUS_1_Thin_Regular.json", (font) => {
  setTimeout(drawTime, 10, font);
  console.log(font);
});

//オブジェクト追加
for (let i = 0; i < 200; i++) {
  const geometry = new THREE.BoxGeometry();
  const box = new THREE.Mesh(geometry, material);

  box.position.x = (Math.random() - 0.5) * 30;
  box.position.y = (Math.random() - 0.5) * 30;
  box.position.z = (Math.random() - 0.5) * 30;
  box.rotation.x = Math.random() * Math.PI;
  box.rotation.y = Math.random() * Math.PI;
  const scale = Math.random();
  box.scale.set(
    (scale / Math.random()) * 1.5,
    scale * Math.random() * 0.5,
    scale * 0.5
  );
  group.add(box);
}
/*--------------------
イベント時の処理
--------------------*/

//マウスコントロール
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

window.addEventListener("resize", () => {
  //サイズのアップデート
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  //カメラのアップデート
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  //レンダラーのアップデート
  renderer.setSize(sizes.width, sizes.height);
});

//アニメーション
const clock = new THREE.Clock(); //追加
const animate = () => {
  const elapsedTime = clock.getElapsedTime();

  //テキストの回転（変更）
  group.rotation.x = elapsedTime * 0.005;
  group.rotation.y = elapsedTime * 0.05;

  stats.begin();
  renderer.render(scene, camera);
  stats.end();

  controls.update(); //追加

  requestAnimationFrame(animate);
};

animate();
