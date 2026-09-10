import * as THREE from 'three';

export interface RiverEnvironment {
  riverBedMesh: THREE.Mesh;
  outerBankMesh: THREE.Mesh;
  riverMesh: THREE.Mesh;
  innerFoamMesh: THREE.Mesh;
  waterSparkles: THREE.Points;
  originalWaterPositions: Float32Array;
}

/**
 * 3D 体素沙盘场景构图与光影物理建造者 (VoxelSceneComposer Deep Module)
 * 遵循深模块原则：
 * 封装影棚级柔和光影配置、悬浮晶体岛屿底座、流动水系物理波浪网格与图元层级递归释放。
 */
export class VoxelSceneComposer {
  /**
   * 搭建「纪念碑谷」影棚级柔和物理光照
   */
  public static setupStudioLights(scene: THREE.Scene): { pointLight: THREE.PointLight } {
    // 1. 天空/地面半球漫射光 (暖米色天空 + 浅灰蓝地面)
    const hemiLight = new THREE.HemisphereLight(0xfffbeb, 0xe0f2fe, 0.85);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    // 2. 主定向太阳光 (投射细腻软阴影，配置 normalBias 消除阴影摩尔纹与闪烁)
    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.35);
    sunLight.position.set(12, 18, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.0001;
    sunLight.shadow.normalBias = 0.02; // 消除曲面与平面阴影自遮挡交错闪烁
    sunLight.shadow.radius = 2.0;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 45;
    const sSize = 9;
    sunLight.shadow.camera.left = -sSize;
    sunLight.shadow.camera.right = sSize;
    sunLight.shadow.camera.top = sSize;
    sunLight.shadow.camera.bottom = -sSize;
    scene.add(sunLight);

    // 3. 侧后方冷色轮廓背光 (Rim Light)
    const rimLight = new THREE.DirectionalLight(0xbae6fd, 0.65);
    rimLight.position.set(-12, 12, -12);
    scene.add(rimLight);

    // 4. 动态活动格焦点聚光点光源
    const pointLight = new THREE.PointLight(0x0ea5e9, 2.5, 7, 1.2);
    pointLight.position.set(0, 2.2, 0);
    scene.add(pointLight);

    return { pointLight };
  }

  /**
   * 构建纪念碑谷风格悬浮亚克力晶体底座与金边
   */
  public static buildIslandBase(baseW: number, baseD: number, centerX: number, centerZ: number): { baseMesh: THREE.Mesh; rimMesh: THREE.Mesh } {
    const baseGeo = new THREE.BoxGeometry(baseW, 0.22, baseD);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.05,
      transparent: true,
      opacity: 0.95,
      depthWrite: false
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.set(centerX, -0.12, centerZ);
    baseMesh.receiveShadow = true;
    baseMesh.renderOrder = 1;

    const rimGeo = new THREE.BoxGeometry(baseW + 0.06, 0.04, baseD + 0.06);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.4,
      roughness: 0.3
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.position.set(centerX, -0.22, centerZ);

    return { baseMesh, rimMesh };
  }

  /**
   * 构建环绕悬浮水晶深水河与水波
   */
  public static buildRiverEnvironment(
    baseW: number,
    baseD: number,
    centerX: number,
    centerZ: number,
    riverMargin: number = 1.35
  ): RiverEnvironment {
    const riverW = baseW + riverMargin * 2;
    const riverD = baseD + riverMargin * 2;

    // 1. 深邃湛蓝河床底槽
    const bedGeo = new THREE.BoxGeometry(riverW + 0.36, 0.28, riverD + 0.36);
    const bedMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.6,
      metalness: 0.1
    });
    const riverBedMesh = new THREE.Mesh(bedGeo, bedMat);
    riverBedMesh.position.set(centerX, -0.28, centerZ);
    riverBedMesh.receiveShadow = true;

    // 2. 河道外侧微光水晶堤岸
    const outerBankGeo = new THREE.BoxGeometry(riverW + 0.44, 0.08, riverD + 0.44);
    const outerBankMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.35,
      roughness: 0.25,
      metalness: 0.15
    });
    const outerBankMesh = new THREE.Mesh(outerBankGeo, outerBankMat);
    outerBankMesh.position.set(centerX, -0.16, centerZ);

    // 3. 物理动态波浪水面 (平滑高质感水体材质，关闭深度覆写与自阴影以彻底避免 Z-Fighting 与频闪)
    const waterSegs = Math.min(36, Math.max(20, Math.round(Math.max(riverW, riverD) * 2.5)));
    const waterGeo = new THREE.PlaneGeometry(riverW, riverD, waterSegs, waterSegs);
    waterGeo.rotateX(-Math.PI / 2);

    const posAttr = waterGeo.attributes.position;
    const originalWaterPositions = new Float32Array(posAttr.array);

    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0284c7,
      emissiveIntensity: 0.35,
      roughness: 0.1,
      metalness: 0.05,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });
    const riverMesh = new THREE.Mesh(waterGeo, waterMat);
    riverMesh.position.set(centerX, -0.06, centerZ);
    riverMesh.receiveShadow = false; // 水体免受阴影痤疮干扰
    riverMesh.renderOrder = 2;

    // 4. 岛屿岸边白浪波沫圈
    const innerFoamGeo = new THREE.BoxGeometry(baseW + 0.14, 0.02, baseD + 0.14);
    const innerFoamMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.55,
      depthWrite: false
    });
    const innerFoamMesh = new THREE.Mesh(innerFoamGeo, innerFoamMat);
    innerFoamMesh.position.set(centerX, -0.055, centerZ);
    innerFoamMesh.renderOrder = 3;

    // 5. 水面流动微光星点
    const sparkleCount = 36;
    const sparkleGeo = new THREE.BufferGeometry();
    const sparklePositions = new Float32Array(sparkleCount * 3);
    for (let i = 0; i < sparkleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radiusX = (baseW / 2) + 0.15 + Math.random() * (riverMargin - 0.3);
      const radiusZ = (baseD / 2) + 0.15 + Math.random() * (riverMargin - 0.3);
      sparklePositions[i * 3] = centerX + Math.cos(angle) * radiusX;
      sparklePositions[i * 3 + 1] = -0.045;
      sparklePositions[i * 3 + 2] = centerZ + Math.sin(angle) * radiusZ;
    }
    sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3));
    const sparkleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.075,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const waterSparkles = new THREE.Points(sparkleGeo, sparkleMat);
    waterSparkles.renderOrder = 4;

    return {
      riverBedMesh,
      outerBankMesh,
      riverMesh,
      innerFoamMesh,
      waterSparkles,
      originalWaterPositions
    };
  }

  /**
   * 递归销毁释放 Object3D 层级中的 Geometry 与 Material 资源，防止 WebGL 内存泄漏
   */
  public static disposeHierarchy(obj: THREE.Object3D): void {
    obj.traverse((child: any) => {
      if (child.geometry && typeof child.geometry.dispose === 'function') {
        child.geometry.dispose();
      }
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m: any) => {
            if (m.map) m.map.dispose();
            m.dispose();
          });
        } else {
          if (child.material.map) child.material.map.dispose();
          child.material.dispose();
        }
      }
    });
  }
}
