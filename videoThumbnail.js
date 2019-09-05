/**
 * @function videoThumbnail
 * @param {String} src
 * @param {String} noimage Fallback-image, if none is found
 * @description Returns/Creates thumbnail from various video-sources: https://gist.github.com/atwong/49b9e7d911dca0663e23c50c60f28784
 */
export default function videoThumbnail(src, title, noimage = 'images/01.jpeg') {
  function extractFrame(video) {
    const canvas = document.createElement('canvas');
    return new Promise(resolve => {
      video.onseeked = () => {
        const ctx = canvas.getContext('2d');
        /* TODO: maxWidth / height */
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL());
      };
      video.currentTime = 0.1;
    });
  }

  async function vimeo() {
    try {
      const json = await (await fetch(
        `//vimeo.com/api/oembed.json?url=${encodeURIComponent(src)}`
      )).json();
      return json.thumbnail_url;
    } catch (err) {
      return noimage;
    }
  }

  return new Promise(async resolve => {
    if (src.includes('mp4')) {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');

      video.addEventListener('seeked', () => {
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        console.error(video.currentTime);
        resolve(canvas.toDataURL());
        // resolve({ src: 'images/01.jpeg', alt: title });
      });

      // video.onloadedmetadata = () => {
      //   extractFrame(video).then(response => {
      //     resolve({ src: response, alt: title });
      //   });
      // };
      video.src = src;
    } else if (src.includes('vimeo')) {
      const response = await vimeo();
      resolve({ src: response, alt: title });
    } else if (src.includes('youtube')) {
      const videoID = src.match(/youtube\.com.*(\?v=|\/embed\/)(.{11})/).pop();
      const response = videoID
        ? `//img.youtube.com/vi/${videoID}/0.jpg`
        : noimage;
      resolve({ src: response, alt: title });
    }
  });
}
