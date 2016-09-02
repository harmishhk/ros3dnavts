namespace ROS3DNAV {
  export class SceneNode extends ROS3D.SceneNode {
    public resubscribeTf(frameID: string) {
      this.tfClient.unsubscribe(this.frameID, this.tfUpdate);
      this.frameID = frameID;
      this.tfClient.subscribe(this.frameID, this.tfUpdate);
    }
  }
}
