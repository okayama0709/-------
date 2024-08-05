import "./style.css";
import * as THREE from "three";
import GUI from "lil-gui";
import Stats from "stats-js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js"; //追加
import { MTLLoader } from "three/addons/loaders/MTLLoader.js"; //追加
import { OrbitControls } from "three/addons/controls/OrbitControls.js"; //追加
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"; //追加

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

//周囲光
const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

const lightFolder = gui.addFolder("Light");
lightFolder.add(light, "intensity", 0, 3, 0.01).name("AmbientLight");

//平行光源
const directionalLight = new THREE.DirectionalLight(0x0fff, 0.5);
scene.add(directionalLight);
directionalLight.position.set(3, 3, 0);

lightFolder
  .add(directionalLight, "intensity", 0, 3, 0.01)
  .name("DirectionalLight");

//半球光源
const hemisphereLight = new THREE.HemisphereLight(0x0fffff, 0xffff00, 0.5);
scene.add(hemisphereLight);

lightFolder
  .add(hemisphereLight, "intensity", 0, 3, 0.01)
  .name("HemisphereLight");

//レンダラー
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);

const planeGeometry = new THREE.PlaneGeometry(100, 100); //平面の追加
const material = new THREE.MeshNormalMaterial({ color: 0xff0000 }); //マテリアルは共通のものを使用するのでそのまま

const plane = new THREE.Mesh(planeGeometry, material); //メッシュ化
plane.position.set(0, -3, 0);
plane.rotation.x = -Math.PI * 0.5;

scene.add(plane); //シーンに追加

/*--------------------
3Dモデル
--------------------*/

//オブジェクトの追加
const key = {
  up: false,
  down: false,
  right: false,
  left: false,
};

//グループの追加
const group = new THREE.Group();
scene.add(group);

//GLTFデータの読み込み
// const gltfLoader = new GLTFLoader();
// gltfLoader.load("models/wright/scene.gltf", (gltf) => {
//   gltf.scene.scale.set(0.3, 0.3, 0.3);
//   group.add(gltf.scene);
// });

// テクスチャの読み込み
const mtlLoader = new MTLLoader();
mtlLoader.load("models/M/c.mtl", (materials) => {
  materials.preload();

  //OBJデータの読み込み
  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials); //追加
  objLoader.load("models/M/c.obj", (obj) => {
    group.add(obj); //グループにaddする
    obj.position.set(0, -3.5, 0); //位置の設定
    obj.rotation.set(-0.3, -1.6, 1.1); //回転の設定

    // カスタムシェーダーマテリアルの作成
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.ShaderMaterial({
          uniforms: {
            time: { value: 0 },
          },
          vertexShader: `
            uniform float time;
            void main() {
              vec3 pos = position;
              pos.z += sin(pos.y * 3.0 + time) * .5;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
          `,
          fragmentShader: `
            void main() {
              gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
            }
          `,
        });
      }
    });

    //オブジェクトの追加
    const scl = {
      val: 0.4,
    };

    //変更
    obj.scale.set(scl.val, scl.val, scl.val);

    //追加
    const scaleFolder = gui.addFolder("Scale");
    scaleFolder.add(scl, "val", 0.1, 1, 0.01).onChange((val) => {
      obj.scale.set(val, val, val);
    });

    //フォルダの追加
    const positionFolder = gui.addFolder("Position");

    //GUIの追加
    positionFolder.add(obj.position, "x", -10, 10, 0.1);
    positionFolder.add(obj.position, "y", -10, 10, 0.1);
    positionFolder.add(obj.position, "z", -10, 10, 0.1);
    const axesHelper = new THREE.AxesHelper(1);
    scene.add(axesHelper);

    //追加
    const rotationFolder = gui.addFolder("Rotation");
    rotationFolder.add(obj.rotation, "x", -10, 10, 0.1);
    rotationFolder.add(obj.rotation, "y", -10, 10, 0.1);

    rotationFolder.add(obj.rotation, "z", -10, 10, 0.1);
    // キーダウンイベント設定
    document.addEventListener("keydown", (e) => {
      console.log(e.code);
      // キーダウンイベント設定（変更）
      document.addEventListener("keydown", (e) => {
        switch (e.code) {
          case "ArrowUp":
            key.up = true;
            break;
          case "ArrowDown":
            key.down = true;
            break;
          case "ArrowRight":
            key.right = true;
            break;
          case "ArrowLeft":
            key.left = true;
            break;
          case "KeyR":
            group.position.set(0, 0, 0);
            break;
        }
      });

      // キーアップイベント設定（追加）
      document.addEventListener("keyup", (e) => {
        switch (e.code) {
          case "ArrowUp":
            key.up = false;
            break;
          case "ArrowDown":
            key.down = false;
            break;
          case "ArrowRight":
            key.right = false;
            break;
          case "ArrowLeft":
            key.left = false;
            break;
        }
      });
    });
  });
});
/*--------------------
イベント時の処理
--------------------*/
//マウスコントロール
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

window.addEventListener("resize", () => {});

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

  // 時間を更新してシェーダーに渡す（追加）
  group.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material.uniforms) {
      child.material.uniforms.time.value += 0.05;
    }
  });

  // キー入力によるオブジェクトの移動と回転（追加）
  if (key.up) {
    group.position.z = Math.min(
      group.position.z + 0.1,
      planeGeometry.parameters.height / 2
    );
    group.rotation.y += (0 - group.rotation.y) * 0.1; // 滑らかに回転
  }
  if (key.down) {
    group.position.z = Math.max(
      group.position.z - 0.1,
      -planeGeometry.parameters.height / 2
    );
    group.rotation.y += (Math.PI - group.rotation.y) * 0.1; // 滑らかに回転
  }
  if (key.right) {
    group.position.x = Math.min(
      group.position.x + 0.1,
      planeGeometry.parameters.width / 2
    );
    group.rotation.y += (-Math.PI / 2 - group.rotation.y) * 0.1; // 滑らかに回転
  }
  if (key.left) {
    group.position.x = Math.max(
      group.position.x - 0.1,
      -planeGeometry.parameters.width / 2
    );
    group.rotation.y += (Math.PI / 2 - group.rotation.y) * 0.1; // 滑らかに回転
  }

  requestAnimationFrame(animate);
};

animate();
