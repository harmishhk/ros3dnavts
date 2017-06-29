namespace ROS3DNAV {
  export interface TrajectoryOptions {
    ros: ROSLIB.Ros;
    topic: string;
    tfClient: ROSLIB.TFClient;
    rootObject?: THREE.Object3D;
    color?: THREE.Color | number;
    width?: number;
    zOffset?: number;
  }

  export class Trajectory extends THREE.Object3D {
    private rootObject: THREE.Object3D;
    private color: THREE.Color;
    private cylinderColor: THREE.Color;
    private width: number;
    private zOffset: number;

    private line: THREE.Line;
    private cylinderGeometry: THREE.Geometry;
    private sn: SceneNode;

    constructor(public options: TrajectoryOptions) {
      super();
      this.rootObject = options.rootObject || new THREE.Object3D();
      let optionColor = options.color || new THREE.Color(0xcc00ff);
      this.color = typeof optionColor === "number" ? new THREE.Color(optionColor) : optionColor;
      // this.cylinderColor = this.color.clone();
      this.cylinderColor = new THREE.Color(0x0000ff);
      this.width = options.width || 1;
      this.zOffset = options.zOffset || 0.05;

      this.line = new THREE.Line();

      let cylinderLength = 2.0;
      let cylinderRadius = 0.1;
      this.cylinderGeometry = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, cylinderLength, 8);
      this.cylinderGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, cylinderLength / 2, 0));
      this.cylinderGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));

      this.sn = new SceneNode({
        tfClient: options.tfClient,
        frameID: options.tfClient.fixedFrame,
        object: this.line,
      });
      this.rootObject.add(this.sn);

      let rosTopic = new ROSLIB.Topic({
        ros: options.ros,
        name: options.topic,
        messageType: "hanp_msgs/Trajectory",
      });
      rosTopic.subscribe(this.trajectoryReceived);
    }

    private trajectoryReceived = (message: HANPMsgs.Trajectory) => {
      let previousLine = this.line;

      let lineGeometry = new THREE.Geometry();
      for (let i = 0; i < message.points.length; i++) {
        let v3 = new THREE.Vector3(message.points[i].transform.translation.x,
          message.points[i].transform.translation.y,
          message.points[i].transform.translation.z + this.zOffset);
        lineGeometry.vertices.push(v3);
      }
      lineGeometry.computeLineDistances();

      let lineMaterial = new THREE.LineBasicMaterial({ color: this.color.getHex(), linewidth: this.width, overdraw: 0.5 });
      this.line = new THREE.Line(lineGeometry, lineMaterial);

      let cylinderHue = 1.0;
      for (let j = 1; j < message.points.length; j++) {
        if (message.points[j].time_from_start.secs != message.points[j - 1].time_from_start.secs) {
          let nSecBefore = 1 - message.points[j - 1].time_from_start.nsecs * 1e-9;
          let nSecAfter = message.points[j].time_from_start.nsecs * 1e-9;
          let tRatio = nSecBefore / (nSecBefore + nSecAfter);
          let xDiff = message.points[j].transform.translation.x - message.points[j - 1].transform.translation.x;
          let yDiff = message.points[j].transform.translation.y - message.points[j - 1].transform.translation.y;

          let cylinderMaterial = new THREE.MeshBasicMaterial({ color: this.cylinderColor.clone().setHSL(cylinderHue, 1, 0.5).getHex() });
          let cylinder = new THREE.Mesh(this.cylinderGeometry, cylinderMaterial)

          cylinder.position.x = message.points[j - 1].transform.translation.x + (tRatio * xDiff);
          cylinder.position.y = message.points[j - 1].transform.translation.y + (tRatio * yDiff);
          cylinder.position.z = 0;

          if (cylinderHue > 0.0) {
            cylinderHue -= 0.1;
          }
          this.line.add(cylinder);

          // console.log("before point " + (j - 1) + ", time: secs=" + message.points[j - 1].time_from_start.secs + ", nsecs=" + message.points[j - 1].time_from_start.nsecs + ", x=" + message.points[j - 1].transform.translation.x + ", y=" + message.points[j - 1].transform.translation.y);
          // console.log("after  point " + j + ", time: secs=" + message.points[j].time_from_start.secs + ", nsecs=" + message.points[j].time_from_start.nsecs + ", x=" + message.points[j].transform.translation.x + ", y=" + message.points[j].transform.translation.y);
          // console.log("ratio=" + tRatio + ", xDiff=" + xDiff + ", yDiff=" + yDiff + ", nSecBefore=" + nSecBefore + ", nSecAfter=" + nSecAfter);
          // console.log("mid point: x=" + lineCylinder.position.x + ", y=" + lineCylinder.position.y);
        }
      }

      if (this.sn.frameID !== message.header.frame_id) {
        this.sn.resubscribeTf(message.header.frame_id);
      }

      if (previousLine != null) {
        this.sn.remove(previousLine);
      }
      this.sn.add(this.line);
    }
  }
}
