// services/storageService.ts
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../firebase';

export async function uploadPostImage(
  uid: string,
  postId: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<{ url: string; contentType?: string; width?: number; height?: number }> {
  const path = `posts/${uid}/${postId}/${Date.now()}_${file.name}`;
  const r = ref(storage, path);
  const task = uploadBytesResumable(r, file, { contentType: file.type });

  await new Promise<void>((resolve, reject) => {
    task.on(
      'state_changed',
      s => onProgress?.(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
      reject,
      () => resolve()
    );
  });

  const url = await getDownloadURL(task.snapshot.ref);

  // try to read dimensions client-side
  const meta: { width?: number; height?: number } = {};
  await new Promise<void>((res) => {
    const img = new Image();
    img.onload = () => { meta.width = img.width; meta.height = img.height; res(); };
    img.onerror = () => res();
    img.src = url;
  });

  return { url, contentType: file.type, ...meta };
}
