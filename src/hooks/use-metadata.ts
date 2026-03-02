import { useCallback, useState } from 'react';
import { readMetadata } from '@/src/services/metadata-processor';
import { ImageAsset, ExifData, MetadataResult } from '@/src/types/image';

export function useMetadata() {
  const [metadataResult, setMetadataResult] = useState<MetadataResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMetadata = useCallback(async (source: ImageAsset) => {
    setLoading(true);
    setError(null);
    try {
      const result = await readMetadata(source);
      setMetadataResult(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to read metadata');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMetadata = useCallback(() => {
    setMetadataResult(null);
    setError(null);
  }, []);

  return { metadataResult, loading, error, loadMetadata, clearMetadata };
}
