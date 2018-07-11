import {
  Component,
  Element,
  Event,
  EventEmitter,
  Prop,
  Method,
  State,
  Watch
} from '@stencil/core';

import { addPlugin, animate } from 'just-animate';
import { AddAnimationOptions } from 'just-animate/types/lib/core/types';
import { waapiPlugin } from 'just-animate/lib.es2015/web';
addPlugin(waapiPlugin);

// Un-comment to design animations:
import { player } from 'just-animate/lib.es2015/tools';

import qrcode from 'qrcode-generator';

export enum QRCodeEntity {
  Module = 'module',
  PositionRing = 'position-ring',
  PositionCenter = 'position-center',
  Icon = 'icon'
}

export type QRCodeAnimation = (
  targets: any,
  modulePositionX: number,
  modulePositionY: number,
  count: number,
  entityType: QRCodeEntity
) => AddAnimationOptions;

const distanceBetween = (x1: number, y1: number, x2: number, y2: number) =>
  Math.hypot(x2 - x1, y2 - y1);

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

const translatePoint = (edgeLength: number) => {
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

const innermostPoint = (
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

enum AnimationPreset {
  FadeInTopDown = 'FadeInTopDown',
  FadeInCenterOut = 'FadeInCenterOut',
  RadialRipple = 'RadialRipple',
  MaterializeIn = 'MaterializeIn'
}

const FadeInTopDown: QRCodeAnimation = (targets, _x, y, _count, _entity) => {
  return {
    targets,
    from: y * 20,
    duration: 300,
    web: {
      opacity: [0, 1]
    }
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
      opacity: [0, 1]
    }
  };
};

const MaterializeIn: QRCodeAnimation = (targets, _x, _y, _count, entity) => {
  return {
    targets,
    from: entity === QRCodeEntity.Module ? Math.random() * 200 : 200,
    duration: 200,
    web: {
      opacity: [0, 1]
    }
  };
};

const RadialRipple: QRCodeAnimation = (targets, x, y, count, entity) => {
  const { adjustedX, adjustedY } = innermostPoint(x, y, count, entity);
  const center = count / 2;
  const distance = distanceBetween(adjustedX, adjustedY, center, center);
  return {
    targets,
    from: distance * 20,
    duration: 1000,
    web: {
      perspective: 100,
      z: [0, 5, 0, 3, 0, 1]
    }
  };
};

const getAnimationPreset = (name: string) => {
  switch (name) {
    case AnimationPreset.FadeInTopDown:
      return FadeInTopDown;
    case AnimationPreset.FadeInCenterOut:
      return FadeInCenterOut;
    case AnimationPreset.RadialRipple:
      return RadialRipple;
    case AnimationPreset.MaterializeIn:
      return MaterializeIn;
    default:
      throw new Error(`${name} is not a valid AnimationPreset.`);
  }
};

@Component({
  tag: 'bp-qr-code',
  styleUrl: 'bp-qr-code.css',
  shadow: true
})
export class BpQRCode {
  @Element() qrCodeElement: HTMLElement;

  @Prop() contents = '';
  @Prop() protocol: string = '';
  @Prop() moduleColor: string = '#000';
  @Prop() positionRingColor: string = '#000';
  @Prop() positionCenterColor: string = '#000';
  @Prop() maskXToYRatio: number = 1;
  @Prop() legacy: boolean = false;

  @State() data: string;
  @State() moduleCount: number;

  @Event() codeRendered: EventEmitter;

  /**
   * The first update must run after load to query the created shadowRoot for
   * slotted nodes.
   */
  componentDidLoad() {
    this.updateQR();
  }

  componentDidUpdate() {
    this.codeRendered.emit();
  }

  @Watch('contents')
  @Watch('protocol')
  @Watch('moduleColor')
  @Watch('positionRingColor')
  @Watch('positionCenterColor')
  @Watch('maskXToYRatio')
  @Watch('legacy')
  updateQR() {
    /**
     * E.g. Firefox, as of Firefox 61
     */
    const isUsingWebComponentPolyfill =
      (this.qrCodeElement as any) === this.qrCodeElement.shadowRoot;
    const realSlot = this.qrCodeElement.shadowRoot.querySelector('slot');
    const hasSlot = isUsingWebComponentPolyfill
      ? this.qrCodeElement.querySelector('[slot]')
        ? true
        : false
      : realSlot
        ? realSlot.assignedNodes().length > 0
        : false;

    this.data = this.generateQRCodeSVG(this.contents, hasSlot);
  }

  @Method()
  // Stencil currently doesn't allow type exports – real signature:
  // animateQRCode(animation?: AnimationPreset | QRCodeAnimation) {
  animateQRCode(animation?: any) {
    this.executeAnimation(
      typeof animation === 'string' ? getAnimationPreset(animation) : animation
    );
  }

  @Method()
  getModuleCount() {
    return this.moduleCount;
  }

  executeAnimation(animation: QRCodeAnimation) {
    const modules = Array.from(
      this.qrCodeElement.shadowRoot.querySelectorAll('.module')
    );
    const rings = Array.from(
      this.qrCodeElement.shadowRoot.querySelectorAll('.position-ring')
    );
    const centers = Array.from(
      this.qrCodeElement.shadowRoot.querySelectorAll('.position-center')
    );
    const icons = Array.from(
      this.qrCodeElement.shadowRoot.querySelectorAll('#icon-wrapper')
    );
    const setEntityType = (array: Element[], entity: QRCodeEntity) => {
      return array.map(element => {
        return {
          element,
          entityType: entity
        };
      });
    };

    const animationAdditions = [
      ...setEntityType(modules, QRCodeEntity.Module),
      ...setEntityType(rings, QRCodeEntity.PositionRing),
      ...setEntityType(centers, QRCodeEntity.PositionCenter),
      ...setEntityType(icons, QRCodeEntity.Icon)
    ]
      .map(({ element, entityType }) => {
        return {
          element,
          // SVGElement.dataset is part of the SVG 2.0 draft
          // TODO: requires a polyfill for Edge:
          // https://developer.mozilla.org/en-US/docs/Web/API/SVGElement/dataset
          positionX: parseInt((element as any).dataset.column, 10),
          positionY: parseInt((element as any).dataset.row, 10),
          entityType: entityType
        };
      })
      .map(entityInfo =>
        animation(
          entityInfo.element,
          entityInfo.positionX,
          entityInfo.positionY,
          this.moduleCount,
          entityInfo.entityType
        )
      );

    const timeline = animate(animationAdditions);

    // Un-comment to design animations:
    player(timeline);

    timeline.play();
  }

  generateQRCodeSVG(contents: string, maskCenter: boolean) {
    const qr = qrcode(
      /* Auto-detect QR Code version to use */ 0,
      /* Highest error correction level */ 'H'
    );
    qr.addData(contents);
    qr.make();
    const margin = 4;
    this.moduleCount = qr.getModuleCount();
    const pixelSize = this.moduleCount + margin * 2;
    return `
    <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox="0 0 ${pixelSize} ${pixelSize}"
        preserveAspectRatio="xMinYMin meet">
    <rect
        width="100%"
        height="100%"
        fill="white"
        fill-opacity="0"
        cx="0"
        cy="0"/>
    ${
      this.legacy
        ? void 0
        : renderQRPositionDetectionPatterns(
            this.moduleCount,
            margin,
            this.positionRingColor,
            this.positionCenterColor
          )
    }
    ${renderQRModulesSVG(
      qr,
      this.moduleCount,
      margin,
      maskCenter,
      this.maskXToYRatio,
      this.legacy,
      this.moduleColor
    )}
    </svg>`;

    function renderQRPositionDetectionPatterns(
      count: number,
      margin: number,
      ringFill: string,
      centerFill: string
    ) {
      return `
      ${renderQRPositionDetectionPattern(
        margin,
        margin,
        margin,
        ringFill,
        centerFill
      )}
      ${renderQRPositionDetectionPattern(
        count - 7 + margin,
        margin,
        margin,
        ringFill,
        centerFill
      )}
      ${renderQRPositionDetectionPattern(
        margin,
        count - 7 + margin,
        margin,
        ringFill,
        centerFill
      )}
      `;
    }

    function renderQRPositionDetectionPattern(
      x: number,
      y: number,
      margin: number,
      ringFill: string,
      centerFill: string
    ) {
      return `
      <path class="position-ring" fill="${ringFill}" data-column="${x -
        margin}" data-row="${y - margin}" d="M${x} ${y -
        0.5}h6s.5 0 .5 .5v6s0 .5-.5 .5h-6s-.5 0-.5-.5v-6s0-.5 .5-.5zm.75 1s-.25 0-.25 .25v4.5s0 .25 .25 .25h4.5s.25 0 .25-.25v-4.5s0-.25 -.25 -.25h-4.5z"/>
      <path class="position-center" fill="${centerFill}" data-column="${x -
        margin +
        2}" data-row="${y - margin + 2}" d="M${x + 2} ${y +
        1.5}h2s.5 0 .5 .5v2s0 .5-.5 .5h-2s-.5 0-.5-.5v-2s0-.5 .5-.5z"/>
      `;
    }

    function renderQRModulesSVG(
      qr: QRCode,
      count: number,
      margin: number,
      maskCenter: boolean,
      maskXToYRatio: number,
      legacy: boolean,
      moduleFill: string
    ) {
      let svg = '';
      for (let column = 0; column < count; column += 1) {
        const positionX = column + margin;
        for (let row = 0; row < count; row += 1) {
          if (
            qr.isDark(column, row) &&
            (legacy ||
              (!isPositioningElement(row, column, count) &&
                !isRemovableCenter(
                  row,
                  column,
                  count,
                  maskCenter,
                  maskXToYRatio
                )))
          ) {
            const positionY = row + margin;
            svg += legacy
              ? `
            <rect x="${positionX - 0.5}" y="${positionY -
                  0.5}" width="1" height="1" />
            `
              : `
            <circle
                class="module"
                fill="${moduleFill}"
                cx="${positionX}"
                cy="${positionY}"
                data-column="${column}"
                data-row="${row}"
                r="0.5"/>`;
          }
        }
      }
      return svg;
    }

    function isPositioningElement(row: number, column: number, count: number) {
      const elemWidth = 7;
      return row <= elemWidth
        ? column <= elemWidth || column >= count - elemWidth
        : column <= elemWidth
          ? row >= count - elemWidth
          : false;
    }

    /**
     * For ErrorCorrectionLevel 'H', up to 30% of the code can be corrected. To
     * be safe, we limit damage to 10%.
     */
    function isRemovableCenter(
      row: number,
      column: number,
      count: number,
      maskCenter: boolean,
      maskXToYRatio: number
    ) {
      if (!maskCenter) return false;
      const center = count / 2;
      const safelyRemovableHalf = Math.floor((count * Math.sqrt(0.1)) / 2);
      const safelyRemovableHalfX = safelyRemovableHalf * maskXToYRatio;
      const safelyRemovableHalfY = safelyRemovableHalf / maskXToYRatio;
      const safelyRemovableStartX = center - safelyRemovableHalfX;
      const safelyRemovableEndX = center + safelyRemovableHalfX;
      const safelyRemovableStartY = center - safelyRemovableHalfY;
      const safelyRemovableEndY = center + safelyRemovableHalfY;

      return (
        row >= safelyRemovableStartY &&
        row <= safelyRemovableEndY &&
        column >= safelyRemovableStartX &&
        column <= safelyRemovableEndX
      );
    }
  }

  render() {
    return (
      <div id="qr-container">
        <div
          id="icon-container"
          style={this.legacy ? { display: 'none', visibility: 'hidden' } : {}}
        >
          <div
            id="icon-wrapper"
            style={{ width: `${18 * this.maskXToYRatio}%` }}
            data-column={this.moduleCount / 2}
            data-row={this.moduleCount / 2}
          >
            <slot name="icon" />
          </div>
        </div>
        <div innerHTML={this.data} />
      </div>
    );
  }
}
