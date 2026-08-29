import { describe, it, expect } from 'vitest';
import { randomExportFilename } from './exportPng';

describe('randomExportFilename', () => {
  it('produces an image_<n>.png filename by default', () => {
    for (let i = 0; i < 50; i++) {
      expect(randomExportFilename()).toMatch(/^image_\d+\.png$/);
    }
  });

  it('respects a custom extension', () => {
    expect(randomExportFilename('jpg')).toMatch(/^image_\d+\.jpg$/);
  });
});
