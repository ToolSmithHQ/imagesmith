import { ProcessingView } from '@/src/components/processing-view';

export default function MetadataProcessingScreen() {
  return (
    <ProcessingView
      statusLabel="Stripping metadata..."
      resultRoute="/metadata/result"
    />
  );
}
