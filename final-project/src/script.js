import "./style.css";
import * as THREE from "three";
import Stats from "stats-js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"; //追加
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FontLoader } from "three/addons/loaders/FontLoader.js"; //追加
import { TextGeometry } from "three/addons/geometries/TextGeometry.js"; //追加

gsap.registerPlugin(ScrollTrigger);

// FPSデバッグ
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

/*--------------------
必須項目
--------------------*/

// キャンバスの取得
const canvas = document.querySelector("#webgl");

// サイズ
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// シーン
const scene = new THREE.Scene();

// カメラ
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.set(0, 0, 6);
scene.add(camera);

// 周囲光
const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

// レンダラー
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);

// グループの作成
const group = new THREE.Group();
scene.add(group);

// フォントの読み込み
const fontLoader = new FontLoader();
fontLoader.load("./font/DotGothic16_Regular.json", (font) => {
  const material = new THREE.MeshNormalMaterial();
  const textGeometry = new TextGeometry("トライデントコンピューター", {
    font: font,
    size: 0.4,
    height: 0.5, // depthではなくheightに変更
  });
  textGeometry.center(); //追加

  const text = new THREE.Mesh(textGeometry, material);

  text.position.set(0, 2, 0); // テキストの位置をセンターより少し上に調整
  group.add(text);

  // テキストメッシュのスケールアニメーション
  gsap.to(text.scale, {
    x: 1.5, // 最終的なスケール
    y: 1.5,
    z: 1.5,
    scrollTrigger: {
      trigger: "body",
      start: "top 100px",
      end: "bottom 50px",
      markers: true,
      scrub: true,
    },
  });
});

// GLTFデータの読み込み
const gltfLoader = new GLTFLoader();
gltfLoader.load("models/scene.gltf", (gltf) => {
  gltf.scene.scale.set(0.05, 0.05, 0.05);
  gltf.scene.position.set(-3, 0, -2);
  gltf.scene.rotation.set(-1, 0, -0.3);
  group.add(gltf.scene);

  // gsapアニメーションの設定
  gsap.to(gltf.scene.rotation, {
    y: Math.PI * 2,
    scrollTrigger: {
      trigger: "h2",
      start: "top 100px",
      end: "bottom50",
      markers: true,
      scrub: true,
    },
  });

  gsap.to(gltf.scene.position, {
    x: 0,
    scrollTrigger: {
      x: 3,
      trigger: ".about h2",
      start: "top 100px",
      end: "bottom 50px",
      markers: true,
      scrub: true,
    },
  });

  // カップケーキのような回転アニメーション
  const radius = 3.5; // 回転半径
  const initialScale = new THREE.Vector3(0.05, 0.05, 0.05); // 初期スケール

  gsap.to(gltf.scene.position, {
    x: 3,
    scrollTrigger: {
      trigger: ".program",
      start: "top 100px",
      end: "bottom top",
      markers: true,
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress * Math.PI * 3; // 回転の進行度
        gltf.scene.position.x = radius * Math.cos(progress);
        gltf.scene.position.z = radius * Math.sin(progress);
        gltf.scene.rotation.y = progress; // 回転の速度調整
        gltf.scene.scale.set(
          initialScale.x - 0.02 * Math.sin(progress),
          initialScale.y - 0.01 * Math.sin(progress),
          initialScale.z - 0.02 * Math.sin(progress)
        ); // スケールの変化
      },
      onLeave: () => {
        // アニメーションが終了した際に元の状態に戻す
        gsap.to(gltf.scene.position, { x: 0, z: 0, duration: 1 });
        gsap.to(gltf.scene.rotation, { y: 0, duration: 1 });
        gsap.to(gltf.scene.scale, {
          x: initialScale.x,
          y: initialScale.y,
          z: initialScale.z,
          duration: 1,
        });
      },
    },
  });
});

/*--------------------
イベント時の処理
--------------------*/

window.addEventListener("resize", () => {
  // サイズのアップデート
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // カメラのアップデート
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // レンダラーのアップデート
  renderer.setSize(sizes.width, sizes.height);
});

// アニメーション
const animate = () => {
  stats.begin();
  renderer.render(scene, camera);
  stats.end();

  requestAnimationFrame(animate);
};

animate();
