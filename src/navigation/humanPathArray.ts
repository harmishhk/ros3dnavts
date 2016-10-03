namespace ROS3DNAV {
  export class HumanPathArray extends THREE.Object3D {
    private rootObject: THREE.Object3D;
    private color: THREE.Color | number;
    private width: number;
    private zOffset: number;

    private lines: THREE.Line[];
    private sn: SceneNode;

    constructor(public options: PathOptions) {
      super();
      this.rootObject = options.rootObject || new THREE.Object3D();
      this.color = options.color || new THREE.Color(0xcc00ff);
      this.width = options.width || 1;
      this.zOffset = options.zOffset || 0.05;

      this.lines = new Array<THREE.Line>();

      this.sn = new SceneNode({
        tfClient: options.tfClient,
        frameID: options.tfClient.fixedFrame,
        object: new THREE.Line(),
      });
      this.rootObject.add(this.sn);

      let rosTopic = new ROSLIB.Topic({
        ros: options.ros,
        name: options.topic,
        messageType: "hanp_msgs/HumanPathArray",
      });
      rosTopic.subscribe(this.pathArrayReceived);
    }

    private pathArrayReceived = (message: HANPMsgs.HumanPathArray) => {
      let previousLines = this.lines;
      this.lines = new Array<THREE.Line>();

      for (let path of message.paths) {
        let lineGeometry = new THREE.Geometry();
        for (let i = 0; i < path.path.poses.length; i++) {
          let v3 = new THREE.Vector3(path.path.poses[i].pose.position.x,
            path.path.poses[i].pose.position.y,
            path.path.poses[i].pose.position.z + this.zOffset);
          lineGeometry.vertices.push(v3);
        }
        lineGeometry.computeLineDistances();
        let lineColor = typeof this.color === "number" ? <number>this.color : (<THREE.Color>this.color).getHex();
        let lineMaterial = new THREE.LineBasicMaterial({ color: lineColor, linewidth: this.width, overdraw: 0.5 });
        this.lines.push(new THREE.Line(lineGeometry, lineMaterial));
      }

      if (this.sn.frameID !== message.header.frame_id) {
        this.sn.resubscribeTf(message.header.frame_id);
      }

      if (previousLines != null) {
        for (let line of previousLines) {
          this.sn.remove(line);
        }
      }
      for (let line of this.lines) {
        this.sn.add(line);
      }
    }
  }
}
