import { Polygon } from 'pixi.js';

export class Hitbox {
  private constructor(public shape: Polygon[]) {
    this.shape = shape;
  }

  contains(x: number, y: number) {
    if (!this.shape || this.shape.length == 0) return false;

    return this.shape.some(polygon => {
      return polygon.contains(x, y);
    });
  }

  static from(shapeData: number[][], offset = 0) {
    const polygons = shapeData.map(p => new Polygon(p.map(p => p - offset)));

    return new Hitbox(polygons);
  }
}
