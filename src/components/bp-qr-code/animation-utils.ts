import { QRCodeEntity } from './animations';

export const distanceBetween = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
) => Math.hypot(x2 - x1, y2 - y1);

enum HorizontalFocalPoint {
  Left,
  Middle,
  Right
}

enum VerticalFocalPoint {
  Top,
  Center,
  Bottom
}

export const translatePoint = (edgeLength: number) => {
  return (
    x: number,
    y: number,
    hFocus: HorizontalFocalPoint,
    vFocus: VerticalFocalPoint
  ) => {
    return {
      adjustedX:
        hFocus === HorizontalFocalPoint.Left
          ? x
          : hFocus === HorizontalFocalPoint.Right
            ? x + edgeLength
            : x + edgeLength / 2,
      adjustedY:
        vFocus === VerticalFocalPoint.Top
          ? y
          : vFocus === VerticalFocalPoint.Bottom
            ? y + edgeLength
            : y + edgeLength / 2
    };
  };
};

const adjustRing = translatePoint(7);
const adjustCenter = translatePoint(3);

function focalPoint<T>(
  value: number,
  center: number,
  less: T,
  equal: T,
  greater: T
) {
  return value < center ? less : value > center ? greater : equal;
}

export const innermostPoint = (
  x: number,
  y: number,
  count: number,
  entity: QRCodeEntity
) => {
  const center = count / 2;
  const horizontalFocus = focalPoint<HorizontalFocalPoint>(
    x,
    center,
    HorizontalFocalPoint.Right,
    HorizontalFocalPoint.Middle,
    HorizontalFocalPoint.Left
  );
  const verticalFocus = focalPoint<VerticalFocalPoint>(
    y,
    center,
    VerticalFocalPoint.Bottom,
    VerticalFocalPoint.Center,
    VerticalFocalPoint.Top
  );
  return entity === QRCodeEntity.PositionCenter
    ? adjustCenter(x, y, horizontalFocus, verticalFocus)
    : entity === QRCodeEntity.PositionRing
      ? adjustRing(x, y, horizontalFocus, verticalFocus)
      : { adjustedX: x, adjustedY: y };
};

/**
 * Derived from https://github.com/sktt/springish-css/
 */
export const underdampedHarmonicOscillationMaximums = (
  amplitude: number,
  stiffness: number,
  damping: number
) => {
  const MIN_Y = 0.01;
  const offset = 0;
  const dampingRatio = stiffness - damping ** 2;
  if (dampingRatio < 0)
    throw new Error('This method only supports underdamped oscillation.');
  const omega = Math.sqrt(dampingRatio);

  const amp = t => amplitude * Math.pow(Math.E, -damping * t);
  const y = t => amp(t) * Math.cos(omega * t + offset);
  const yMax = p =>
    (Math.atan(-damping / omega) + p * Math.PI - offset) / omega;

  const maximums: { time: number; amplitude: number }[] = [];
  maximums.push({ time: 0, amplitude: y(0) });
  for (
    var a = 0;
    Math.abs(maximums[maximums.length - 1].amplitude) > MIN_Y;
    a++
  ) {
    if (yMax(a) >= 0) {
      maximums.push({ time: yMax(a), amplitude: y(yMax(a)) });
    }
  }
  return maximums;
};

export const range = (length: number, begin: number = 0) =>
  Array.from({ length }, (_, index) => begin + index);

export const scaleOscillationsToOffset = (
  beginningOffset: number,
  endingOffset: number,
  maximums: {
    time: number;
    amplitude: number;
  }[]
): { offset: number; value: number }[] => {
  const availableTime = endingOffset - beginningOffset;
  const unscaledEndTime = maximums[maximums.length - 1].time;
  const scalingFactor = availableTime / unscaledEndTime;
  return maximums.map(({ time, amplitude }) => ({
    offset: beginningOffset + time * scalingFactor,
    value: amplitude
  }));
};

export const applyToValues = (
  keyframes: {
    offset: number;
    value: number;
  }[],
  operation: (value: number) => number | string
) =>
  keyframes.map(keyframe => ({
    offset: keyframe.offset,
    value: operation(keyframe.value)
  }));
