namespace ROS3DNAV {
  export interface OccupancyGridClientOptions {
    ros: ROSLIB.Ros;
    viewer: ROS3DNAV.Viewer;
    topic?: string;
    continuous?: boolean;
    tfClient?: ROSLIB.TFClient;
    rootObject?: THREE.Object3D | THREE.Scene;
    offsetPose?: ROSLIB.Pose;
    color?: { r: number, g: number, b: number };
    opacity?: number;
  }

  export class OccupancyGridClient extends ROS3D.OccupancyGridClient {
    private viewer: ROS3DNAV.Viewer;
    private mouseRaycaster: THREE.Raycaster;
    private projector: THREE.Projector;
    private mouseVector: THREE.Vector3;
    private mouseDownPoint: THREE.Vector3;
    private arrow: THREE.ArrowHelper;
    private showingArrow: boolean;

    private senderInfo: any;
    private arrowCallback: (success: boolean, position?: THREE.Vector3, orientation?: THREE.Quaternion,
      message?: string, senderInfo?: any) => void;

    constructor(options: OccupancyGridClientOptions) {
      super(options);
      this.viewer = options.viewer;

      this.mouseRaycaster = new THREE.Raycaster();
      this.projector = new THREE.Projector();
      this.mouseVector = new THREE.Vector3();

      let sourcePos = new THREE.Vector3(0, 0, 0);
      let targetPos = new THREE.Vector3(1, 0, 0);
      let direction = new THREE.Vector3().subVectors(targetPos, sourcePos);
      this.arrow = new THREE.ArrowHelper(direction.normalize(), sourcePos, direction.length(), 0x00ff00);
      this.showingArrow = false;
    }

    public createArrowControl(
      arrowCallback: (success: boolean, position?: THREE.Vector3, orientation?: THREE.Quaternion,
        message?: string, senderInfo?: any) => void,
      senderInfo?: any) {
      if (!this.currentGrid) {
        return false;
      }
      this.viewer.disableOrbitControls();
      this.mouseDownPoint = null;
      addEventListener("mousedown", this.onMouseDown);

      this.senderInfo = senderInfo || null;
      this.arrowCallback = arrowCallback;
      return true;
    }

    private onMouseDown = (event: MouseEvent) => {
      this.mouseDownPoint = this.getMousePoint(event);
      removeEventListener("mousedown", this.onMouseDown);
      if (this.mouseDownPoint != null) {
        addEventListener("mousemove", this.onMouseMove);
        addEventListener("mouseup", this.onMouseUp);
      } else {
        this.viewer.enableOrbitControls();
        this.arrowCallback(false, new THREE.Vector3(), new THREE.Quaternion(),
          "Cannot calculate mousedown point", this.senderInfo);
      }
    }

    private onMouseMove = (event: MouseEvent) => {
      let mouseMovePoint = this.getMousePoint(event);
      if (mouseMovePoint != null) {
        let direction = new THREE.Vector3().subVectors(mouseMovePoint, this.mouseDownPoint);
        this.arrow.setLength(direction.length());
        this.arrow.setDirection(direction.normalize());
        if (!this.showingArrow) {
          this.arrow.position = this.mouseDownPoint;
          this.viewer.scene.add(this.arrow);
        }
        this.showingArrow = true;
      } else {
        removeEventListener("mousemove", this.onMouseMove);
        removeEventListener("mouseup", this.onMouseUp);
        this.viewer.enableOrbitControls();
        this.arrowCallback(false, new THREE.Vector3(), new THREE.Quaternion(),
          "Cannot calculate mousemove point", this.senderInfo);
      }
    }

    private onMouseUp = (event: MouseEvent) => {
      removeEventListener("mousemove", this.onMouseMove);
      removeEventListener("mouseup", this.onMouseUp);
      this.viewer.scene.remove(this.arrow);
      this.showingArrow = false;
      let mouseStopPoint = this.getMousePoint(event);
      if (mouseStopPoint != null) {
        let theta = Math.atan2(mouseStopPoint.y - this.mouseDownPoint.y, mouseStopPoint.x - this.mouseDownPoint.x);
        let quaternion = new THREE.Quaternion();
        quaternion.setFromEuler(new THREE.Euler(0, 0, theta, "XYZ"));
        quaternion.normalize();
        this.viewer.enableOrbitControls();
        this.arrowCallback(true, this.mouseDownPoint, quaternion, "", this.senderInfo);
      } else {
        this.viewer.enableOrbitControls();
        this.arrowCallback(false, new THREE.Vector3(), new THREE.Quaternion(),
          "Cannot calcualte mouseup point", this.senderInfo);
      }
    }

    private getMousePoint(event: MouseEvent) {
      this.mouseVector.x = (event.clientX / this.viewer.renderer.domElement.clientWidth) * 2 - 1;
      this.mouseVector.y = - (event.clientY / this.viewer.renderer.domElement.clientHeight) * 2 + 1;
      this.mouseVector.z = 0.0;
      this.projector.unprojectVector(this.mouseVector, this.viewer.camera);
      this.mouseRaycaster.set(
        this.viewer.camera.position,
        this.mouseVector.sub(this.viewer.camera.position).normalize());
      this.mouseRaycaster.linePrecision = 0.001;

      let intersects = this.mouseRaycaster.intersectObject(this.currentGrid, true);
      if (intersects.length > 0) {
        return new THREE.Vector3(intersects[0].point.x, intersects[0].point.y, 0.0);
      } else {
        return null;
      }
    }
  }
}
