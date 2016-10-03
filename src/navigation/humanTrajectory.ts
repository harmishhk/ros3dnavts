namespace ROS3DNAV {
  export class HumanTrajectory extends THREE.Object3D {
    private rootObject: THREE.Object3D;
    private color: THREE.Color | number;
    private width: number;
    private zOffset: number;

    private line: THREE.Line;
    private sn: SceneNode;

    constructor(public options: TrajectoryOptions) {
      super();
      this.rootObject = options.rootObject || new THREE.Object3D();
      this.color = options.color || new THREE.Color(0xcc00ff);
      this.width = options.width || 1;
      this.zOffset = options.zOffset || 0.05;

      this.line = new THREE.Line();

      this.sn = new SceneNode({
        tfClient: options.tfClient,
        frameID: options.tfClient.fixedFrame,
        object: this.line,
      });
      this.rootObject.add(this.sn);

      let rosTopic = new ROSLIB.Topic({
        ros: options.ros,
        name: options.topic,
        messageType: "hanp_msgs/HumanTrajectory",
      });
      rosTopic.subscribe(this.trajectoryReceived);
    }

    private trajectoryReceived = (message: HANPMsgs.HumanTrajectory) => {
      let previousLine = this.line;

      let lineGeometry = new THREE.Geometry();
      for (let i = 0; i < message.trajectory.points.length; i++) {
        let v3 = new THREE.Vector3(message.trajectory.points[i].transform.translation.x,
          message.trajectory.points[i].transform.translation.y,
          message.trajectory.points[i].transform.translation.z + this.zOffset);
        lineGeometry.vertices.push(v3);
      }
      lineGeometry.computeLineDistances();

      let lineColor = typeof this.color === "number" ? <number>this.color : (<THREE.Color>this.color).getHex();
      let lineMaterial = new THREE.LineBasicMaterial({ color: lineColor, linewidth: this.width, overdraw: 0.5 });
      this.line = new THREE.Line(lineGeometry, lineMaterial);

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
