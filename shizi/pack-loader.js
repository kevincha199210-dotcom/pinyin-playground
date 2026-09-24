const lessonPackPromises = new Map();
const lessonAssetUrls = new Map();
const tarDecoder = new TextDecoder();

function assetUrl(path) {
  return lessonAssetUrls.get(path) || path;
}

function ensurePack(bookId, lesson) {
  const key = `${bookId}-${String(lesson).padStart(3, '0')}`;
  if (!lessonPackPromises.has(key)) {
    const task = (async () => {
      const response = await fetch(`packs/${key}.tar`);
      if (!response.ok) throw new Error(`关卡图片加载失败：${response.status}`);
      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let offset = 0;
      let count = 0;
      while (offset + 512 <= bytes.length) {
        const header = bytes.subarray(offset, offset + 512);
        const name = tarDecoder.decode(header.subarray(0, 100)).split('\0')[0];
        if (!name) break;
        const rawSize = tarDecoder.decode(header.subarray(124, 136)).split('\0')[0].trim();
        const size = parseInt(rawSize, 8);
        if (!Number.isFinite(size) || size < 0) throw new Error('关卡图片包格式错误');
        const start = offset + 512;
        if (start + size > bytes.length) throw new Error('关卡图片包不完整');
        const blob = new Blob([buffer.slice(start, start + size)], { type: 'image/webp' });
        lessonAssetUrls.set(name, URL.createObjectURL(blob));
        offset = start + Math.ceil(size / 512) * 512;
        count += 1;
      }
      if (count !== 24) throw new Error(`关卡图片不完整：${count}/24`);
    })().catch(error => { lessonPackPromises.delete(key); throw error; });
    lessonPackPromises.set(key, task);
  }
  return lessonPackPromises.get(key);
}
