import videoThumbnail from './videoThumbnail.js';

/**
 * Carousel module.
 * @module carousel.mjs
 * @version 0.9.30
 * @summary 06-09-2019
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
				renderIndicatorsInline: true,
				renderNavInline: true,
				renderThumbnails: false,
				pageItems: [2, 3, 4, 6, 8],
				slides: [],
				thumbnails: [],
				touchDistance: 100,

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
				clsItemVideo: 'c-carousel__item-video',
				clsIndicator: 'c-carousel__indicator',
				clsIndicatorItem: 'c-carousel__indicator-item',
				clsIndicatorButton: 'c-carousel__indicator-dot',
				clsIndicatorButtonActive: 'c-carousel__indicator-dot--active',
				clsIndicatorWrapper: 'c-carousel__indicator-wrapper',
				clsLive: 'u-visually-hidden c-carousel__live',
				clsNav: 'c-carousel__nav',
				clsNavNext: 'c-carousel__nav-next',
				clsNavPause: 'c-carousel__nav-pause',
				clsNavPlay: 'c-carousel__nav-play',
				clsNavPrev: 'c-carousel__nav-prev',
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

				labelNext: 'Next',
				labelPlay: 'Play/Pause',
				labelPrev: 'Previous'
			},
			this.stringToType(settings)
		);
		this.init(wrapper);
	}

	/**
	 * @function addAirplaySupport
	 * @description Adds support for Apple airplay for videos
	 * TODO! Work-in-progress
	 */
	addAirplaySupport() {
		//<button data-js="airPlayButton" hidden disabled>AirPlay</button>
		if (window.WebKitPlaybackTargetAvailabilityEvent) {
			const videos = this.wrapper.querySelectorAll('video');
			videos.forEach(video => {
				const button = document.createElement('button');
				button.classList.add('c-carousel__nav--airplay');
				video.parentNode.insertBefore(button, video.nextSibling);
				// eslint-disable-next-line
				console.log(button);
				video.addEventListener(
					'webkitplaybacktargetavailabilitychanged',
					function(event) {
						switch (event.availability) {
							case 'available':
								button.hidden = false;
								button.disabled = false;
								break;
							case 'not-available':
								//button.hidden = true;
								//button.disabled = true;
								break;
							default:
								break;
						}
					}
				);
				video.addEventListener(
					'webkitcurrentplaybacktargetiswirelesschanged',
					function() {
						//updateAirPlayButtonWirelessStyle();
						//updatePageDimmerForWirelessPlayback();
					}
				);
				if (window.WebKitPlaybackTargetAvailabilityEvent) {
					button.addEventListener('click', function() {
						video.webkitShowPlaybackTargetPicker();
					});
				}
			});
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
	 * @description Create navigation-elements: indication, next, play, prev
	 */
	createNavigation() {
		/* Create indicators */
		this.indicators = this.h('nav', { class: this.settings.clsIndicator, itemscope: 'itemscope', itemtype: 'http://schema.org/SiteNavigationElement'});
		this.indicators.innerHTML = this.slides.map((item, index) =>
		`<div class="${this.settings.clsIndicatorItem}">
			<button class="${this.settings.clsIndicatorButton}" aria-label="${this.headings[index] ? this.headings[index].innerText : ''}" data-slide="${index}" itemprop="name"></button>
		</div>`).join('');

		this.indicators.addEventListener('click', event => {
			const slide = event.target.dataset.slide;
			if (slide) {
				this.gotoSlide(slide - 0);
			}
		});
		this.indicatorsWrapper = this.h('div', {
			class: this.settings.clsIndicatorWrapper
		});
		this.indicatorsWrapper.appendChild(this.indicators);

		if (this.settings.renderIndicatorsInline) {
			this.inner.appendChild(this.indicatorsWrapper);
		} else {
			this.wrapper.appendChild(this.indicatorsWrapper);
		}

		/* Create navigation: next, prev, play/pause */
		const previous = this.h('button', { class: this.settings.clsNavPrev, 'aria-label': this.settings.labelPrev, rel: 'next' });
		previous.addEventListener('click', () => this.navSlide(false));

		this.play = this.h('button', { class: this.settings.clsNavPlay, 'aria-label': this.settings.labelPlay });
		this.play.addEventListener('click', () => this.autoPlay(!this.isPlaying));

		const next = this.h('button', {	class: this.settings.clsNavNext, 'aria-label': this.settings.labelNext, rel: 'prev' });
		next.addEventListener('click', () => this.navSlide(true));

		if (this.settings.renderNavInline) {
			this.inner.appendChild(previous);
			this.inner.appendChild(this.play);
			this.inner.appendChild(next);
		}
		else {
			const navigation = this.h('nav', { class: this.settings.clsNav, itemscope: 'itemscope', itemtype: 'http://schema.org/SiteNavigationElement'});
			navigation.appendChild(previous);
			navigation.appendChild(this.play);
			navigation.appendChild(next);
			this.wrapper.appendChild(navigation)
		}
	}

	/**
	 * @function createSlides
	 * @param {Array} json
	 * @description Create slides from simple (images only) or advanced json (see readme.md)
	 */
	createSlides(json) {
		return json.map((slide, index) => `
		<li class="${this.settings.clsItem}" itemprop="itemListElement" itemscope itemtype="http://schema.org/ListItem">
			<figure class="${this.settings.clsItemContent}" itemprop="associatedMedia" itemscope itemtype="${slide.type && slide.type === 'video' ? 'http://schema.org/VideoObject' : 'http://schema.org/ImageObject'}">
			${slide.type && slide.type === 'video' ? `
				${slide.videoType === '1' ? 
				`<video class="${this.settings.clsItemVideo}" tabindex="-1" controls ${slide.thumbnail ? `poster="${slide.thumbnail}"` : ''} preload="metadata"><source src="${slide.src}" type="video/${slide.videoType || 'mp4'}"></source></video>` :
				`<iframe src="${slide.src}" class="${this.settings.clsItemVideo}" frameborder="0" tabindex="-1" loading="lazy" allow="autoplay; encrypted-media" allowfullscreen></iframe>`
				}`:
				`<img src="${slide.src}" alt="${slide.title}" class="${this.settings.clsItemImage}" loading="${index === 0 ? 'eager' : 'lazy'}" />`
			}
			${this.settings.clsItemHeading ? `<span class="${this.settings.clsItemHeading}" itemprop="name">${slide.title}</span>` : ''}
			${this.settings.clsItemText ? `<figcaption class="${this.settings.clsItemText}" itemprop="description">${slide.description}</figcaption>` : ''}
			</figure>
			${slide.url	? `<a href="${slide.url}" class="${this.settings.clsItemLink}" itemprop="url" tabindex="-1">${slide.title}</a>` : ''}
		</li>`).join('');
	}

	/**
	 * @function createSlideWrappers
	 * @param {Array} arr
	 * @description Create wrappers for slide-items in custom formats
	 */
	createSlideWrappers(arr) {
		return arr.map((slide) => `<li class="${this.settings.clsItem}" itemprop="itemListElement" itemscope itemtype="http://schema.org/ListItem">${slide.outerHTML}</li>`).join('')
	}

	/**
	 * @function createThumbnails
	 * @description Create thumbnails and thumbnail-navigation
	 */
	createThumbnails() {
		this.thumbnailNext = this.h('button', { class: this.settings.clsThumbnailNext, 'aria-label': this.settings.labelNext });
		this.thumbnailNext.addEventListener('click', () => { this.gotoPage(true);	});

		this.thumbnailPrev = this.h('button', { class: this.settings.clsThumbnailPrev, 'aria-label': this.settings.labelPrev });
		this.thumbnailPrev.addEventListener('click', () => { this.gotoPage(false); });

		this.thumbnailInner = this.h('div', { class: this.settings.clsThumbnailInner });
		this.thumbnailInner.innerHTML = this.thumbnails.map((image, index) => `
		<figure class="${this.settings.clsThumbnailItem}">
			<img src="${image.src}" alt="${image.alt}" class="${this.settings.clsThumbnailImage}" data-slide="${index}" loading="lazy" />
		</figure>`).join('');

		const thumbnailOuter = this.h('div', { class: this.settings.clsThumbnailOuter	});
		const thumbnailWrapper = this.h('nav', { class: this.settings.clsThumbnailWrapper	});

		thumbnailOuter.appendChild(this.thumbnailInner);
		thumbnailWrapper.appendChild(this.thumbnailPrev);
		thumbnailWrapper.appendChild(thumbnailOuter);
		thumbnailWrapper.appendChild(this.thumbnailNext);
		this.wrapper.appendChild(thumbnailWrapper);

		this.thumbnails = this.thumbnailInner.querySelectorAll(`.${this.settings.clsThumbnailItem}`);

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
			this.page = page > this.totalPages ? 1 : page < 1 ? this.totalPages : page;
		}
		this.thumbnailInner.style.transform = `translateZ(0) translateX(${-100 * (this.page - 1)}%)`;
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

		if (this.settings.renderThumbnails) {
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
	 * @function init
	 * @description Set initial elements, create slides
	 */
	init(wrapper) {
		let json, slides;

		/* Set defaults */
		this.activeSlide = 0;
		this.interval = '';
		this.isPlaying = this.settings.autoplay;
		this.itemsPerPage = 4;
		this.page = 1;
		this.previousSlide = 0;
		this.total = 1;
		this.totalPages = 1;
		this.touchPosition = 0;

		/* Set outer wrapper, add eventListeners */
		this.wrapper = wrapper;
		this.wrapper.addEventListener('keydown', event => this.handleKeys(event));
		this.wrapper.addEventListener('touchmove', event => this.handleTouch(event, this.settings.touchDistance), { passive: true });
		this.wrapper.addEventListener('touchstart', event => { this.touchPosition = event.changedTouches[0].pageX; }, { passive: true });
		/* TODO: Mouse Navigation? */

		/* Get headings, if exists, otherwise set to empty array */
		this.headings = wrapper.querySelectorAll(`.${this.settings.clsItemHeading}`) || [];

		/* Set inner wrapper, create if not exists */
		this.inner = this.wrapper.querySelector(`.${this.settings.clsInner}`);
		if (!this.inner) {
			/* Markup not in correct structure, create slides from direct childNodes or this.settings.slides-array */
			if (this.settings.slides.length) {
				json = typeof this.settings.slides === 'string' ? JSON.parse(this.settings.slides) : this.settings.slides;
			}
			slides = json ? this.createSlides(json) : this.createSlideWrappers(Array.from(this.wrapper.children));
			this.wrapper.innerHTML = '';
			this.inner = this.h('div', { class: this.settings.clsInner });
			this.wrapper.appendChild(this.inner);
		}

		/* Set carousel (list-wrapper), create if not exists */
		this.carousel = this.wrapper.querySelector(`.${this.settings.clsCarousel}`);
		if (!this.carousel) {
			this.carousel = this.h('ul', {
				class: this.settings.clsCarousel,
				itemscope: 'itemscope',
				itemtype: 'http://schema.org/ItemList'
			});
			this.inner.appendChild(this.carousel);
		}
		if (slides) { this.carousel.innerHTML = slides; }
		this.carousel.classList.add(this.settings.clsAnimate);

		/* Create live-region for A11y-feedback */
		this.live = this.h('span', {
			class: this.settings.clsLive,
			'aria-atomic': true,
			'aria-live': true
		});
		this.wrapper.appendChild(this.live);

		this.setSlides();
		this.createNavigation();

		/* Create thumbnails */
		if (this.settings.renderThumbnails) {
			this.thumbnails = this.settings.thumbnails.length
				? this.settings.thumbnails
				: this.slides.map(element =>
						element.querySelector('img')
					); /* TODO: Get thumbnail if markup contains <video> or <iframe> */

			/* Create match-media-listeners for breakpoint-changes */
			if (this.thumbnails.length) {
				this.breakpoints = this.settings.breakpoints.map((breakpoint, index) => {
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

		this.addAirplaySupport();

		/* Init */
		this.autoPlay(this.isPlaying);
		this.gotoSlide(this.activeSlide, true, false);
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
		this.indicators.children[this.previousSlide].classList.remove(
			this.settings.clsIndicatorButtonActive
		);
		this.indicators.children[this.activeSlide].classList.add(
			this.settings.clsIndicatorButtonActive
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
	 * @function setSlides
	 * @description Inits slides, set attributes etc.
	 */
	setSlides() {
	this.slides = Array.from(this.carousel.children);
		/* Add meta:position, add aria-hidden to non-active slides */
		this.slides.forEach((slide, index) => {
			this.h('meta', { itemprop: 'position', content: index + 1 }, slide);
			if (index !== this.activeSlide) {
				slide.setAttribute('aria-hidden', true);
			}
		});
		this.total = this.slides.length - 1;
	}

	/**
	 * @function setVideoThumbnails
	 * @description Creates array of thumbnails from slides-json, when init from url or json
	 */
	setVideoThumbnails(json) {
		/* TODO: videoThumbnail should accept an object with alt: title etc. */
		const promises = json.map(item => {
			return item.type === 'video' && !item.thumbnail
				? videoThumbnail(item.src, item.title)
				: { src: item.thumbnail, alt: item.title };
		});
		Promise.all(promises).then(results => {
			this.settings.thumbnails = results;
			
		});
	}

	/**
	 * @function stringToType
	 * @param {Object} obj
	 * @description Convert data-attribute value to type-specific value
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
	 * @function updateItemsPerPage
	 * @description Updates items per page on matchMedia-match
	 */
	updateItemsPerPage() {
		this.breakpoints.forEach((breakpoint, index) => {
			if (breakpoint.matches) {
				this.itemsPerPage = this.settings.pageItems[index];
			}
		});
		this.totalPages = Math.ceil(this.total / this.itemsPerPage);
		this.page = Math.ceil((this.activeSlide + 1) / this.itemsPerPage);
		this.thumbnailNext.hidden = this.totalPages === 1;
		this.thumbnailPrev.hidden = this.totalPages === 1;
		this.gotoPage();
	}
}
