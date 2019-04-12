/**
 * Carousel module.
 * @module carousel.mjs
 * @version 0.9.22
 * @author Mads Stoumann
 * @description Carousel-control
 */

export default class Carousel {
  constructor(wrapper, settings) {
    this.settings = Object.assign(
      {
        autoplay: false,
        autoplayDelay: 3000,
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
        infinity: true,
        labelNext: 'Next',
        labelPlay: 'Play/Pause',
        labelPrev: 'Previous',
        navInline: true,
        showThumbnails: false,
        slides: [],
        thumbnails: [],
        touchDistance: 100
      },
      settings
    );

    /* Create / Reference elements */
    this.wrapper = wrapper;
    this.carousel = this.wrapper.querySelector(`.${this.settings.clsCarousel}`);
    //`<ul class="${this.settings.clsCarousel}" itemscope itemtype="http://schema.org/ItemList">`;
      //TODO: Create carousel if not exists: 
    this.carousel.classList.add(this.settings.clsAnimate);
    
    this.headings = wrapper.querySelectorAll(`.${this.settings.clsItemHeading}`);

    // TODO: Create inner if not exists
    this.inner= this.wrapper.querySelector(`.${this.settings.clsInner}`);

    this.previous = this.h(
      'button',
      { class: this.settings.clsPrev, 'aria-label': this.settings.labelPrev, 'rel': 'next' }
    );
    this.inner.appendChild(this.previous);

    this.play = this.h(
      'button',
      { class: this.settings.clsPlay, 'aria-label': this.settings.labelPlay }
    );
    this.inner.appendChild(this.play);

    this.next = this.h(
      'button',
      { class: this.settings.clsNext, 'aria-label': this.settings.labelNext, 'rel': 'prev' }
    );
    this.inner.appendChild(this.next)

    if (this.settings.slides.length) {
      const html = this.createSlides(this.settings.slides);
      // eslint-disable-next-line
      console.log(html);
      
    }

    this.slides = Array.from(this.carousel.children);

    /* Add thumbnails */
    if (this.settings.showThumbnails) {
      this.thumbnails = this.settings.thumbnails.length ? this.settings.thumbnails : this.slides.map(element => element.querySelector('img'));
      this.createThumbnails();
    }

    /* Set state */
    this.activeSlide = 0;
    this.interval = '';
    this.isPlaying = this.settings.autoplay;
    this.previousSlide = 0;
    this.total = this.slides.length - 1;
    this.touchPosition = 0;

    /* Set live-region */
    this.live = this.h(
      'span',
      { class: this.settings.clsLive, 'aria-atomic': true, 'aria-live': true }
    );
    this.wrapper.appendChild(this.live)

    /* Add navigation */
    this.navigationWrapper = this.h('div', {
      class: this.settings.clsNavWrapper
    });

    this.navigation = this.h(
      'nav',
      {
        class: this.settings.clsNav,
        itemscope: 'itemscope',
        itemtype: 'http://schema.org/SiteNavigationElement'
      }
    );
    this.navigationWrapper.appendChild(this.navigation);

    this.navigation.innerHTML = this.slides
      .map(
        (item, index) =>
          `<div class="${this.settings.clsNavItem}"><button class="${
            this.settings.clsNavButton
          }" aria-label="${
            this.headings[index] ? this.headings[index].innerText:''
          }" data-slide="${index}" itemprop="name"></button></div>`
      )
      .join('');

    if (this.settings.navInline) {
      this.inner.appendChild(this.navigationWrapper);
    } else {
      this.wrapper.appendChild(this.navigationWrapper);
    }

    /* Add meta:position, add aria-hidden to non-active slides */
    this.slides.forEach((slide, index) => {
      this.h('meta', { itemprop: 'position', content: index + 1 }, slide);
      if (index !== this.activeSlide) {
        slide.setAttribute('aria-hidden', true);
      }
    });

    /* Add eventListeners */
    this.navigation.addEventListener('click', event => {
      const slide = event.target.dataset.slide;
      if (slide) {
        this.gotoSlide(slide);
      }
    });
    this.next.addEventListener('click', () => this.navSlide(true));
    this.play.addEventListener('click', () => this.autoPlay(!this.isPlaying));
    this.previous.addEventListener('click', () => this.navSlide(false));
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

    /* Set initial state */
    this.autoPlay(this.isPlaying);
    this.setLiveRegion();
    this.setNavigationDots();
    this.setReference();

    // eslint-disable-next-line
    console.log(this);
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
  * @function createSlides
  * @description Create slides from json
  */
  createSlides(json) {
    return json.forEach((slide, index) => `
    <li class="${this.settings.clsItem}" itemprop="itemListElement" itemscope itemtype="http://schema.org/ListItem">
      <figure class="${this.settings.clsContent}" itemprop="associatedMedia" itemscope itemtype="${slide.type === 'video' ? 'http://schema.org/VideoObject' : 'http://schema.org/ImageObject'}">
      ${slide.type === 'video' ? `
        <meta itemprop="description" content="${slide.description}">
        <meta itemprop="name" content="${slide.title}" />
        <meta itemprop="thumbnailUrl" content="${slide.thumbnail}" />
        <meta itemprop="uploadDate" content="${slide.uploadDate}" />
        <video v-if="videoLocal(image.src)" class="imagegallery__video" tabindex="-1" controls><source src="${slide.src}" :type="videoType(image.src)"></video>
        <iframe v-else :src="image.src" class="imagegallery__iframe" frameborder="0" tabindex="-1" allow="autoplay; encrypted-media" allowfullscreen></iframe>
      `: `
        <img src="${slide.src}" alt="${slide.title}" class="${this.settings.clsItemImage}" loading="${index === 0 ? 'eager':'lazy'}" />
      `}
        <span class="${this.settings.clsItemHeading}" itemprop="name">${slide.title}</span>
        <figcaption class="${this.settings.clsItemText}" itemprop="description">${slide.description}</figcaption>
      </figure>
      <a href="${slide.url}" class="${this.settings.clsItemLink}" itemprop="url" tabindex="-1">${slide.link}</a>
    </li>
    `).join('');
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
    
    this.thumbnailPrev = this.h('button', {
      class: this.settings.clsThumbnailPrev,
      'aria-label': this.settings.labelPrev
    });

    const thumbnailInner = this.h('div', {
      class: this.settings.clsThumbnailInner
    });

    thumbnailInner.innerHTML = this.thumbnails.map((image, index) => `
    <figure class="${this.settings.clsThumbnailItem}" data-slide="${index}">
      <img src="${image.src}" alt="${image.alt}" class="${this.settings.clsThumbnailImage}" loading="lazy" />
    </figure>`).join('')

    const thumbnailOuter = this.h('div', {
      class: this.settings.clsThumbnailOuter
    });

    const thumbnailWrapper = this.h('nav', {
      class: this.settings.clsThumbnailWrapper
    });

    // thumbnailOuter.appendChild(thumbnailInner);
    thumbnailWrapper.appendChild(this.thumbnailPrev);
    thumbnailWrapper.appendChild(thumbnailOuter);
    thumbnailWrapper.appendChild(this.thumbnailNext);
    this.wrapper.appendChild(thumbnailWrapper);
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
   * @function gotoSlide
   * @param {Number} slideIndex
   * @description Go to specific slide
   */
  gotoSlide(slideIndex = -1) {
    /* Determine slide-direction: Only apply if NOT infinity: true */
    //if (!this.settings.infinity) {
      this.carousel.classList.toggle(
        this.settings.clsReverse,
        slideIndex < this.activeSlide
      );
    //}
    
    this.previousSlide = this.activeSlide;

    if (slideIndex > -1) {
      this.activeSlide = slideIndex - 0;
    }

    this.setReference();
    this.reorderSlides();
    this.setNavigationDots();
    this.setLiveRegion();

    /* Animate: Remove class, add it again after 50ms */
    this.carousel.classList.remove(this.settings.clsAnimate);
    setTimeout(() => {
      this.carousel.classList.add(this.settings.clsAnimate);
    }, 50);
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
   * @param {number} distance Distance to swipe before callback-function is invoked
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
    this.gotoSlide(index);
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
   * @function scrollToPage
   * @description Scroll to a specific "page" within timeline or thumbnails
   */
  scrollToPage(index, items, wrapper) {
    const page = Math.ceil((index + 1) / items);
    // const viewportWidth = Math.max(wrapper.offsetWidth || document.documentElement.clientWidth, window.innerWidth || 0);
    wrapper.scrollLeft = (page - 1) * wrapper.offsetWidth;
  }

  /**
   * @function setLiveRegion
   * @description Updates aria-live-area
   */
  setLiveRegion() {
    this.live.innerText = `${this.activeSlide + 1} / ${this.total + 1}`;
  }

  /**
   * @function setNavigattionDots
   * @description Set active dot, remove active from previous
   */
  setNavigationDots() {
    this.navigation.children[this.previousSlide].classList.remove(
      this.settings.clsNavButtonActive
    );
    this.navigation.children[this.activeSlide].classList.add(
      this.settings.clsNavButtonActive
    );
  }

  /**
   * @function setReference
   * @description Set reference slide (previous or last)
   */
  setReference(slide = this.activeSlide) {
    this.reference = slide - 1 < 0 ? this.total : slide - 1;
    this.slides[this.reference].style.order = 1;
  }
}
