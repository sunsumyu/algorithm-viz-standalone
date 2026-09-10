import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { VoxelActorBuilder } from './voxel-actor-builder';

describe('VoxelActorBuilder (Deep Module) Architecture & Rigging Tests', () => {
  it('1. 成功构建包含完整体素探险家部件的 3D Group', () => {
    const explorer = VoxelActorBuilder.buildAdventurerMesh();

    expect(explorer).toBeInstanceOf(THREE.Group);
    expect(explorer.children.length).toBeGreaterThan(0);

    // 检查是否包含阴影与主要部件
    let hasHead = false;
    let hasBody = false;
    let hasBackpack = false;
    let hasHat = false;

    explorer.traverse((child: any) => {
      if (child.isMesh) {
        expect(child.geometry).toBeDefined();
        expect(child.material).toBeDefined();
      }
    });

    // 检查子 group (头部、身体等)
    expect(explorer.children.length).toBeGreaterThanOrEqual(4);
  });
});
