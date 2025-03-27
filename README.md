# AnimBase

**The declarative animation engine** – Animate HTML elements using only `data-*` attributes. No custom JavaScript required.

## ✨ Features

-   🔧 **Fully declarative** via `data-anim-init` and `data-anim-config`
-   🎞️ **Frame-based timeline**
-   🎨 Supports numeric values and colors
-   ⚡ Per-subvalue easing (e.g., `transform: translateY(20px.out)`, `color: #00f.out`)
-   🧠 Detects and interpolates each number or color in a single property (e.g., `box-shadow`, `filter`, `transform`, `outline`, etc.)
-   🎯 Multiple timeline sources:
    -   scroll (`scrollTop`, `scrollLeft`)
    -   range input or any bound controller element
    -   triggered timer (looping or one-shot)
-   🧠 Automatic controller binding (via `autoinit.js`)
-   🔂 Triggered animation with runtime control API
-   ⏯️ Playback control: trigger, pause, resume, stop, seek
-   🔁 Direction control with `reverse`
-   ☝️ Play-once support with `once`
-   🪝 Hooks: `onStart` and `onFinish`
-   🧩 Easy to extend and integrate

---

## 🚀 Quick Start

### 1. Include the script

```html
<script type="module" src="./autoinit.js"></script>
```

### 2. Add animated element using one of three timeline types:

#### 🧭 A. Controlled by another element (e.g. range input)

```html
<input type="range" id="slider" min="0" max="100" value="0" />
<div data-anim-init='{"opacity": "0"}' data-anim-config='{"100": {"opacity": "1"}}' data-anim-controller-ref="#slider"></div>
```

#### 🌐 B. Controlled by scroll position

```html
<div data-anim-init='{"transform": "translateY(100px.out)"}' data-anim-config='{"200": {"transform": "translateY(0px.out)"}}' data-anim-controlled-by="scrollTop"></div>
```

#### ⏱️ C. Triggered timed animation (manual or autoplay)

```html
<!-- Config element (required once per group) -->
<div data-anim-trigger-group="hero" data-anim-trigger-config='{"speed": 60, "once": false, "reverse": false, "autostart": true}'></div>

<!-- Animated element(s) -->
<div data-anim-init='{"opacity": "0"}' data-anim-config='{"100": {"opacity": "1"}}' data-anim-trigger-group="hero"></div>

<!-- Optional JS control -->
<script>
	AnimBase.trigger("hero");
</script>
```

---

## 🧠 How It Works

-   `data-anim-init` defines the initial style (e.g. `{"opacity": "0", "transform": "scale(0.5)"}`)
-   `data-anim-config` defines how it animates over time, using keyframes and optional easing per subvalue
-   Subvalue formats supported:
    -   `1`, `1px`, `1%`, `1deg`, `#00f` → default to **linear easing**
    -   `1.out`, `1px.in`, `#00f.inOut` → apply **explicit easing function**
-   Includes a wide range of easing types like `outElastic`, `inBounce`, and more.
-   Each CSS property string is scanned for subvalues (numbers, units, colors) and those values are animated individually.
    -   Example: `boxShadow: 0 0 10px #000` (from CSS `box-shadow`) will animate all 4 values if defined in config.
    -   This works for **any CSS property** with embedded numeric or color values.
-   Timeline source is defined by one of:
    -   `data-anim-controller-ref`: reference to another DOM element (e.g. range input)
    -   `data-anim-controlled-by`: scroll-based timeline (`scrollTop` or `scrollLeft`)
    -   `data-anim-trigger-group`: programmatic or timed animation loop

❗ Only one of these three should be defined per element.

---

## 🧪 Advanced API (for `trigger-group` only)

```js
AnimBase.trigger("group"); // Start animation
AnimBase.pause("group"); // Pause
AnimBase.resume("group"); // Resume
AnimBase.stop("group"); // Stop and reset
AnimBase.seek("group", 50); // Jump to frame 50
AnimBase.setReverse("group", true); // Enable reverse playback
AnimBase.setOnce("group", true); // Only play once (no loop)

AnimBase.setHooks("group", {
	onStart: () => console.log("Started"),
	onFinish: () => console.log("Finished"),
});
```

---

## 📦 License

MIT

---

Made with ❤️ by Agus Made
