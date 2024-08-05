import "./style.css";
import * as THREE from "three";
import GUI from "lil-gui";
import Stats from "stats-js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js"; //追加
import { phy } from "phy-engine";

//UIデバッグ
const gui = new GUI();

//FPSデバッグ
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

/*--------------------
必須項目
--------------------*/

//キャンバスの取得
const canvas = document.querySelector("#webgl");

//サイズ
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

//シーン
const scene = new THREE.Scene();
// ライトの追加
const light = new THREE.DirectionalLight(0xffffff);
scene.add(light);

//カメラ
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.set(6, 6, 12);
scene.add(camera);

//中央線の表示
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

//レンダラー
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);

/*--------------------
物理演算
--------------------*/

const texture = new THREE.TextureLoader().load("/earth.jpg");
const material = new THREE.MeshStandardMaterial({
  map: texture,
});

const phyReady = () => {
  phy.activeMouse(controls, "drag"); //追加
  phy.set({ gravity: [0, -20, 0] }); //重量を設定

  //箱の追加
  for (let i = 0; i < 100; i++) {
    phy.add({
      type: "box", // box, sphere, cylinder, capsule, plane
      size: [Math.random() + 0.5, Math.random() + 0.5, Math.random() + 0.5],
      pos: [Math.sin(i * 0.1) * 5, 10 + i * 0.5, Math.cos(i * 0.1) * 5],
      rot: [Math.random() * 360, Math.random() * 360, Math.random() * 360],
      radius: 0.1,
      material: material,
      density: Math.random() * 2,
      restitution: Math.random(),
    });
  }
  document.body.addEventListener("dblclick", () => {
    for (let i = 0; i < 10; i++) {
      phy.add({
        type: "box", // box, sphere, cylinder, capsule, plane
        size: [Math.random() + 0.5, Math.random() + 0.5, Math.random() + 0.5],
        pos: [Math.sin(i * 0.1) * 5, 10 + i * 0.5, Math.cos(i * 0.1) * 5],
        rot: [Math.random() * 360, Math.random() * 360, Math.random() * 360],
        radius: 0.1,
        material: material,
        density: Math.random() * 2,
        restitution: Math.random(),
      });
    }
  });

  //床を追加
  phy.add({
    type: "plane",
    size: [50, 1, 50],
    material: material,
    visible: true,
    restitution: 0.5,
  });
};

phy.init({
  type: "PHYSX",
  worker: true,
  compact: true,
  scene: scene,
  renderer: renderer,
  callback: phyReady,
});

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
const animate = () => {
  stats.begin();
  renderer.render(scene, camera);
  stats.end();

  controls.update(); //追加

  requestAnimationFrame(animate);
};

animate();
