declare module "ROS3DNAV" {
    export = ROS3DNAV;
}
declare namespace ROS3DNAV {
    class HumanPath extends THREE.Object3D {
        options: PathOptions;
        private rootObject;
        private color;
        private width;
        private zOffset;
        private line;
        private sn;
        constructor(options: PathOptions);
        private pathReceived;
    }
}
declare namespace ROS3DNAV {
    class HumanPathArray extends THREE.Object3D {
        options: PathOptions;
        private rootObject;
        private color;
        private width;
        private zOffset;
        private lines;
        private sn;
        constructor(options: PathOptions);
        private pathArrayReceived;
    }
}
declare namespace ROS3DNAV {
    class HumanTrajectory extends THREE.Object3D {
        options: TrajectoryOptions;
        private rootObject;
        private color;
        private width;
        private zOffset;
        private line;
        private sn;
        constructor(options: TrajectoryOptions);
        private trajectoryReceived;
    }
}
declare namespace ROS3DNAV {
    class HumanTrajectoryArray extends THREE.Object3D {
        options: TrajectoryOptions;
        private rootObject;
        private color;
        private width;
        private zOffset;
        private lines;
        private sn;
        constructor(options: TrajectoryOptions);
        private trajectoryArrayReceived;
    }
}
declare namespace ROS3DNAV {
    interface OccupancyGridClientOptions {
        ros: ROSLIB.Ros;
        viewer: ROS3DNAV.Viewer;
        topic?: string;
        continuous?: boolean;
        tfClient?: ROSLIB.TFClient;
        rootObject?: THREE.Object3D | THREE.Scene;
        offsetPose?: ROSLIB.Pose;
        color?: {
            r: number;
            g: number;
            b: number;
        };
        opacity?: number;
    }
    class OccupancyGridClient extends ROS3D.OccupancyGridClient {
        private viewer;
        private mouseRaycaster;
        private projector;
        private mouseVector;
        private mouseDownPoint;
        private arrow;
        private showingArrow;
        private senderInfo;
        private arrowCallback;
        constructor(options: OccupancyGridClientOptions);
        createArrowControl(arrowCallback: (success: boolean, position?: THREE.Vector3, orientation?: THREE.Quaternion, message?: string, senderInfo?: any) => void, senderInfo?: any): boolean;
        private onMouseDown;
        private onMouseMove;
        private onMouseUp;
        private getMousePoint(event);
    }
}
declare namespace ROS3DNAV {
    interface PathOptions {
        ros: ROSLIB.Ros;
        topic: string;
        tfClient: ROSLIB.TFClient;
        rootObject?: THREE.Object3D;
        color?: THREE.Color | number;
        width?: number;
        zOffset?: number;
    }
    class Path extends THREE.Object3D {
        options: PathOptions;
        private rootObject;
        private color;
        private width;
        private zOffset;
        private line;
        private sn;
        constructor(options: PathOptions);
        private pathReceived;
    }
}
declare namespace ROS3DNAV {
    interface TrajectoryOptions {
        ros: ROSLIB.Ros;
        topic: string;
        tfClient: ROSLIB.TFClient;
        rootObject?: THREE.Object3D;
        color?: THREE.Color | number;
        width?: number;
        zOffset?: number;
    }
    class Trajectory extends THREE.Object3D {
        options: TrajectoryOptions;
        private rootObject;
        private color;
        private width;
        private zOffset;
        private line;
        private sn;
        constructor(options: TrajectoryOptions);
        private trajectoryReceived;
    }
}
declare namespace ROS3DNAV {
    class TrajectoryArray extends THREE.Object3D {
        options: TrajectoryOptions;
        private rootObject;
        private color;
        private width;
        private zOffset;
        private lines;
        private sn;
        constructor(options: TrajectoryOptions);
        private trajectoryArrayReceived;
    }
}
declare namespace ROS3DNAV {
    class Time {
        private time;
        constructor(secs: number, nsecs: number);
        static now(): {
            secs: number;
            nsecs: number;
        };
        toSec(): number;
    }
}
declare namespace ROS3DNAV {
    class SceneNode extends ROS3D.SceneNode {
        resubscribeTf(frameID: string): void;
    }
}
declare namespace ROS3DNAV {
    class Viewer extends ROS3D.Viewer {
        private lastAutoRotateSpeed;
        private lastUserRotateSpeed;
        private orbitControlsEnabled;
        disableOrbitControls(): void;
        enableOrbitControls(): void;
    }
}
