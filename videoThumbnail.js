/**
 * @function videoThumbnail
 * @param {String} src
 * @param {String} noimage Fallback-image, if none is found
 * @description Returns/Creates thumbnail from various video-sources: https://gist.github.com/atwong/49b9e7d911dca0663e23c50c60f28784
 */
export default function videoThumbnail(src, title, noimage) {
  function extractFrame(video, canvas, offset) {
    return new Promise(resolve => {
      video.onseeked = () => {
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve({ src: canvas.toDataURL(), alt: title });
      };
      video.currentTime = offset;
    });
  }

  async function vimeo(videoID) {
    const json = await (await fetch(
      `//vimeo.com/api/v2/video/${videoID}.json`
    )).json();
    return json[0].thumbnail_medium || noimage;
  }

  return new Promise(async resolve => {
    if (src.includes('mp4')) {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      video.onloadedmetadata = () => {
        // if (video.duration) {
        extractFrame(video, canvas, 1).then(response => {
          resolve(response);
        });
        // }
      };
      video.src = src;
    } else if (src.includes('vimeo')) {
      const response_1 = await vimeo(src.split('/').pop());
      resolve({ src: response_1, alt: title });
    } else if (src.includes('youtube')) {
      const videoID = src.match(/youtube\.com.*(\?v=|\/embed\/)(.{11})/).pop();
      const videoSrc = videoID
        ? `//img.youtube.com/vi/${videoID}/0.jpg`
        : noimage;
      resolve({ src: videoSrc, alt: title });
    }
  });
}
