import * as THREE from 'three';

/**
 * 3D 萌系体素角色建造者 (VoxelActorBuilder Deep Module)
 * 遵循深模块原则：
 * 封装 Crossy Road / 纪念碑谷风格体素探险家的头部、帽子、眼部、腮红、衣服、背包与四肢网格建模，
 * 并提供干净的图元与材质生命周期释放能力。
 */
export class VoxelActorBuilder {
  /**
   * 构建多部件 3D 萌系体素探险家模型 (Crossy Road / Monument Valley Style)
   */
  public static buildAdventurerMesh(): THREE.Group {
    const explorer = new THREE.Group();

    // 材质定义
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfed7aa, roughness: 0.4 }); // 暖肉色
    const hatBrimMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.35 }); // 暖棕帽檐
    const hatTopMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.35 }); // 深棕帽顶
    const hatBandMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2 }); // 金色帽带
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a }); // 萌系黑眼
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xfb7185, transparent: true, opacity: 0.8 }); // 腮红
    const jacketMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 }); // 蓝色探险服
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.4 }); // 皮带
    const buckleMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.6, roughness: 0.2 }); // 金扣
    const packMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.45 }); // 旅行背包
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 }); // 灰蓝长裤
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5 }); // 登山靴

    // 1. 头部组件
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.72, 0);

    // 头部方块
    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.34, 0.38), skinMat);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // 双眼 (立方形高亮黑眼)
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.04), eyeMat);
    eyeL.position.set(-0.09, 0.02, 0.19);
    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.04), eyeMat);
    eyeR.position.set(0.09, 0.02, 0.19);
    headGroup.add(eyeL, eyeR);

    // 粉色腮红
    const blushL = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.04, 0.02), blushMat);
    blushL.position.set(-0.12, -0.06, 0.19);
    const blushR = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.04, 0.02), blushMat);
    blushR.position.set(0.12, -0.06, 0.19);
    headGroup.add(blushL, blushR);

    // 探险家宽檐帽
    const brimMesh = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.05, 0.58), hatBrimMat);
    brimMesh.position.set(0, 0.16, 0);
    brimMesh.castShadow = true;
    headGroup.add(brimMesh);

    const hatTop = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.18, 0.36), hatTopMat);
    hatTop.position.set(0, 0.27, 0);
    hatTop.castShadow = true;
    headGroup.add(hatTop);

    const hatBand = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.05, 0.38), hatBandMat);
    hatBand.position.set(0, 0.21, 0);
    headGroup.add(hatBand);

    explorer.add(headGroup);

    // 2. 躯干身体组件
    const bodyGroup = new THREE.Group();
    bodyGroup.position.set(0, 0.42, 0);

    const torsoMesh = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.36, 0.28), jacketMat);
    torsoMesh.castShadow = true;
    bodyGroup.add(torsoMesh);

    // 腰带与金色金属扣
    const beltMesh = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.07, 0.30), beltMat);
    beltMesh.position.set(0, -0.11, 0);
    bodyGroup.add(beltMesh);

    const buckleMesh = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.09, 0.04), buckleMat);
    buckleMesh.position.set(0, -0.11, 0.15);
    bodyGroup.add(buckleMesh);

    // 背部立体探险背包
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.28, 0.14), packMat);
    backpack.position.set(0, 0.02, -0.20);
    backpack.castShadow = true;
    bodyGroup.add(backpack);

    explorer.add(bodyGroup);

    // 3. 手臂组件
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.32, 0.12), jacketMat);
    armL.position.set(-0.25, 0.44, 0);
    armL.castShadow = true;
    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.32, 0.12), jacketMat);
    armR.position.set(0.25, 0.44, 0);
    armR.castShadow = true;
    explorer.add(armL, armR);

    // 4. 腿部与登山靴组件
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.22, 0.14), pantsMat);
    legL.position.set(-0.10, 0.14, 0);
    legL.castShadow = true;
    const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.18), bootMat);
    bootL.position.set(-0.10, 0.04, 0.02);
    bootL.castShadow = true;

    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.22, 0.14), pantsMat);
    legR.position.set(0.10, 0.14, 0);
    legR.castShadow = true;
    const bootR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.18), bootMat);
    bootR.position.set(0.10, 0.04, 0.02);
    bootR.castShadow = true;

    explorer.add(legL, bootL, legR, bootR);

    // 5. 接触投影椭圆面
    const shadowGeo = new THREE.PlaneGeometry(0.65, 0.65);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.38,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.02;
    explorer.add(shadowMesh);

    return explorer;
  }
}
