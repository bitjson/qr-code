# bitjson/qr-code

A framework-less `<qr-code>` element (a [Web Component](https://developer.mozilla.org/en-US/docs/Web/Web_Components)).

## Usage

Import the `qr-code` component properly using your build system or framework, or use the standalone script in your HTML `<head>` element:

```html
<script src="/path/to/qr-code.js"></script>
```

Then use the component anywhere in your HTML `<body>` element:

```html
<qr-code contents="https://bitjson.com"></qr-code>
```

## Examples

Here's an example taking advantage of all configuration options:

```html
<qr-code
  id="qr1"
  contents="https://bitjson.com"
  module-color="#1c7d43"
  position-ring-color="#13532d"
  position-center-color="#70c559"
  mask-x-to-y-ratio="1.2"
  style="width: 200px; height: 200px; background-color: #fff"
>
  <img src="assets/icon.svg" slot="icon" />
</qr-code>
<script>
  setTimeout(() => {
    document.getElementById('qr1').animateQRCode('MaterializeIn');
  }, 1000);
</script>
```

For more examples, review [`src/index.html`](src/index.html).

## Animations

Several preset animations are available, simply run them with the element's `animateQRCode` method:

```js
document.getElementById('qr1').animateQRCode('RadialRipple');
```

The current, built-in presets are:

- `FadeInTopDown`
- `FadeInCenterOut`
- `MaterializeIn`
- `RadialRipple`
- `RadialRippleIn`

Custom animations can be defined with a single, pure function; rather than an animation preset name, simply pass in the function:

```js
// A layered, "explosion" fade-in
document
  .getElementById('qr1')
  .animateQRCode((targets, _x, _y, _count, entity) => ({
    targets,
    from: entity === 'module' ? Math.random() * 200 : 200,
    duration: 500,
    easing: 'cubic-bezier(1,1,0,.5)',
    web: {
      opacity: [0, 1],
      scale: [0.3, 1.13, 0.93, 1],
    },
  }));
```

The built-in presets are also defined using this API. Review [`src/components/qr-code/animations.ts`](src/components/qr-code/animations.ts) to see how they work. Pull request for new presets are welcome!

The **animation previewer makes fine-tuning animations much easier**: try it by cloning this repo and running the `start` package script:

```
git clone https://github.com/bitjson/qr-code.git
cd qr-code
npm ci
npm start
```

### Production build

Disable the `just-animate` player in [`src/components/qr-code/qr-code.tsx`](src/components/qr-code/qr-code.tsx), then build:

```bash
npm run build
```

You can test the built component by pointing the script in [`src/index.html`](src/index.html) to `dist/qr-code.js` and then opening `src/index.html` via the local filesystem.

### Run the tests

```bash
npm test
```
