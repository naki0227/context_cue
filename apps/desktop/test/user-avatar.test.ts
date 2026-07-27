import { render } from '@testing-library/react';
import { createElement } from 'react';
import { UserAvatar } from '@/features/dashboard/components/user-avatar';
import {
  MAX_AVATAR_INPUT_BYTES,
  normalizeAvatarDataUrl,
  validateAvatarFile,
} from '@/features/dashboard/lib/user-avatar';

describe('user avatar', () => {
  it('accepts local raster images within the size limit', () => {
    expect(
      validateAvatarFile({
        size: MAX_AVATAR_INPUT_BYTES,
        type: 'image/png',
      }),
    ).toBeNull();
  });

  it('rejects active or unsupported image formats', () => {
    expect(
      validateAvatarFile({
        size: 1_000,
        type: 'image/svg+xml',
      }),
    ).toContain('PNG、JPEG、WebP');
    expect(normalizeAvatarDataUrl('data:image/svg+xml;base64,YQ==')).toBe('');
  });

  it('rejects oversized source images', () => {
    expect(
      validateAvatarFile({
        size: MAX_AVATAR_INPUT_BYTES + 1,
        type: 'image/jpeg',
      }),
    ).toBe('画像は5MB以下にしてください。');
  });

  it('keeps only safe persisted image data URLs', () => {
    expect(normalizeAvatarDataUrl('data:image/webp;base64,YQ==')).toBe(
      'data:image/webp;base64,YQ==',
    );
    expect(normalizeAvatarDataUrl('https://example.com/avatar.png')).toBe('');
  });

  it('uses a silhouette until the user sets a safe picture', () => {
    const { container, rerender } = render(createElement(UserAvatar));

    expect(container.querySelector('.user-avatar-silhouette')).not.toBeNull();
    expect(container.querySelector('img')).toBeNull();

    rerender(
      createElement(UserAvatar, {
        imageDataUrl: 'data:image/png;base64,YQ==',
      }),
    );

    expect(container.querySelector('.user-avatar-silhouette')).toBeNull();
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      'data:image/png;base64,YQ==',
    );
  });
});
