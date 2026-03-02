import { ProcessingView } from '@/src/components/processing-view';

export default function RotateProcessingScreen() {
  return (
    <ProcessingView
      statusLabel="Applying transformations..."
      resultRoute="/rotate/result"
    />
  );
}
