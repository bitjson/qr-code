import { TestWindow } from '@stencil/core/testing';
import { BpQRCode } from './bp-qr-code';

describe('bp-qr-code', () => {
  it('should build', () => {
    expect(new BpQRCode()).toBeTruthy();
  });

  describe('rendering', () => {
    let element: HTMLBpQrCodeElement;
    let testWindow: TestWindow;
    beforeEach(async () => {
      testWindow = new TestWindow();
      element = await testWindow.load({
        components: [BpQRCode],
        html: '<bp-qr-code></bp-qr-code>'
      });
    });

    it('should work without parameters', () => {
      expect(element.textContent.trim()).toEqual('TODO');
    });
  });
});
