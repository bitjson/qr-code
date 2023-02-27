import { TestWindow } from '@stencil/core/testing';
import { BpQRCode } from './qr-code';

describe('qr-code', () => {
  it('should build', () => {
    expect(new BpQRCode()).toBeTruthy();
  });

  describe('rendering', () => {
    let element: HTMLQrCodeElement;
    let testWindow: TestWindow;
    beforeEach(async () => {
      testWindow = new TestWindow();
      element = await testWindow.load({
        components: [BpQRCode],
        html: '<qr-code></qr-code>',
      });
    });

    it('should work without parameters', () => {
      expect(element.textContent.trim()).toEqual('TODO');
    });
  });
});
