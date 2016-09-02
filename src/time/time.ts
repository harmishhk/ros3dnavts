namespace ROS3DNAV {
  export class Time {
    public sec: number;
    public nsec: number;
    private time: number;

    public now() {
      this.time = (new Date()).getTime();
      this.sec = Math.floor(this.time / 1000);
      this.nsec = this.time % 1000;
      return { sec: this.sec, nsec: this.nsec };
    }
  }
}
