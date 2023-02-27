import { AddAnimationOptions } from 'just-animate/types/lib/core/types';
import {
  innermostPoint,
  distanceBetween,
  underdampedHarmonicOscillationMaximums,
  applyToValues,
  scaleOscillationsToOffset,
} from './animation-utils';

export enum QRCodeEntity {
  Module = 'module',
  PositionRing = 'position-ring',
  PositionCenter = 'position-center',
  Icon = 'icon',
}

export type QRCodeAnimation = (
  targets: any,
  modulePositionX: number,
  modulePositionY: number,
  count: number,
  entityType: QRCodeEntity
) => AddAnimationOptions;

export enum AnimationPreset {
  FadeInTopDown = 'FadeInTopDown',
  FadeInCenterOut = 'FadeInCenterOut',
  RadialRipple = 'RadialRipple',
  RadialRippleIn = 'RadialRippleIn',
  MaterializeIn = 'MaterializeIn',
}

const FadeInTopDown: QRCodeAnimation = (targets, _x, y, _count, _entity) => {
  return {
    targets,
    from: y * 20,
    duration: 300,
    web: {
      opacity: [0, 1],
    },
  };
};

const FadeInCenterOut: QRCodeAnimation = (targets, x, y, count, entity) => {
  const { adjustedX, adjustedY } = innermostPoint(x, y, count, entity);
  const center = count / 2;
  const distance = distanceBetween(adjustedX, adjustedY, center, center);
  return {
    targets,
    from: distance * 20,
    duration: 200,
    web: {
      opacity: [0, 1],
    },
  };
};

const MaterializeIn: QRCodeAnimation = (targets, _x, _y, _count, entity) => ({
  targets,
  from: entity === QRCodeEntity.Module ? Math.random() * 200 : 200,
  duration: 200,
  web: {
    opacity: [0, 1],
  },
});

const beginOscillation = 0.2;
const endOscillation = 1;
const amplitude = 5;
const stiffness = 50;
const damping = 3;

const radialRippleMaximums = underdampedHarmonicOscillationMaximums(
  amplitude,
  stiffness,
  damping
);

const radialRippleOscillationKeyframes = scaleOscillationsToOffset(
  beginOscillation,
  endOscillation,
  radialRippleMaximums
);

const RadialRipple: QRCodeAnimation = (targets, x, y, count, entity) => {
  const { adjustedX, adjustedY } = innermostPoint(x, y, count, entity);
  const center = count / 2;
  const distanceFromCenter = distanceBetween(
    adjustedX,
    adjustedY,
    center,
    center
  );

  const waveResistance = 7;

  return {
    targets,
    from: distanceFromCenter * waveResistance,
    easing: 'cubic-bezier(0.445,  0.050, 0.550, 0.950)',
    duration: 1000,
    web: {
      scale: [
        ...(entity === QRCodeEntity.Icon
          ? [
              { offset: 0, value: 1 },
              { offset: 0.1, value: 0.7 },
              { offset: 0.2, value: 1 },
            ]
          : [{ offset: 0, value: 1 }]),
        ...applyToValues(
          radialRippleOscillationKeyframes,
          (x) => 1 + (x / amplitude) * 0.1
        ),
        1,
      ],
    },
  };
};

const RadialRippleIn: QRCodeAnimation = (targets, x, y, count, entity) => {
  const { adjustedX, adjustedY } = innermostPoint(x, y, count, entity);
  const center = count / 2;
  const distanceFromCenter = distanceBetween(
    adjustedX,
    adjustedY,
    center,
    center
  );

  const waveResistance = 7;

  return {
    targets,
    from: distanceFromCenter * waveResistance,
    easing: 'cubic-bezier(0.445,  0.050, 0.550, 0.950)',
    duration: 1000,
    web: {
      scale: [
        ...(entity === QRCodeEntity.Icon
          ? [
              { offset: 0, value: 1 },
              { offset: 0.1, value: 0.7 },
              { offset: 0.2, value: 1 },
            ]
          : [{ offset: 0, value: 0 }]),
        ...applyToValues(
          radialRippleOscillationKeyframes,
          (x) => 1 + (x / amplitude) * 0.1
        ),
        1,
      ],
      opacity: [
        { offset: 0, value: 0 },
        { offset: 0.05, value: 1 },
      ],
    },
  };
};

export const getAnimationPreset = (name: string) => {
  switch (name) {
    case AnimationPreset.FadeInTopDown:
      return FadeInTopDown;
    case AnimationPreset.FadeInCenterOut:
      return FadeInCenterOut;
    case AnimationPreset.RadialRipple:
      return RadialRipple;
    case AnimationPreset.RadialRippleIn:
      return RadialRippleIn;
    case AnimationPreset.MaterializeIn:
      return MaterializeIn;
    default:
      throw new Error(`${name} is not a valid AnimationPreset.`);
  }
};
