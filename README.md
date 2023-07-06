# vite-plugin-vue-css-module

Provides Vue3 cssModule syntax sugar so that you don't have to write `$style.` again and again. You just need to write the code like a normal class attribute.

Before using it, you might have written something like:

```html
<template>
  <div :class="$style.red"></div>
  <div :class="[$style.red, $style['red--active']]"></div>
  <div :class="{ [$style.red]: type === 'red' }"></div>
</template>
<style module>
  .red {
    color: red;
  }
</style>
```

**After using it, you no longer need to repeat the `$style.`, you just need to write this:**

```html
<template>
  <div cls="red"></div>
  <div cls="red red--active"></div>
  <div :cls="{ red: type === 'red' }"></div>
</template>
<style module>
  .red {
    color: red;
  }
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

Add the configuration in the `vite.config.js` file
 
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

Used in the `**.vue` file. Enable css-module in `<style module></style>`, as mentioned on the [vue3](https://cn.vuejs.org/api/sfc-css-features.html#css-modules) website. After that, all you need to do is write the class name on the node in `<template>` as you would with a class, using the `attrName` attribute you set, and it will automatically add `$style.` for you. It automatically handles `attrName` you set in relation to `class` and `:class`.

Note: This syntax sugar is currently only supported in `<template>`

```html
<!-- App.vue -->
<template>
  <div class="yellow" :class="{ green: true }" cls="red pink">vite-plugin-vue-css-module</div>
  <div class="yellow" :class="[ type ]" :cls="['red', type === 'active' ? 'red--active' : 'red--inactive], true && 'red--focus'">vite-plugin-vue-css-module</div>
  <div :cls="{ red: type === 'default' , 'red--active': type === 'active' }">vite-plugin-vue-css-module</div>
  <div :cls="type === 'active' && 'red--active'"></div>
</template>

<style module>
  .red {
    color: red;
  }
  .red--active {
    color: darkred;
  }
</style>

<style>
  .green {
    color: green;
  }
  .yellow {
    color: yellow;
  }
</style>
```


## License

MIT