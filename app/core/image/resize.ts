/**
 * 업로드한 사진을 data URL 로 바꾼다.
 *
 * 원본 그대로 localStorage 에 넣으면 5MB 한도를 금방 넘기므로
 * canvas 로 긴 변 1024px, JPEG 품질 0.8 로 줄여 저장한다.
 */

const MAX_EDGE = 1024;
const QUALITY = 0.8;

export async function fileToResizedDataUrl(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    const { width, height } = fitWithin(image.width, image.height, MAX_EDGE);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("이미지를 처리할 수 없음");

    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", QUALITY);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("이미지를 읽을 수 없음"));
    image.src = src;
  });
}

function fitWithin(
  width: number,
  height: number,
  maxEdge: number,
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxEdge) return { width, height };
  const ratio = maxEdge / longest;
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}
