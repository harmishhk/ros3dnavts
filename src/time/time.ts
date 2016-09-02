namespace ROS3DNAV {
  export class Time {
    private time: number;
    sec: number;
    nsec: number;

    constructor() { }

    now() {
      this.time = (new Date()).getTime();
      this.sec = Math.floor(this.time / 1000);
      this.nsec = this.time % 1000;
      return { sec: this.sec, nsec: this.nsec };
    }
  }
}
