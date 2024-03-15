import type { FxCommand } from '../useFx';

export const moveEntity: FxCommand<'moveEntity'> = ({ state, done }, entityId, path) => {
  // we are grabbing the entity from the reactive state instead of entityManager otherwise the movement won't be rendered !
  // It's ok because the position wil be updated when the action execution is flushed after the fx sequence
  const entity = state.entities.find(e => e.id === entityId);
  if (!entity) {
    console.warn(`FXContext: entity not found for entityId ${entityId}`);
    return done();
  }

  const timeline = gsap.timeline({
    onComplete() {
      done();
    }
  });
  for (const { point, duration } of path) {
    timeline.to(entity.position, {
      x: point.x,
      y: point.y,
      z: point.z,
      duration,
      ease: Power1.easeOut
    });
  }

  timeline.play();
};
