import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const tauriRoot = resolve(process.cwd(), 'src-tauri');
const config = JSON.parse(
  readFileSync(resolve(tauriRoot, 'tauri.conf.json'), 'utf8'),
) as {
  bundle: {
    icon: string[];
  };
};

function readPngSize(path: string) {
  const file = readFileSync(path);

  return {
    width: file.readUInt32BE(16),
    height: file.readUInt32BE(20),
  };
}

describe('application icon bundle', () => {
  it('registers platform icons that exist', () => {
    expect(config.bundle.icon).toEqual([
      'icons/32x32.png',
      'icons/128x128.png',
      'icons/128x128@2x.png',
      'icons/icon.icns',
      'icons/icon.ico',
    ]);

    for (const icon of config.bundle.icon) {
      expect(existsSync(resolve(tauriRoot, icon))).toBe(true);
    }
  });

  it.each([
    ['icons/32x32.png', 32],
    ['icons/128x128.png', 128],
    ['icons/128x128@2x.png', 256],
  ])('%s has the expected square dimensions', (icon, size) => {
    expect(readPngSize(resolve(tauriRoot, icon))).toEqual({
      width: size,
      height: size,
    });
  });
});
