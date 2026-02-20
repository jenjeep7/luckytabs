// services/storageService.ts
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../firebase';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

const isNative = Capacitor.isNativePlatform();
const STORAGE_BUCKET = 'pull-tabs.firebasestorage.app';

async function getAuthToken(): Promise<string> {
  const result = await FirebaseAuthentication.getIdToken({ forceRefresh: false });
  if (!result.token) throw new Error('No auth token');
  return result.token;
}

/** Upload via Firebase Storage REST API (works on native where SDK is blocked) */
async function uploadViaRest(
  storagePath: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  const token = await getAuthToken();
  const encodedPath = encodeURIComponent(storagePath);

  // Read file as ArrayBuffer for upload
  const arrayBuffer = await file.arrayBuffer();

  const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o?uploadType=media&name=${encodedPath}`;

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: arrayBuffer,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Storage REST upload failed:', response.status, errorText);
    throw new Error(`Storage upload failed: ${response.status}`);
  }

  const result = await response.json();

  // Build the download URL with the token from the upload response
  const downloadToken = result.downloadTokens;
  const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodedPath}?alt=media&token=${downloadToken}`;

  if (onProgress) onProgress(100);
  return downloadUrl;
}

export async function uploadPostImage(
  uid: string,
  postId: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<{ url: string; contentType?: string; width?: number; height?: number }> {
  const path = `posts/${uid}/${postId}/${Date.now()}_${file.name}`;

  if (isNative) {
    try {
      const url = await uploadViaRest(path, file, onProgress);

      // Try to read dimensions client-side
      const meta: { width?: number; height?: number } = {};
      await new Promise<void>((res) => {
        const img = new Image();
        img.onload = () => { meta.width = img.width; meta.height = img.height; res(); };
        img.onerror = () => res();
        img.src = url;
      });

      return { url, contentType: file.type, ...meta };
    } catch (error) {
      console.error('Native storage upload error:', error);
      throw error;
    }
  }

  // Web implementation
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
