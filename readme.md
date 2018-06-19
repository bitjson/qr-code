# BitPay QR Code

A framework-less QR Code Web Component.

## Usage

Import the `bp-qr-code` component properly using your build system/framework, or use the standalone script:

```html
<script src="/path/to/bp-qr-code.js"></script>
```

Then use the component anywhere in the document:

```html
<bp-qr-code></bp-qr-code>
```

To use the `animateQRCode` method, the [Web Animations API polyfill](https://github.com/web-animations/web-animations-js) is required for [good browser support](https://github.com/web-animations/web-animations-js/blob/c5bf98eb447a76910297b8ccd011ace3310d1372/docs/support.md#browser-support). Import it properly with your build system, or

```html
<script src="https://unpkg.com/web-animations-js@2.3.1/web-animations.min.js"></script>
```

## Examples

Here's an example taking advantage of all configuration options:

```html
 <bp-qr-code
    id="qr1"
    contents="customprotocol:?r=https://bitpay.com/i/exampleh3mCKGUna7v9S1z"
    module-color="#1c7d43"
    position-ring-color="#13532d"
    position-center-color="#1c7d43"
    mask-x-to-y-ratio="1.2"
    style="width: 200px; height: 200px; background-color: #fff">
    <img src="assets/icon.svg" slot="icon">
  </bp-qr-code>
  <script>
    setTimeout(() => {
      document
        .getElementById('qr1')
        .animateQRCode('MaterializeIn');
    }, 1000);
  </script>
```

For more examples, [see `index.html`](./src/index.html) or clone this repo, `npm install`, and `npm start`.

## Contributing

You'll need [Node.js](https://nodejs.org/en/download/), then:

```bash
npm install
npm start
```

### Production build

```bash
npm run build
```

### Run the tests

```bash
npm test
```
