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
    private gridObject: ROS3D.OccupancyGrid;
    private arrorControlSetup: boolean;
    private mouseDownPoint: THREE.Vector3;
    private arrow: THREE.ArrowHelper;

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

      if (typeof this.currentGrid == "ROS3DNAV.SceneNode") {
        this.gridObject = <ROS3D.OccupancyGrid>(<ROS3DNAV.SceneNode>this.currentGrid).getObject();
      } else {
        this.gridObject = <ROS3D.OccupancyGrid>this.currentGrid;
      }
    }

    enableArrowControl() {
      this.viewer.disableOrbitControls();
      this.mouseDownPoint = null;
      addEventListener('mouseup', this.onMouseChange);
      addEventListener('mousemove', this.onMouseChange);
      addEventListener('mousedown', this.onMouseChange);
    }

    disableArrowControl() {
      this.viewer.enableOrbitControls();
      removeEventListener('mouseup', this.onMouseChange);
      removeEventListener('mousemove', this.onMouseChange);
      removeEventListener('mousedown', this.onMouseChange);
    }

    private onMouseChange = (event: MouseEvent) => {
      this.mouseVector.x = (event.clientX / this.viewer.renderer.domElement.width) * 2 - 1;
      this.mouseVector.y = - (event.clientY / this.viewer.renderer.domElement.height) * 2 + 1;
      this.mouseVector.z = 0.5;
      this.projector.unprojectVector(this.mouseVector, this.viewer.camera);
      this.mouseRaycaster.set(
        this.viewer.camera.position.clone(),
        this.mouseVector.sub(this.viewer.camera.position).normalize());
      this.mouseRaycaster.linePrecision = 0.001;

      let intersects = this.mouseRaycaster.intersectObject(this.gridObject, true);
      if (intersects.length > 0) {
        if (event.type == 'mousedown') {
          console.log('mouse moved start');
          this.mouseDownPoint = new THREE.Vector3(intersects[0].point.x, intersects[0].point.y, 0.0);
          let direction = new THREE.Vector3().subVectors(this.mouseDownPoint, this.mouseDownPoint);
          this.arrow.position.set(this.mouseDownPoint.x, this.mouseDownPoint.y, this.mouseDownPoint.z);
          this.arrow.setDirection(direction.normalize());
          this.arrow.setLength(direction.length());
          this.viewer.scene.add(this.arrow);
        }
        else {
          if (!this.mouseDownPoint) {
            this.viewer.scene.remove(this.arrow);
            //return failure
          }
          if (event.type == 'mousemove') {
            console.log(intersects[0].point);
            let mouseMovePoint = new THREE.Vector3(intersects[0].point.x, intersects[0].point.y, 0.0);
            let direction = new THREE.Vector3().subVectors(this.mouseDownPoint, mouseMovePoint);
            this.arrow.setDirection(direction.normalize());
            this.arrow.setLength(direction.length());
          } else if (event.type == 'mouseup') {
            console.log(intersects[0].point);
            console.log('mouse move stopped')
            let mouseStopPoint = new THREE.Vector3(intersects[0].point.x, intersects[0].point.y, 0.0);
            let direction = new THREE.Vector3().subVectors(this.mouseDownPoint, mouseStopPoint);
            this.arrow.setDirection(direction.normalize());
            this.arrow.setLength(direction.length());
            this.viewer.scene.remove(this.arrow);
          } else {
            this.viewer.scene.remove(this.arrow);
            // failure for unknown event
          }
        }
      }
    }
  }
}
