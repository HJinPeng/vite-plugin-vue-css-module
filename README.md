# vite-plugin-vue-css-module

Provides Vue3 cssModule syntax sugar so that you don't have to write `$style.` again and again. You just need to write the code like a normal class attribute. It supports the Vue default template and the Pug template.

Before using it, you might have written something like:

```html
<template>
  <div :class="$style.red"></div>
  <div :class="[type === 'red' && $style.red, $style['red--active']]"></div>
  <div :class="{ [$style.red]: type === 'red' , [$style[type + '--active']]: true}"></div>
</template>
<style module>
  .red {
    color: red;
  }
  .red--active {
    color: darkred;
  }
</style>
```

**After using it, you no longer need to repeat the `$style.`, you just need to write this:**

In the Vue default template

```html
<template>
  <div cls="red"></div>
  <div :cls="[type === 'red' && 'red', 'red--active']"></div>
  <div :cls="{ red: type === 'red', [type + '--active']: true }"></div>
</template>
<style module>
  /* ... */
</style>
```

In the Pug template

```html
<template lang="pug">
div(cls="red")
div(:cls="[type === 'red' && 'red', 'red--active']")
div(:cls="{ red: type === 'red', [type + '--active']: true }")
</template>
<style module>
  /* ... */
</style>
```

Now, let's use it!

## Installation

vite-plugin-vue-css-module works in vue3 and vite.

Install with npm:

```bash
npm i --save-dev vite-plugin-vue-css-module
```

## Usage

First, add the configuration in the `vite.config.js` file

```js
// vite.config.js
import vueCssModule from 'vite-plugin-vue-css-module'
export default defineConfig({
  plugins: [
    vueCssModule({
      // By default, it is "cls", but you can change it to another name. However, it is better to use a unique name.
      attrName: 'cls'
    }),
    vue()
  ],
})
```

Then, use it in the `**.vue` file.
- Add 'module' to the style tag to enable [css-module](https://cn.vuejs.org/api/sfc-css-features.html#css-modules)
- In the template, use the 'attrName' value you set (the default is 'cls' ) to write the class name

```html
<template>
  <div cls="red pink">vite-plugin-vue-css-module</div>
  <div class="yellow" :class="[ type ]" :cls="['red', type === 'active' ? 'red--active' : 'red--inactive], true && 'red--focus'">vite-plugin-vue-css-module</div>
  <div :cls="{ red: type === 'default' , ['red--' + type]: type === 'active' }">vite-plugin-vue-css-module</div>
  <div :cls="type === 'active' && 'red--active'"></div>
  <!-- Complex situations are also supported -->
  <div :class="{ type: true }" :cls="[type1, [type2, type3, { type4: true }], { type5: true }, 'type4']"></div>
  <!-- Non-standard writing is also supported -->
  <div class="yellow" :cls=' [ 1 === 1 ?`${type}--active` : type + "--inactive" ]    '></div>
</template>

<style module>
  .red {
    color: red;
  }
  .red--active {
    color: darkred;
  }
  /* ... */
</style>

<style>
  .yellow {
    color: yellow;
  }
  /* ... */
</style>
```

In addition, if you are using the pug template, the writing method is exactly the same.

> Note:
> - This syntax sugar is currently only supported in `<template>` or `<template lang="pug">`.
> - The plugin will only find the first style tag that uses module and then use its name, which defaults to $style. In fact, setting a custom name such as `<style module="moduleName">` does not make sense for this plugin.
> - The plugin supports a variety of class name writing, although the writing is not very standardized.

### Pug class literals

In pug templates, it's possible to convert class literals to module classes.

To enable that, set `pugClassLiterals: true` in plugin options:

When you set it to `true`, the class name priority is as follows: `class` < `:class` < `class literals` < `cls` < `:cls`

```js
// vite.config.js
import vueCssModule from 'vite-plugin-vue-css-module'
export default defineConfig({
  plugins: [
    vueCssModule({
      // Disabled by default.
      pugClassLiterals: true
    }),
    vue()
  ],
})
```

Then:

```html
<template lang="pug">
.red This is red.
div(cls="red") This is red.
div(class="red") This is not red.
</template>

<style module>
.red { color: red; }
</style>
```

## License

MIT
