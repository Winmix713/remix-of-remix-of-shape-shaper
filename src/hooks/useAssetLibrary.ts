import { useState, useEffect, useCallback } from 'react';

export type AssetType = 'image' | 'font';

export interface ImageAsset {
  id: string;
  name: string;
  originalName: string;
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  size: number;
  format: 'png' | 'jpg' | 'webp' | 'svg' | 'gif';
  uploadedAt: Date;
  usedIn: string[];
}

export interface FontAsset {
  id: string;
  family: string;
  category: 'serif' | 'sans-serif' | 'display' | 'handwriting' | 'monospace';
  variants: Array<{
    weight: number;
    style: 'normal' | 'italic';
    url: string;
  }>;
  source: 'google' | 'custom' | 'system';
  previewText?: string;
}

export type Asset = ImageAsset | FontAsset;

export interface AssetFilters {
  type?: AssetType;
  format?: string;
  search?: string;
}

const STORAGE_KEY = 'superellipse-assets';
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB limit

function generateId(): string {
  return `asset-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function getImageFormat(file: File): ImageAsset['format'] {
  const ext = file.name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'png': return 'png';
    case 'jpg':
    case 'jpeg': return 'jpg';
    case 'webp': return 'webp';
    case 'svg': return 'svg';
    case 'gif': return 'gif';
    default: return 'png';
  }
}

async function createThumbnail(
  dataUrl: string, 
  maxSize: number = 150
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);
      
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

async function getImageDimensions(
  dataUrl: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = dataUrl;
  });
}

export function useAssetLibrary() {
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [fonts, setFonts] = useState<FontAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storageUsed, setStorageUsed] = useState(0);

  // Load assets from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setImages(parsed.images || []);
        setFonts(parsed.fonts || []);
        setStorageUsed(stored.length);
      }
    } catch (err) {
      console.error('Failed to load assets:', err);
      setError('Failed to load saved assets');
    }
  }, []);

  // Save assets to localStorage whenever they change
  useEffect(() => {
    try {
      const data = JSON.stringify({ images, fonts });
      if (data.length > MAX_STORAGE_SIZE) {
        setError('Storage limit reached. Delete some assets to free space.');
        return;
      }
      localStorage.setItem(STORAGE_KEY, data);
      setStorageUsed(data.length);
      setError(null);
    } catch (err) {
      console.error('Failed to save assets:', err);
      setError('Failed to save assets');
    }
  }, [images, fonts]);

  const uploadImage = useCallback(async (file: File): Promise<ImageAsset | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed');
      }

      // Validate file size (max 2MB per file for localStorage)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Image must be smaller than 2MB');
      }

      // Read file as data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      // Get dimensions
      const dimensions = await getImageDimensions(dataUrl);

      // Create thumbnail
      const thumbnailUrl = await createThumbnail(dataUrl);

      const asset: ImageAsset = {
        id: generateId(),
        name: file.name.replace(/\.[^/.]+$/, ''),
        originalName: file.name,
        url: dataUrl,
        thumbnailUrl,
        width: dimensions.width,
        height: dimensions.height,
        size: file.size,
        format: getImageFormat(file),
        uploadedAt: new Date(),
        usedIn: [],
      };

      setImages(prev => [...prev, asset]);
      return asset;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadMultipleImages = useCallback(async (files: FileList | File[]): Promise<ImageAsset[]> => {
    const results: ImageAsset[] = [];
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      const asset = await uploadImage(file);
      if (asset) {
        results.push(asset);
      }
    }

    return results;
  }, [uploadImage]);

  const deleteAsset = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    setFonts(prev => prev.filter(font => font.id !== id));
  }, []);

  const renameAsset = useCallback((id: string, newName: string) => {
    setImages(prev => 
      prev.map(img => img.id === id ? { ...img, name: newName } : img)
    );
    setFonts(prev =>
      prev.map(font => font.id === id ? { ...font, family: newName } : font)
    );
  }, []);

  const getAsset = useCallback((id: string): Asset | undefined => {
    return images.find(img => img.id === id) || fonts.find(font => font.id === id);
  }, [images, fonts]);

  const getAssetUrl = useCallback((id: string): string => {
    const img = images.find(i => i.id === id);
    return img?.url || '';
  }, [images]);

  const getThumbnail = useCallback((id: string): string => {
    const img = images.find(i => i.id === id);
    return img?.thumbnailUrl || img?.url || '';
  }, [images]);

  const searchAssets = useCallback((query: string, filters?: AssetFilters): Asset[] => {
    const lowerQuery = query.toLowerCase();
    let results: Asset[] = [];

    if (!filters?.type || filters.type === 'image') {
      const matchingImages = images.filter(img => {
        const matchesName = img.name.toLowerCase().includes(lowerQuery) ||
                           img.originalName.toLowerCase().includes(lowerQuery);
        const matchesFormat = !filters?.format || img.format === filters.format;
        return matchesName && matchesFormat;
      });
      results = [...results, ...matchingImages];
    }

    if (!filters?.type || filters.type === 'font') {
      const matchingFonts = fonts.filter(font =>
        font.family.toLowerCase().includes(lowerQuery)
      );
      results = [...results, ...matchingFonts];
    }

    return results;
  }, [images, fonts]);

  const duplicateAsset = useCallback((id: string) => {
    const image = images.find(img => img.id === id);
    if (image) {
      const duplicate: ImageAsset = {
        ...image,
        id: generateId(),
        name: `${image.name} (copy)`,
        uploadedAt: new Date(),
        usedIn: [],
      };
      setImages(prev => [...prev, duplicate]);
      return duplicate;
    }
    return null;
  }, [images]);

  const clearAllAssets = useCallback(() => {
    setImages([]);
    setFonts([]);
    localStorage.removeItem(STORAGE_KEY);
    setStorageUsed(0);
  }, []);

  const getStorageInfo = useCallback(() => {
    return {
      used: storageUsed,
      max: MAX_STORAGE_SIZE,
      percentage: (storageUsed / MAX_STORAGE_SIZE) * 100,
      available: MAX_STORAGE_SIZE - storageUsed,
    };
  }, [storageUsed]);

  return {
    // State
    images,
    fonts,
    isLoading,
    error,

    // Actions
    uploadImage,
    uploadMultipleImages,
    deleteAsset,
    renameAsset,
    duplicateAsset,
    clearAllAssets,

    // Getters
    getAsset,
    getAssetUrl,
    getThumbnail,
    searchAssets,
    getStorageInfo,
  };
}
