namespace ROS3DNAV {
  export class Time {
    private time: Date;

    constructor(secs: number, nsecs: number) {
      this.time = new Date(secs * 1000 + Math.floor(nsecs * 0.000001));
    }

    public static now() {
      let now = (new Date()).getTime();
      return { secs: Math.floor(now / 1000), nsecs: now % 1000 };
    }

    public toSec() {
      return this.time.getSeconds() + this.time.getMilliseconds() * 0.001;
    }
  }
}
