// Ports Artwork.export()'s "image_" + (int) Rnd.random(999999) + ".jpg"
// naming, defaulting to .png since export/render() write PNG data here
// (no filesystem -- canvas.toBlob() + an object-URL download link instead
// of Java's PGraphics.save(path) to disk).
export function randomExportFilename(extension = 'png'): string {
  const n = Math.floor(Math.random() * 999999);
  return `image_${n}.${extension}`;
}

export function downloadCanvasAsPng(canvas: HTMLCanvasElement, filename: string): void {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }, 'image/png');
}
