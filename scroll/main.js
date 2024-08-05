import "./style.css";
import * as THREE from "three";
import GUI from "lil-gui";
import Stats from "stats-js";

//追加
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

console.log(gsap);

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

//カメラ
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.set(0, 0, 6);
scene.add(camera);

//ライト
const directionalLight = new THREE.DirectionalLight(0xffffff, 4);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

//レンダラー
const renderer = new THREE.WebGLRenderer({
  canvas: canvas, //「キャンバスの取得」で取得した要素に設定
  alpha: true, //追加
});
renderer.setSize(sizes.width, sizes.height);

// オブジェクトの追加
const createCross = () => {
  const group = new THREE.Group();

  const material = new THREE.MeshBasicMaterial({ color: 0x555465 }); // Green color

  // Vertical part of the cross
  const verticalGeometry = new THREE.BoxGeometry(1, 20, 1.5);
  const vertical = new THREE.Mesh(verticalGeometry, material);
  group.add(vertical);

  // Horizontal part of the cross
  const horizontalGeometry = new THREE.BoxGeometry(10, 1, 1.5);
  const horizontal = new THREE.Mesh(horizontalGeometry, material);
  horizontal.position.set(0, 2, 0); // Position the horizontal bar to intersect the vertical bar
  group.add(horizontal);

  return group;
};

const cross = createCross();
cross.position.set(0, 0, -15);
cross.rotation.set(0, 0, 0);
scene.add(cross);

const createFog = () => {
  const texture = new THREE.TextureLoader().load("./images/tt.webp");
  const particleCount = 1000;
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const x = Math.random() * 20 - 10;
    const y = Math.random() * 20 - 10;
    const z = Math.random() * 20 - 10;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }

  const particlesGeometry = new THREE.BufferGeometry();
  particlesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  const particlesMaterial = new THREE.PointsMaterial({
    // color: 0x00aaff,
    size: 0.6,
    transparent: true,
    opacity: 1,
  });
  particlesMaterial.map = texture;

  const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
  return particleSystem;
};

const fog = createFog();
fog.position.set(0, 0, -15);
scene.add(fog);

/*--------------------
イベント時の処理
--------------------*/

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
  cross.rotation.x += 0.01;
  cross.rotation.y += 0.01;
  fog.rotation.x += 0.001;
  fog.rotation.y += 0.001;
  renderer.render(scene, camera);
  stats.end();

  requestAnimationFrame(animate);
};

animate();

// gsap

gsap
  .timeline()
  .from(cross.position, {
    z: -1000,
  })
  .from(cross.rotation, {});
console.log(Math.PI);
//修正
gsap.fromTo(
  cross.rotation,
  {},
  {
    y: 3,
    x: 3,
    scrollTrigger: {
      trigger: "#projects",
      start: "top 80%",
      end: "bottom 20%",
      markers: true,
      scrub: true,
    },
  }
);

gsap.fromTo(
  cross.position,
  {},
  {
    x: 0,
    z: 0,
    scrollTrigger: {
      trigger: "#skills",
      start: "top 80%",
      end: "bottom 20%",
      markers: true,
      scrub: true,
    },
  }
);
