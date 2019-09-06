# Carousel TODO 

## Build Slides
Accept <li> items / Correct markup
Accept OneBlocks or other childNodes - Add nessecary wrappers
Accept array as data-attribute / js array
Accept url, fetch content

## Generate
Navigation Arrows
Play/Pause-button
Slide indicators

## Thumbnails
Thumbnails (sync with active slide)
Thumbnail page-navigation (sync with active slide)
Hide thumbnail page-naviigation if there's room for all thumbs in current view

Transition Types

DEFAULT STRUCTURE:
[
	{
		"description": "Landscape",
		"src": "images/01.jpeg",
		"thumbnail": "images/01.jpeg",
		"title": "1945",
		"type": "image"
	},
	{
		"description": "Landscape",
		"src": "https://player.vimeo.com/video/169982685",
		"title": "1954",
		"videoType": "video"
	},
	{
		"description": "Landscape",
		"src": "https://www.youtube.com/embed/9m_K2Yg7wGQ",
		"title": "1945",
		"type": "video",
		"videoType": "2"
	},
	{
		"description": "Landscape",
		"src": "/video/my-alcon-consumer-hero.mp4#t=0.1",
		"title": "1945",
		"type": "video",
		"videoType": "1"
	}
]

MINIMAL STRUCTURE, ONLY IMAGES:
[{"src":"images/01.jpeg"},{"src":"images/02.jpeg"},{"src":"images/03.jpeg"}]