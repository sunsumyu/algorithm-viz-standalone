import { describe, it, expect, vi } from 'vitest';
import { ThreeCameraOrbitController } from './three-camera-orbit-controller';

describe('ThreeCameraOrbitController Deep Module Guard', () => {
  it('should initialize PerspectiveCamera with correct aspect ratio', () => {
    const controller = new ThreeCameraOrbitController(800, 600);
    const camera = controller.getCamera();

    expect(camera).toBeDefined();
    expect(camera.fov).toBe(38);
    expect(camera.aspect).toBeCloseTo(800 / 600);
  });

  it('should update aspect ratio and projection matrix on handleResize', () => {
    const controller = new ThreeCameraOrbitController(800, 600);
    controller.handleResize(1024, 768);

    const camera = controller.getCamera();
    expect(camera.aspect).toBeCloseTo(1024 / 768);
  });

  it('should calculate adaptive camera position based on grid dimensions', () => {
    const controller = new ThreeCameraOrbitController(800, 600);
    controller.resetCameraPosition(3, 4);

    const camera = controller.getCamera();
    // 摄像机高度与距离随着维度缩放
    expect(camera.position.y).toBeGreaterThan(0);
    expect(camera.position.x).toBeGreaterThan(0);
    expect(camera.position.z).toBeGreaterThan(0);

    const prevY = camera.position.y;
    controller.resetCameraPosition(6, 8);
    expect(camera.position.y).toBeGreaterThan(prevY);
  });
});
