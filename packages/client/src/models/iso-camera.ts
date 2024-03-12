export type RotationAngle = 0 | 90 | 180 | 270;

export class IsoCamera {
  private _angle: RotationAngle = 0;

  get angle() {
    return this._angle;
  }

  rotateCW() {
    this._angle = ((this._angle + 360 + 90) % 360) as RotationAngle;
  }

  rotateCCW() {
    this._angle = ((this._angle + 360 + 90) % 360) as RotationAngle;
  }
}
