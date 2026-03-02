import { ProcessingView } from '@/src/components/processing-view';

export default function CompressProcessingScreen() {
  return (
    <ProcessingView
      statusLabel="Compressing..."
      resultRoute="/compress/result"
    />
  );
}
