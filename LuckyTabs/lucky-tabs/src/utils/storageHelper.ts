import { Capacitor } from '@capacitor/core';

/**
 * Upload a file to Firebase Storage
 * - On native platforms: Use HTTP Cloud Function to bypass CORS/auth issues
 * - On web: Use web SDK
 */
export async function uploadFile(path: string, file: File): Promise<string> {
  if (Capacitor.isNativePlatform()) {
    console.log('[storageHelper] Using HTTP Cloud Function for upload:', path);
    
    try {
      // Convert file to data URL
      const dataUrl = await fileToDataUrl(file);
      
      console.log('[storageHelper] File details:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      // Extract temp ID from path (e.g., "flare-sheets/temp_123.jpg" -> "temp_123")
      const tempId = path.split('/').pop()?.replace(/\.[^.]+$/, '') || '';
      
      // Get auth token from native plugin
      const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
      const result = await FirebaseAuthentication.getIdToken();
      
      if (!result.token) {
        throw new Error('Failed to get auth token');
      }

      console.log('[storageHelper] Got auth token, uploading via HTTP endpoint...');
      
      // Call HTTP Cloud Function
      const response = await fetch(
        'https://us-central1-pull-tabs.cloudfunctions.net/uploadFlareSheet',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${result.token}`
          },
          body: JSON.stringify({
            imageData: dataUrl,
            tempId,
            contentType: file.type
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[storageHelper] HTTP response error:', response.status, errorText);
        throw new Error(`Upload failed: ${response.status} ${errorText}`);
      }

      const resultData = await response.json();
      console.log('[storageHelper] Upload successful:', resultData.downloadUrl);
      
      return resultData.downloadUrl;

    } catch (error) {
      console.error('[storageHelper] HTTP upload failed:', error);
      console.error('[storageHelper] Error details:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  } else {
    // Web platform - use web SDK
    console.log('[storageHelper] Using web SDK for upload:', path);
    const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
    const { storage } = await import('../firebase');
    
    const storageRef = ref(storage, path);
    console.log('[storageHelper] Starting upload...');
    await uploadBytes(storageRef, file);
    console.log('[storageHelper] Upload complete, getting download URL...');
    const downloadUrl = await getDownloadURL(storageRef);
    console.log('[storageHelper] Upload successful:', downloadUrl);
    return downloadUrl;
  }
}

/**
 * Convert File to data URL
 */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
