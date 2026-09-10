import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Three.js 视锥与轨道控制器深模块 (ThreeCameraOrbitController Deep Module)
 * 遵循深模块原则 (Deep Module) 与单一职责原则 (SRP)：
 * 封装：
 * 1. 纪念碑谷风格等轴测视锥自适应计算 (Isometric Frustum Adaptation)
 * 2. 平滑阻尼轨道控制器生命周期管理 (OrbitControls Damping Lifecycle)
 * 3. 容器 Resize 自适应与投影矩阵更新
 */
export class ThreeCameraOrbitController {
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls | null = null;
  private currentM = 3;
  private currentN = 4;
  private stride = 1.14; // 1.0 cell + 0.14 gap

  constructor(width: number, height: number) {
    const aspect = height > 0 ? width / height : 1;
    this.camera = new THREE.PerspectiveCamera(38, aspect, 0.1, 100);
  }

  /**
   * 绑定 WebGL DOM 元素并初始化 OrbitControls
   */
  public attachControls(domElement: HTMLElement): OrbitControls {
    this.disposeControls();

    this.controls = new OrbitControls(this.camera, domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.08; // 禁止翻转到地下
    this.controls.minDistance = 3.5;
    this.controls.maxDistance = 24;

    this.resetCameraPosition(this.currentM, this.currentN);
    return this.controls;
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  public getControls(): OrbitControls | null {
    return this.controls;
  }

  /**
   * 视口尺寸变化响应
   */
  public handleResize(width: number, height: number): void {
    if (height <= 0 || width <= 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  /**
   * 根据当前网格行列数自适应重置等轴测最佳黄金视角
   */
  public resetCameraPosition(m: number, n: number): void {
    this.currentM = m;
    this.currentN = n;

    const centerOffsetX = ((n - 1) * this.stride) / 2;
    const centerOffsetZ = ((m - 1) * this.stride) / 2;

    const maxDim = Math.max(m, n);
    const camDist = maxDim * 1.5 + 4.2;

    this.camera.position.set(
      centerOffsetX + camDist * 0.95,
      camDist * 1.15,
      centerOffsetZ + camDist * 0.95
    );
    this.camera.lookAt(centerOffsetX, 0.3, centerOffsetZ);

    if (this.controls) {
      this.controls.target.set(centerOffsetX, 0.3, centerOffsetZ);
      this.controls.update();
    }
  }

  /**
   * 每帧更新阻尼动效
   */
  public update(): void {
    if (this.controls) {
      this.controls.update();
    }
  }

  /**
   * 释放控制器资源
   */
  public disposeControls(): void {
    if (this.controls) {
      this.controls.dispose();
      this.controls = null;
    }
  }
}
