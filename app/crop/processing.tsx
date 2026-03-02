import { ProcessingView } from '@/src/components/processing-view';

export default function CropProcessingScreen() {
  return (
    <ProcessingView
      statusLabel="Cropping image..."
      resultRoute="/crop/result"
    />
  );
}
