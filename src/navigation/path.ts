namespace ROS3DNAV {
  export interface PathOptions {
    ros: ROSLIB.Ros;
    topic: string;
    tfClient: ROSLIB.TFClient;
    rootObject?: THREE.Object3D;
    color?: THREE.Color | number;
    width?: number;
    zOffset?: number;
  }

  export class Path extends THREE.Object3D {
    private rootObject: THREE.Object3D;
    private color: THREE.Color | number;
    private width: number;
    private zOffset: number;

    private line: THREE.Line;
    private sn: SceneNode;

    constructor(public options: PathOptions) {
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
        messageType: "nav_msgs/Path",
      });
      rosTopic.subscribe(this.pathReceived);
    }

    private pathReceived = (message: NavMsgs.Path) => {
      let previousLine = this.line;

      let lineGeometry = new THREE.Geometry();
      for (let i = 0; i < message.poses.length; i++) {
        let v3 = new THREE.Vector3(message.poses[i].pose.position.x,
          message.poses[i].pose.position.y,
          message.poses[i].pose.position.z + this.zOffset);
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
