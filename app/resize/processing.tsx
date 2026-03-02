import { ProcessingView } from '@/src/components/processing-view';

export default function ResizeProcessingScreen() {
  return (
    <ProcessingView
      statusLabel="Resizing..."
      resultRoute="/resize/result"
    />
  );
}
