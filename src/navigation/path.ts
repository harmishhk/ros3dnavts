namespace ROS3DNAV {
  export interface PathOptions {
    ros: ROSLIB.Ros;
    topic: string;
    tfClient: ROSLIB.TFClient;
    color?: number;
    rootObject?: THREE.Object3D;
  }

  export class Path extends THREE.Object3D {
    private color: number;
    private rootObject: THREE.Object3D;

    private line: THREE.Line;
    private sn: SceneNode;

    constructor(public options: PathOptions) {
      super();
      this.color = options.color || 0xcc00ff;
      this.rootObject = options.rootObject || new THREE.Object3D;

      this.line = new THREE.Line();

      this.sn = new SceneNode({
        tfClient: options.tfClient,
        frameID: options.tfClient.fixedFrame,
        object: this.line
      });
      this.rootObject.add(this.sn);

      let rosTopic = new ROSLIB.Topic({
        ros: options.ros,
        name: options.topic,
        messageType: 'nav_msgs/Path'
      });
      rosTopic.subscribe(this.pathReceived);
    }

    private pathReceived = (message: NavMsgs.Path) => {
      let previousLine = this.line;

      let lineGeometry = new THREE.Geometry();
      for (let i = 0; i < message.poses.length; i++) {
        let v3 = new THREE.Vector3(message.poses[i].pose.position.x,
          message.poses[i].pose.position.y,
          message.poses[i].pose.position.z);
        lineGeometry.vertices.push(v3);
      }
      lineGeometry.computeLineDistances();

      let lineMaterial = new THREE.LineBasicMaterial({ color: this.color });
      this.line = new THREE.Line(lineGeometry, lineMaterial);

      if (this.sn.getFrame() != message.header.frame_id) {
        this.sn.resubscribeTf(message.header.frame_id);
      }

      if (previousLine != null) {
        this.sn.remove(previousLine);
      }
      this.sn.add(this.line);
    }
  }
}
