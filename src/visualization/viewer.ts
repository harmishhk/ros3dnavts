namespace ROS3DNAV {
  export class Viewer extends ROS3D.Viewer {
    private lastAutoRotateSpeed: number;
    private lastUserRotateSpeed: number;

    disableOrbitControls() {
      this.lastAutoRotateSpeed = this.cameraControls.autoRotateSpeed;
      this.lastUserRotateSpeed = this.cameraControls.userRotateSpeed;
      this.cameraControls.autoRotateSpeed = 0;
      this.cameraControls.userRotateSpeed = 0;
    }
    enableOrbitControls() {
      this.cameraControls.autoRotateSpeed = this.lastAutoRotateSpeed;
      this.cameraControls.userRotateSpeed = this.lastUserRotateSpeed;
    }
  }
}
