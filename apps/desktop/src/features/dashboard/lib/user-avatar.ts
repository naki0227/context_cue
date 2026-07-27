export const AVATAR_OUTPUT_SIZE = 256;
export const MAX_AVATAR_INPUT_BYTES = 5 * 1024 * 1024;
export const MAX_AVATAR_DATA_URL_LENGTH = 800_000;

const acceptedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const safeAvatarPattern =
  /^data:image\/(?:jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/;

export function validateAvatarFile(file: Pick<File, 'size' | 'type'>) {
  if (!acceptedTypes.has(file.type)) {
    return 'PNG、JPEG、WebP形式の画像を選択してください。';
  }

  if (file.size > MAX_AVATAR_INPUT_BYTES) {
    return '画像は5MB以下にしてください。';
  }

  return null;
}

export function normalizeAvatarDataUrl(value: string | undefined) {
  const normalized = value?.trim() ?? '';

  if (
    normalized.length > MAX_AVATAR_DATA_URL_LENGTH ||
    !safeAvatarPattern.test(normalized)
  ) {
    return '';
  }

  return normalized;
}

export async function prepareAvatarImage(file: File) {
  const validationError = validateAvatarFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(imageUrl);
    const canvas = document.createElement('canvas');
    canvas.width = AVATAR_OUTPUT_SIZE;
    canvas.height = AVATAR_OUTPUT_SIZE;
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('画像を処理できませんでした。');
    }

    const cropSize = Math.min(image.naturalWidth, image.naturalHeight);
    const sourceX = (image.naturalWidth - cropSize) / 2;
    const sourceY = (image.naturalHeight - cropSize) / 2;

    context.fillStyle = '#e8eef8';
    context.fillRect(0, 0, AVATAR_OUTPUT_SIZE, AVATAR_OUTPUT_SIZE);
    context.drawImage(
      image,
      sourceX,
      sourceY,
      cropSize,
      cropSize,
      0,
      0,
      AVATAR_OUTPUT_SIZE,
      AVATAR_OUTPUT_SIZE,
    );

    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    const normalized = normalizeAvatarDataUrl(dataUrl);
    if (!normalized) {
      throw new Error('画像を安全な形式で保存できませんでした。');
    }

    return normalized;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(
        new Error('画像を読み込めませんでした。別の画像を選択してください。'),
      );
    image.src = source;
  });
}
