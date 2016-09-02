namespace ROS3DNAV {
  export class Viewer extends ROS3D.Viewer {
    private lastAutoRotateSpeed: number;
    private lastUserRotateSpeed: number;
    private orbitControlsEnabled: boolean = true;

    public disableOrbitControls() {
      if (this.orbitControlsEnabled) {
        this.lastAutoRotateSpeed = this.cameraControls.autoRotateSpeed;
        this.lastUserRotateSpeed = this.cameraControls.userRotateSpeed;
        this.cameraControls.autoRotateSpeed = 0;
        this.cameraControls.userRotateSpeed = 0;
        this.orbitControlsEnabled = false;
      }
    }
    public enableOrbitControls() {
      if (!this.orbitControlsEnabled) {
        this.cameraControls.autoRotateSpeed = this.lastAutoRotateSpeed;
        this.cameraControls.userRotateSpeed = this.lastUserRotateSpeed;
        this.orbitControlsEnabled = true;
      }
    }
  }
}
