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
| :------------------ | ----------------------------: |
| **autoplay**        | false                         |
| _Start a slideshow_
| **autoplayDelay**   | 3000                          |
| _Delay (in ms) between slides, when autoplaying_
| **breakpoints**     | [600, 1000, 1400, 1920, 3840] |
| _Array of breakpoints (see pageItems)_
| **infinity**        | true                          |
| _Infinite navigation, otherwise rolls back to first_
| **navInline**       | true                          |
| _Render navigation dots inline (true), or after_
| **pageItems**       | [2, 3, 4, 6, 8]               |
| _Number of thumbnails shown per breakpoint_
| **showThumbnails**  | false                         |
| _Show and generate thumbnails_
| **slides**          | [ ]                           |
| _JSON-array with slide-data (see example below)_
| **thumbnails**      | [ ]                           |
| _JSON-array with thumbnail-data_
| **touchDistance**   | 100                           |
| _Pixelss required to trigger a touch-event_
| **url**             | ''                            |
| _Url for fetching slides- and thumbnail-data_

If you're loading settings from `data-*` attributes, use a colon as prefix for all non-string values:

```html
data-autoplay=":true"
data-breakpoints=":[600, 800, 1000, 1200, 3840]"
```

### CSS Classes

| CSS Class           | Default value                         |
| :------------------ | :------------------------------------ |
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
| clsItemVideo        | 'c-carousel__item-video'              |
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
| :---------| :------------ |
| labelNext | 'Next'        |
| labelPlay | 'Play/Pause'  |
| labelPrev | 'Previous'    |
| labelZoom | 'Zoom in'     |

## Mofifiers
  c-carousel--indicator-lines // Show lines instead of dots
  c-carousel--nav-below // Requires data-render-nav-inline=":true"
  c-carousel--panorama 
  c-carousel--thirds
  c-carousel--timeline

  Aspect Ratios
  c-carousel--ar-1-1
  c-carousel--ar-4-3
  c-carousel--ar-16-9
  c-carousel--ar-185-1
  c-carousel--ar-239-1
  c-carousel--ar-275-1
  c-carousel--ar-3-2
  c-carousel--ar-4-1

  Aspect Ratios: Thumbnails
  c-carousel--tar-1-1
  c-carousel--tar-4-3
  c-carousel--tar-16-9
  c-carousel--tar-185-1
  c-carousel--tar-239-1
  c-carousel--tar-275-1
  c-carousel--tar-3-2
  c-carousel--tar-4-1