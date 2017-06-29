namespace ROS3DNAV {
  export class HumanTrajectoryArray extends THREE.Object3D {
    private rootObject: THREE.Object3D;
    private color: THREE.Color;
    private cylinderColor: THREE.Color;
    private width: number;
    private zOffset: number;

    private lines: THREE.Line[];
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

      this.lines = new Array<THREE.Line>();

      let cylinderLength = 2.0;
      let cylinderRadius = 0.1;
      this.cylinderGeometry = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, cylinderLength, 8);
      this.cylinderGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, cylinderLength / 2, 0));
      this.cylinderGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));

      this.sn = new SceneNode({
        tfClient: options.tfClient,
        frameID: options.tfClient.fixedFrame,
        object: new THREE.Line(),
      });
      this.rootObject.add(this.sn);

      let rosTopic = new ROSLIB.Topic({
        ros: options.ros,
        name: options.topic,
        messageType: "hanp_msgs/HumanTrajectoryArray",
      });
      rosTopic.subscribe(this.trajectoryArrayReceived);
    }

    private trajectoryArrayReceived = (message: HANPMsgs.HumanTrajectoryArray) => {
      let previousLines = this.lines;
      this.lines = new Array<THREE.Line>();

      for (let trajectory of message.trajectories) {
        let lineGeometry = new THREE.Geometry();
        for (let i = 0; i < trajectory.trajectory.points.length; i++) {
          let v3 = new THREE.Vector3(trajectory.trajectory.points[i].transform.translation.x,
            trajectory.trajectory.points[i].transform.translation.y,
            trajectory.trajectory.points[i].transform.translation.z + this.zOffset);
          lineGeometry.vertices.push(v3);
        }
        lineGeometry.computeLineDistances();
        let lineMaterial = new THREE.LineBasicMaterial({ color: this.color.getHex(), linewidth: this.width, overdraw: 0.5 });
        let line = new THREE.Line(lineGeometry, lineMaterial);

        let cylinderHue = 1.0;
        for (let j = 1; j < trajectory.trajectory.points.length; j++) {
          if (trajectory.trajectory.points[j].time_from_start.secs != trajectory.trajectory.points[j - 1].time_from_start.secs) {
            let nSecBefore = 1 - trajectory.trajectory.points[j - 1].time_from_start.nsecs * 1e-9;
            let nSecAfter = trajectory.trajectory.points[j].time_from_start.nsecs * 1e-9;
            let tRatio = nSecBefore / (nSecBefore + nSecAfter);
            let xDiff = trajectory.trajectory.points[j].transform.translation.x - trajectory.trajectory.points[j - 1].transform.translation.x;
            let yDiff = trajectory.trajectory.points[j].transform.translation.y - trajectory.trajectory.points[j - 1].transform.translation.y;

            let cylinderMaterial = new THREE.MeshBasicMaterial({ color: this.cylinderColor.clone().setHSL(cylinderHue, 1, 0.5).getHex() });
            let cylinder = new THREE.Mesh(this.cylinderGeometry, cylinderMaterial)

            cylinder.position.x = trajectory.trajectory.points[j - 1].transform.translation.x + (tRatio * xDiff);
            cylinder.position.y = trajectory.trajectory.points[j - 1].transform.translation.y + (tRatio * yDiff);
            cylinder.position.z = 0;

            if (cylinderHue > 0.0) {
              cylinderHue -= 0.1;
            }
            line.add(cylinder);
          }
        }

        this.lines.push(line);
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
