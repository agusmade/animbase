# AnimBase

[![npm](https://img.shields.io/npm/v/animbase)](https://www.npmjs.com/package/animbase)
[![install size](https://packagephobia.com/badge?p=animbase)](https://packagephobia.com/result?p=animbase)
[![bundlephobia](https://img.shields.io/bundlephobia/minzip/animbase)](https://bundlephobia.com/package/animbase)
[![license](https://img.shields.io/badge/license-MIT-green)](https://github.com/agusmade/animbase/blob/main/LICENSE)
[![gh-pages](https://img.shields.io/badge/demo-gh--pages-orange)](https://agusmade.github.io/animbase/)

**The declarative animation engine** – Animate HTML elements using only `data-*` attributes. No custom JavaScript required.

## ✨ Features

-   🔧 **Fully declarative** via `data-anim-init` and `data-anim-config`
-   🎞️ **Frame-based timeline**
-   🎨 Supports numeric values and colors
-   ⚡ Per-subvalue easing (e.g., `transform: translateY(20px.out)`, `color: #00f.out`)
-   🧠 Detects and interpolates each number or color in a single property (e.g., `box-shadow`, `filter`, `transform`, `outline`, etc.)
-   🎯 Multiple timeline sources (3 types):
    -   external-controlled (scroll, input range, other)
    -   triggered timer (looping or one-shot)
-   🔂 Triggered animation with runtime control API
-   ⏯️ Playback control: trigger, pause, resume, stop, seek
-   🔁 Direction control with `reverse`
-   ☝️ Play-once support with `once`
-   🪝 Hooks: `onStart` and `onFinish`
-   🧩 Easy to extend and integrate

---

## 🚀 Installation

### Using NPM

```bash
npm install animbase
```

Then import manually:

```js
import AnimBase from 'animbase';
```

### Using CDN

```html
<script type="module" src="https://unpkg.com/animbase/dist/animbase.iife.min.js"></script>
```

---

## 🧭 Quick Start

### 1. Include the script

```html
<script type="module" src="https://unpkg.com/animbase/dist/animbase.iife.min.js"></script>
```

### 2. Add animated element using one of two animation modes:

#### A. External-Controlled Animator

These use `data-anim-controller-ref` and/or `data-anim-controlled-by`.

```html
<input type="range" id="range" min="0" max="100" />
<div
	data-anim-controller-ref="#range"
	data-anim-controlled-by="value"
	data-anim-init='{"opacity": "0"}'
	data-anim-config='{"100": {"opacity": "1"}}'
></div>

<!-- Or using scrollY on window -->
<div
	data-anim-controlled-by="scrollY"
	data-anim-init='{"transform": "translateY(100px.out)"}'
	data-anim-config='{"200": {"transform": "translateY(0px.out)"}}'
></div>
```

-   `data-anim-controller-ref`: selector of the controlling element (default: `window`)
-   `data-anim-controlled-by`: property to read (e.g. `value`, `scrollTop`, `scrollLeft`)
-   `data-anim-listen` (optional): event to listen (e.g. `input`, `scroll`, `timeupdate`, etc.)

Default behavior:

-   If only `data-anim-controller-ref` → property defaults to `value`, listens to `input`
-   If only `data-anim-controlled-by` → target defaults to `window`, uses common scroll events

#### B. Triggered Timed Animator

```html
<!-- Config element (required once per group) -->
<div
	data-anim-trigger-group="hero"
	data-anim-trigger-config='{"speed": 60, "once": false, "reverse": false, "autostart": true}'
></div>

<!-- Animated element(s) -->
<div data-anim-init='{"opacity": "0"}' data-anim-config='{"100": {"opacity": "1"}}' data-anim-trigger-group="hero"></div>

<!-- Optional JS control -->
<script>
	AnimBase.trigger('hero');
</script>
```

---

## 📚 Documentation

API reference and usage guide:  
👉 [https://agusmade.github.io/animbase/docs](https://agusmade.github.io/animbase/docs)

---

## 🎨 Demo Gallery

Explore live demos of AnimBase in action:  
👉 [https://agusmade.github.io/animbase/demo](https://agusmade.github.io/animbase/demo)

Includes coverflow, book flips, 3D cards, scroll animations, and more.

--

## 📁 Builds

AnimBase includes multiple builds:

| File                      | Type       | Notes                     |
| ------------------------- | ---------- | ------------------------- |
| `animbase.esm.js`         | ESM        | For modern bundlers       |
| `animbase.cjs.js`         | CommonJS   | For Node or legacy tools  |
| `animbase.iife.js`        | IIFE       | Non-minified global build |
| `animbase.iife.min.js`    | IIFE (min) | Production CDN use        |
| `animbase-core-only.*.js` | Core only  | Excludes auto-init logic  |

> ⚠️ Source maps are not included in the npm package to keep it lightweight.

---

## 🧠 How It Works

-   `data-anim-init` defines the initial style (e.g. `{ "opacity": "0", "transform": "scale(0.5)" }`)
-   `data-anim-config` defines how it animates over time using keyframes with optional easing per subvalue
-   Subvalue formats supported:
    -   `1`, `1px`, `1%`, `1deg`, `#00f` → default to **linear easing**
    -   `1.out`, `1px.in`, `#00f.inOut` → apply **explicit easing function**
-   Includes 30+ easing types: `linear`, `inOutBack`, `outElastic`, `inBounce`, `spring`, and more.
-   Each CSS property string is parsed to detect subvalues (numbers, units, colors), all of which are animated individually.
    -   Example: `boxShadow: "0 0 10px #000"` → 4 animatable parts.
    -   Works with **any property** containing animatable values.

---

## 🧪 Advanced API (for `trigger-group` only)

```js
AnimBase.trigger('group'); // Start animation
AnimBase.pause('group'); // Pause
AnimBase.resume('group'); // Resume
AnimBase.stop('group'); // Stop and reset
AnimBase.seek('group', 50); // Jump to frame 50
AnimBase.setReverse('group', true); // Reverse playback
AnimBase.setOnce('group', true); // Play once only

AnimBase.setHooks('group', {
	onStart: () => console.log('Started'),
	onFinish: () => console.log('Finished'),
});

// Add element programmatically
AnimBase.getAnimator('group').addElement(domElement, {init, config});
```

---

## 📦 License

MIT

---

🎉 Check out the [live demos](https://agusmade.github.io/animbase/) to see AnimBase in action, or integrate it into your next web creation!

🔗 GitHub: [github.com/agusmade/animbase](https://github.com/agusmade/animbase)  
📦 NPM: [npmjs.com/package/animbase](https://www.npmjs.com/package/animbase)

---

👋 AnimBase is open-source and ready to grow with your creativity.  
Contribute, suggest features, or just say hi!

Made with ❤️ by Agus Made
