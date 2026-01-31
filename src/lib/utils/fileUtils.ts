export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function isValidImageType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
}

export function isValidMediaType(file: File): boolean {
  return isValidImageType(file);
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image dimensions'));
    };

    img.src = url;
  });
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function getAspectRatio(width: number, height: number): string {
  const divisor = gcd(width, height);
  const ratioW = width / divisor;
  const ratioH = height / divisor;

  // Common aspect ratios
  if (ratioW === 16 && ratioH === 9) return '16:9';
  if (ratioW === 4 && ratioH === 3) return '4:3';
  if (ratioW === 1 && ratioH === 1) return '1:1';
  if (ratioW === 3 && ratioH === 2) return '3:2';
  if (ratioW === 21 && ratioH === 9) return '21:9';
  if (ratioW === 9 && ratioH === 16) return '9:16';
  if (ratioW === 3 && ratioH === 4) return '3:4';

  // For non-standard ratios, return simplified ratio
  return `${ratioW}:${ratioH}`;
}

export function getFileTypeLabel(mimeType: string): string {
  const typeMap: Record<string, string> = {
    'image/jpeg': 'JPEG',
    'image/jpg': 'JPEG',
    'image/png': 'PNG',
    'image/gif': 'GIF',
    'image/webp': 'WebP'
  };

  return typeMap[mimeType] || mimeType.split('/')[1]?.toUpperCase() || 'Unknown';
}
