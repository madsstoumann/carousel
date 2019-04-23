# Carousel module
Carousel / Slider / Gallery ... 

## Dynamic load
Load a carousel for all elements with `data-js` containing `"carousel"`, ie. `data-js="carousel"`

```js
<script type="module">
  const elements = document.querySelectorAll('[data-js*="carousel"]');
  if (elements.length) {
    import('/carousel.mjs')
    .then(module => {
      const jsClass = module.default;
      elements.forEach(element => {
        new jsClass(element, element.dataset);
      });
    })
  }
</script>
```

## Settings

| Setting             | Default value                 |
| ------------------- | ----------------------------: |
| **autoplay**        | false                         |
| _Start a slideshow_
| **autoplayDelay**   | 3000                          |
| _Delay (in ms) between slides, when autoplaying_
| **breakpoints**     | [600, 1000, 1400, 1920, 3840] |
| _Array of breakpoints (see pageItems)_
| **infinity**        | true                          |
| _Show previous and next slide_
| **navInline**       | true                          |
| _Render navigation dots inline (true), or after_
| **pageItems**       | [2, 3, 4, 6, 8]               |
| _Number of thumbnails shown per breakpoint_
| **showThumbnails**  | false                         |
| **slides**          | [ ]                           |
| **thumbnails**      | [ ]                           |
| **touchDistance**   | 100                           |
| **url**             | ''                            |

If you're loading settings from `data-*` attributes, use a colon as prefix for all non-string values:

```html
data-autoplay=":true"
data-breakpoints=":[600, 800, 1000, 1200, 3840]"
```

### CSS Classes

| CSS Class           | Default value                         |
| ------------------- | ------------------------------------- |
| clsActive           | 'c-carousel__item--active'            |
| clsAnimate          | 'c-carousel--animate'                 |
| clsCarousel         | 'c-carousel__list'                    |
| clsInner            | 'c-carousel__inner'                   |
| clsItem             | 'c-carousel__item'                    |
| clsItemContent      | 'c-carousel__item-content'            |
| clsItemHeading      | 'c-carousel__item-heading'            |
| clsItemImage        | 'c-carousel__item-image'              |
| clsItemLink         | 'c-carousel__item-link'               |
| clsItemText         | 'c-carousel__item-text'               |
| clsLive             | 'u-visually-hidden c-carousel__live'  |
| clsNav              | 'c-carousel__nav'                     |
| clsNavItem          | 'c-carousel__nav-item'                |
| clsNavButton        | 'c-carousel__nav-dot'                 |
| clsNavButtonActive  | 'c-carousel__nav-dot--active'         |
| clsNavWrapper       | 'c-carousel__nav-wrapper'             |
| clsNext             | 'c-carousel__nav--next'               |
| clsPause            | 'c-carousel__nav--pause'              |
| clsPlay             | 'c-carousel__nav--play'               |
| clsPrev             | 'c-carousel__nav--prev'               |
| clsReverse          | 'c-carousel--reverse'                 |
| clsThumbnailImage   | 'c-carousel__thumb-image'             |
| clsThumbnailInner   | 'c-carousel__thumb-inner'             |
| clsThumbnailItem    | 'c-carousel__thumb-item'              |
| clsThumbnailNav     | 'c-carousel__thumb-nav'               |
| clsThumbnailNext    | 'c-carousel__thumb-next'              |
| clsThumbnailOuter   | 'c-carousel__thumb-outer'             |
| clsThumbnailPrev    | 'c-carousel__thumb-prev'              |
| clsThumbnailActive  | 'c-carousel__thumb-item--active'      |
| clsThumbnailWrapper | 'c-carousel__thumb-wrapper'           |
| clsZoom             | 'c-carousel__zoom'                    |

### Labels

| Label     | Default value |
| ----------| ------------- |
| labelNext | 'Next'        |
| labelPlay | 'Play/Pause'  |
| labelPrev | 'Previous'    |
| labelZoom | 'Zoom in'     |
