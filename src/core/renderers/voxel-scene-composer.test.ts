import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { VoxelSceneComposer } from './voxel-scene-composer';

describe('VoxelSceneComposer (Deep Module) Lighting & Scene Environment Tests', () => {
  it('1. 搭建多重影棚级灯光系统', () => {
    const scene = new THREE.Scene();
    const { pointLight } = VoxelSceneComposer.setupStudioLights(scene);

    expect(pointLight).toBeInstanceOf(THREE.PointLight);
    expect(scene.children.length).toBeGreaterThanOrEqual(4); // hemi, sun, rim, point
  });

  it('2. 建造悬浮晶体岛屿底座', () => {
    const { baseMesh, rimMesh } = VoxelSceneComposer.buildIslandBase(5.0, 4.0, 0, 0);

    expect(baseMesh).toBeInstanceOf(THREE.Mesh);
    expect(rimMesh).toBeInstanceOf(THREE.Mesh);
    expect(baseMesh.receiveShadow).toBe(true);
  });

  it('3. 建造水系流动环境与波浪数据', () => {
    const riverEnv = VoxelSceneComposer.buildRiverEnvironment(5.0, 4.0, 0, 0, 1.35);

    expect(riverEnv.riverMesh).toBeInstanceOf(THREE.Mesh);
    expect(riverEnv.riverBedMesh).toBeInstanceOf(THREE.Mesh);
    expect(riverEnv.innerFoamMesh).toBeInstanceOf(THREE.Mesh);
    expect(riverEnv.waterSparkles).toBeInstanceOf(THREE.Points);
    expect(riverEnv.originalWaterPositions.length).toBeGreaterThan(0);
  });

  it('4. 递归销毁 Object3D 层级图元与材质，杜绝显存泄漏', () => {
    const group = new THREE.Group();
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    group.add(mesh);

    let disposedGeo = false;
    let disposedMat = false;
    mesh.geometry.dispose = () => { disposedGeo = true; };
    (mesh.material as THREE.Material).dispose = () => { disposedMat = true; };

    VoxelSceneComposer.disposeHierarchy(group);

    expect(disposedGeo).toBe(true);
    expect(disposedMat).toBe(true);
  });
});
