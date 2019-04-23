/**
 * Carousel module.
 * @module carousel.mjs
 * @version 0.9.26
 * @author Mads Stoumann
 * @description Carousel-control
 */

export default class Carousel {
  constructor(wrapper, settings) {
    this.settings = Object.assign(
      {
        autoplay: false,
        autoplayDelay: 3000,
        breakpoints: [600, 1000, 1400, 1920, 3840],
        infinity: true,
        json: '',
        navInline: true,
        pageItems: [2, 3, 4, 6, 8],
        showThumbnails: false,
        slides: [],
        thumbnails: [],
        touchDistance: 100,
        url: '',

        clsActive: 'c-carousel__item--active',
        clsAnimate: 'c-carousel--animate',
        clsCarousel: 'c-carousel__list',
        clsInner: 'c-carousel__inner',
        clsItem: 'c-carousel__item',
        clsItemContent: 'c-carousel__item-content',
        clsItemHeading: 'c-carousel__item-heading',
        clsItemImage: 'c-carousel__item-image',
        clsItemLink: 'c-carousel__item-link',
        clsItemText: 'c-carousel__item-text',
        clsLive: 'u-visually-hidden c-carousel__live',
        clsNav: 'c-carousel__nav',
        clsNavItem: 'c-carousel__nav-item',
        clsNavButton: 'c-carousel__nav-dot',
        clsNavButtonActive: 'c-carousel__nav-dot--active',
        clsNavWrapper: 'c-carousel__nav-wrapper',
        clsNext: 'c-carousel__nav--next',
        clsPause: 'c-carousel__nav--pause',
        clsPlay: 'c-carousel__nav--play',
        clsPrev: 'c-carousel__nav--prev',
        clsReverse: 'c-carousel--reverse',
        clsThumbnailImage: 'c-carousel__thumb-image',
        clsThumbnailInner: 'c-carousel__thumb-inner',
        clsThumbnailItem: 'c-carousel__thumb-item',
        clsThumbnailNav: 'c-carousel__thumb-nav',
        clsThumbnailNext: 'c-carousel__thumb-next',
        clsThumbnailOuter: 'c-carousel__thumb-outer',
        clsThumbnailPrev: 'c-carousel__thumb-prev',
        clsThumbnailActive: 'c-carousel__thumb-item--active',
        clsThumbnailWrapper: 'c-carousel__thumb-wrapper',
        clsZoom: 'c-carousel__zoom',

        labelNext: 'Next',
        labelPlay: 'Play/Pause',
        labelPrev: 'Previous',
        labelZoom: 'Zoom in'
      },
      this.stringToType(settings)
    );

    /* Set wrapper, add eventListeners */
    this.wrapper = wrapper;
    this.wrapper.addEventListener('keydown', event => this.handleKeys(event));
    this.wrapper.addEventListener(
      'touchmove',
      event => this.handleTouch(event, this.settings.touchDistance),
      { passive: true }
    );
    this.wrapper.addEventListener(
      'touchstart',
      event => {
        this.touchPosition = event.changedTouches[0].pageX;
      },
      { passive: true }
    );

    this.headings =
      wrapper.querySelectorAll(`.${this.settings.clsItemHeading}`) || [];

    /* Set carousel, create if not exist */
    this.carousel = this.wrapper.querySelector(`.${this.settings.clsCarousel}`);
    if (!this.carousel) {
      this.carousel = this.h('ul', {
        class: this.settings.clsCarousel,
        itemscope: 'itemscope',
        itemtype: 'http://schema.org/ItemList'
      });
      this.wrapper.appendChild(this.carousel);
    }
    this.carousel.classList.add(this.settings.clsAnimate);

    /* Set inner, create if not exist */
    this.inner = this.wrapper.querySelector(`.${this.settings.clsInner}`);
    if (!this.inner) {
      this.inner = this.h('div', {
        class: this.settings.clsInner
      });
      this.carousel.appendChild(this.inner);
    }

    /* Create live-region */
    this.live = this.h('span', {
      class: this.settings.clsLive,
      'aria-atomic': true,
      'aria-live': true
    });
    this.wrapper.appendChild(this.live);

    /* WIP Create slides */
    if (this.settings.slides.length) {
      const html = this.createSlides(this.settings.slides);
      // eslint-disable-next-line
      console.log(html);
    }

    this.slides = Array.from(this.carousel.children);
    /* Add meta:position, add aria-hidden to non-active slides */
    this.slides.forEach((slide, index) => {
      this.h('meta', { itemprop: 'position', content: index + 1 }, slide);
      if (index !== this.activeSlide) {
        slide.setAttribute('aria-hidden', true);
      }
    });

    /* Create navigation */
    this.createNavigation();

    /* Create thumbnails */
    if (this.settings.showThumbnails) {
      this.thumbnails = this.settings.thumbnails.length
        ? this.settings.thumbnails
        : this.slides.map(element => element.querySelector('img'));

      if (this.thumbnails.length) {
        this.breakpoints = this.settings.breakpoints.map(
          (breakpoint, index) => {
            const min = index > 0 ? this.settings.breakpoints[index - 1] : 0;
            return window.matchMedia(
              `(min-width: ${min}px) and (max-width: ${breakpoint - 1}px)`
            );
          }
        );
        this.breakpoints.forEach(breakpoint =>
          breakpoint.addListener(this.updateItemsPerPage.bind(this))
        );
        this.createThumbnails();
        this.updateItemsPerPage();
      }
    }

    /* Set state defaults */
    this.activeSlide = 0;
    this.interval = '';
    this.isPlaying = this.settings.autoplay;
    this.itemsPerPage = 4;
    this.page = 1;
    this.previousSlide = 0;
    this.total = this.slides.length - 1;
    this.totalPages = 1;
    this.touchPosition = 0;

    /* Init */
    this.autoPlay(this.isPlaying);
    this.gotoSlide(0, true, false);

    // eslint-disable-next-line
    console.dir(this);
  }

  /**
   * @function addClassArray
   * @param {Node} element
   * @param (Array | String) array
   * @description Adds an array of classes to an element (IE hack)
   */
  addClassArray(element, array) {
    if (Array.isArray(array)) {
      array.forEach(className => element.classList.add(className));
    } else {
      element.classList.add(array);
    }
  }

  /**
   * @function autoPlay
   * @param {Boolean} run
   * @description Starts/stops autoplay of slides
   */
  autoPlay(run) {
    this.isPlaying = run;
    this.play.setAttribute('aria-pressed', run);
    this.play.classList.toggle(this.settings.clsPause, run);
    if (run) {
      this.interval = setInterval(() => {
        this.navSlide(true);
      }, this.settings.autoplayDelay);
    } else {
      clearInterval(this.interval);
    }
  }

  /**
   * @function createNavigation
   * @description Create navigation-elements: dots, next, play, prev
   */
  createNavigation() {
    this.navigation = this.h('nav', {
      class: this.settings.clsNav,
      itemscope: 'itemscope',
      itemtype: 'http://schema.org/SiteNavigationElement'
    });
    this.navigation.innerHTML = this.slides
      .map(
        (_item, index) =>
          `<div class="${this.settings.clsNavItem}"><button class="${
            this.settings.clsNavButton
          }" aria-label="${
            this.headings[index] ? this.headings[index].innerText : ''
          }" data-slide="${index}" itemprop="name"></button></div>`
      )
      .join('');
    this.navigation.addEventListener('click', event => {
      const slide = event.target.dataset.slide;
      if (slide) {
        this.gotoSlide(slide - 0);
      }
    });

    this.navigationWrapper = this.h('div', {
      class: this.settings.clsNavWrapper
    });
    this.navigationWrapper.appendChild(this.navigation);

    if (this.settings.navInline) {
      /* Output dots inline (default) */
      this.inner.appendChild(this.navigationWrapper);
    } else {
      /* Output dots in main wrapper (timeline and other scenarios) */
      this.wrapper.appendChild(this.navigationWrapper);
    }

    const previous = this.h('button', {
      class: this.settings.clsPrev,
      'aria-label': this.settings.labelPrev,
      rel: 'next'
    });
    previous.addEventListener('click', () => this.navSlide(false));

    this.play = this.h('button', {
      class: this.settings.clsPlay,
      'aria-label': this.settings.labelPlay
    });
    this.play.addEventListener('click', () => this.autoPlay(!this.isPlaying));

    const next = this.h('button', {
      class: this.settings.clsNext,
      'aria-label': this.settings.labelNext,
      rel: 'prev'
    });
    next.addEventListener('click', () => this.navSlide(true));

    const zoom = this.h('button', {
      class: this.settings.clsZoom,
      'aria-label': this.settings.labelZoom
    });
    zoom.addEventListener('click', () => this.toggleZoom(true));

    this.inner.appendChild(previous);
    this.inner.appendChild(this.play);
    this.inner.appendChild(next);
    this.inner.appendChild(zoom);
  }

  /**
   * @function createSlides
   * @description Create slides from json
   */
  createSlides(json) {
    return json
      .forEach(
        (slide, index) => `
    <li class="${
      this.settings.clsItem
    }" itemprop="itemListElement" itemscope itemtype="http://schema.org/ListItem">
      <figure class="${
        this.settings.clsContent
      }" itemprop="associatedMedia" itemscope itemtype="${
          slide.type === 'video'
            ? 'http://schema.org/VideoObject'
            : 'http://schema.org/ImageObject'
        }">
      ${
        slide.type === 'video'
          ? `
        <meta itemprop="description" content="${slide.description}">
        <meta itemprop="name" content="${slide.title}" />
        <meta itemprop="thumbnailUrl" content="${slide.thumbnail}" />
        <meta itemprop="uploadDate" content="${slide.uploadDate}" />
        <video v-if="videoLocal(image.src)" class="imagegallery__video" tabindex="-1" controls><source src="${
          slide.src
        }" :type="videoType(image.src)"></video>
        <iframe v-else :src="image.src" class="imagegallery__iframe" frameborder="0" tabindex="-1" allow="autoplay; encrypted-media" allowfullscreen></iframe>
      `
          : `
        <img src="${slide.src}" alt="${slide.title}" class="${
              this.settings.clsItemImage
            }" loading="${index === 0 ? 'eager' : 'lazy'}" />
      `
      }
        <span class="${this.settings.clsItemHeading}" itemprop="name">${
          slide.title
        }</span>
        <figcaption class="${
          this.settings.clsItemText
        }" itemprop="description">${slide.description}</figcaption>
      </figure>
      <a href="${slide.url}" class="${
          this.settings.clsItemLink
        }" itemprop="url" tabindex="-1">${slide.link}</a>
    </li>
    `
      )
      .join('');
  }

  /**
   * @function createThumbnails
   * @description Create thumbnails and thumbnail-navigation
   */
  createThumbnails() {
    this.thumbnailNext = this.h('button', {
      class: this.settings.clsThumbnailNext,
      'aria-label': this.settings.labelNext
    });
    this.thumbnailNext.addEventListener('click', () => {
      this.gotoPage(true);
    });

    this.thumbnailPrev = this.h('button', {
      class: this.settings.clsThumbnailPrev,
      'aria-label': this.settings.labelPrev
    });
    this.thumbnailPrev.addEventListener('click', () => {
      this.gotoPage(false);
    });

    this.thumbnailInner = this.h('div', {
      class: this.settings.clsThumbnailInner
    });
    this.thumbnailInner.innerHTML = this.thumbnails
      .map(
        (image, index) => `
    <figure class="${this.settings.clsThumbnailItem}">
      <img src="${image.src}" alt="${image.alt}" class="${
          this.settings.clsThumbnailImage
        }" data-slide="${index}" loading="lazy" />
    </figure>`
      )
      .join('');

    const thumbnailOuter = this.h('div', {
      class: this.settings.clsThumbnailOuter
    });

    const thumbnailWrapper = this.h('nav', {
      class: this.settings.clsThumbnailWrapper
    });

    thumbnailOuter.appendChild(this.thumbnailInner);
    thumbnailWrapper.appendChild(this.thumbnailPrev);
    thumbnailWrapper.appendChild(thumbnailOuter);
    thumbnailWrapper.appendChild(this.thumbnailNext);
    this.wrapper.appendChild(thumbnailWrapper);

    this.thumbnails = this.thumbnailInner.querySelectorAll(
      `.${this.settings.clsThumbnailItem}`
    );

    /* Add eventListeners */
    this.thumbnailInner.addEventListener('click', event => {
      const slide = event.target.dataset.slide;
      if (slide) {
        this.gotoSlide(slide - 0);
      }
    });
  }

  /**
   * @function getIndex
   * @param {Number} slide
   * @param {Number} length Total number of slides
   * @param {Boolean} dirUp Direction: up (true) or down (false)
   * @description Return index of next/prev slide
   * @returns Number
   */
  getIndex(slide, length, dirUp) {
    let index = slide;

    if (dirUp) {
      index++;
    } else {
      index--;
    }

    if (index < 0) {
      index = length;
    }
    if (index > length) {
      index = 0;
    }
    return index;
  }

  /**
   * @function gotoPage
   * @param {Boolean} [dirUp]
   * @description Scroll to a specific "page" within timeline or thumbnails
   */
  gotoPage(dirUp) {
    if (typeof dirUp !== 'undefined') {
      const page = this.page + (dirUp ? 1 : -1);
      this.page =
        page > this.totalPages ? 1 : page < 1 ? this.totalPages : page;
    }
    this.thumbnailInner.style.transform = `translateZ(0) translateX(${-100 *
      (this.page - 1)}%)`;
  }

  /**
   * @function gotoSlide
   * @param {Number} slideIndex
   * @param {Boolean} [dirUp]
   * @param {Boolean} [animate]
   * @description Go to specific slide
   */
  gotoSlide(slideIndex = -1, dirUp, animate = true) {
    /* Determine slide-direction: Only apply if NOT infinity: true */
    this.carousel.classList.toggle(
      this.settings.clsReverse,
      this.settings.infinity ? !dirUp : slideIndex < this.activeSlide
    );
    this.previousSlide = this.activeSlide;

    if (slideIndex > -1) {
      this.activeSlide = slideIndex - 0;
    }

    this.setReference();
    this.reorderSlides();
    this.setActiveDot();
    this.setLiveRegion();

    this.page = Math.ceil((slideIndex + 1) / this.itemsPerPage);

    if (this.settings.showThumbnails) {
      this.setActiveThumbnail();
      this.gotoPage();
    }

    /* Animate: Remove class, add it again after 50ms */
    if (animate) {
      this.carousel.classList.remove(this.settings.clsAnimate);
      setTimeout(() => {
        this.carousel.classList.add(this.settings.clsAnimate);
      }, 1000 / 16);
    }
  }

  /**
   * @function h
   * @param {String} type
   * @param {Array | Object} attributes
   * @param {Array} [children]
   * @description DOM-factory
   */
  h(type, attributes, children = []) {
    const element = document.createElement(type);
    for (let key in attributes) {
      element.setAttribute(key, attributes[key]);
    }
    if (children.length) {
      children.forEach(child => {
        if (typeof child === 'string') {
          element.appendChild(document.createTextNode(child));
        } else {
          element.appendChild(child);
        }
      });
    }
    return element;
  }

  /**
   * @function handleKeys
   * @param {Event} event
   * @description Handle keyboard-navigation
   */
  handleKeys(event) {
    switch (event.key) {
      /* Space: Pause autoplay */
      case ' ':
        if (document.activeElement === this.wrapper) {
          this.isPlaying = !this.isPlaying;
          this.play.focus();
        }
        break;

      /* Left: Previous slide */
      case 'ArrowLeft':
      case 'Left':
        this.navSlide(false);
        break;

      /* Right: Next slide */
      case 'ArrowRight':
      case 'Right':
        this.navSlide(true);
        break;
      default:
        break;
    }
  }

  /**
   * @function handleTouch
   * @description Handles touch-move events
   * @param {Event} event
   * @param {Number} distance Distance to swipe before callback-function is invoked
   */
  handleTouch(event, distance) {
    const currentPosition = event.changedTouches[0].pageX;
    if (currentPosition < this.touchPosition - distance) {
      this.touchPosition = currentPosition;
      this.navSlide(true);
    } else if (currentPosition > this.touchPosition + distance) {
      this.touchPosition = currentPosition;
      this.navSlide(false);
    }
  }

  /**
   * @function navSlide
   * @param {Boolean} [dirUp] dirUp Direction: up (true) or down (false)
   * @description Go to next or previous slide
   */
  navSlide(dirUp = true) {
    let index = this.getIndex(this.activeSlide, this.total, dirUp);
    this.gotoSlide(index, dirUp);
  }

  /**
   * @function reorderSlides
   * @description Recalculate flex-order, set aria-hidden
   */
  reorderSlides() {
    this.slides.forEach((slide, index) => {
      let order;
      slide.classList.toggle(
        this.settings.clsActive,
        index === this.activeSlide
      );
      slide.toggleAttribute('aria-hidden', index !== this.activeSlide);

      if (index < this.reference) {
        order = this.total - (this.reference - index) + 1;
      } else if (index > this.reference) {
        order = index - this.reference;
      } else {
        order = 0;
      }
      slide.style.order = order + 1;
    });
  }

  /**
   * @function setActiveDot
   * @description Set active dot, remove active from previous
   */
  setActiveDot() {
    this.navigation.children[this.previousSlide].classList.remove(
      this.settings.clsNavButtonActive
    );
    this.navigation.children[this.activeSlide].classList.add(
      this.settings.clsNavButtonActive
    );
  }

  /**
   * @function setActiveThumbnail
   * @description Set active dot, remove active from previous
   */
  setActiveThumbnail() {
    this.thumbnails[this.previousSlide].classList.remove(
      this.settings.clsThumbnailActive
    );
    this.thumbnails[this.activeSlide].classList.add(
      this.settings.clsThumbnailActive
    );
  }

  /**
   * @function setLiveRegion
   * @description Updates aria-live-area
   */
  setLiveRegion() {
    this.live.innerText = `${this.activeSlide + 1} / ${this.total + 1}`;
  }

  /**
   * @function setReference
   * @param {Number} [slide]
   * @description Set reference slide (previous or last)
   */
  setReference(slide = this.activeSlide) {
    this.reference = slide - 1 < 0 ? this.total : slide - 1;
    this.slides[this.reference].style.order = 1;
  }

  /**
   * @function stringToType
   * @param {Object} obj
   * @description Convert data-attribute value to type
   */
  stringToType(obj) {
    const object = Object.assign({}, obj);
    Object.keys(object).forEach(key => {
      if (object[key].charAt(0) === ':') {
        object[key] = JSON.parse(object[key].slice(1));
      }
    });
    return object;
  }

  /**
   * @function toggleZoom
   * @param {Boolean} [open]
   * @description Zoom in / out (Open/close overlay)
   */
  toggleZoom(open = true) {
    // eslint-disable-next-line
    console.log(open);
  }

  /**
   * @function updateItemsPerPage
   * @description Updates items per page on matchMedia
   */
  updateItemsPerPage() {
    this.breakpoints.forEach((breakpoint, index) => {
      if (breakpoint.matches) {
        this.itemsPerPage = this.settings.pageItems[index];
      }
    });
    this.totalPages = Math.ceil(this.total / this.itemsPerPage);
    this.page = Math.ceil((this.activeSlide + 1) / this.itemsPerPage);
    this.gotoPage();
  }
}
