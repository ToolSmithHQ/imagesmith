export interface ToolDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  enabled: boolean;
}

export const TOOLS: ToolDefinition[] = [
  {
    id: 'convert',
    title: 'Convert Format',
    description: 'Change image format (JPEG, PNG, WebP, HEIC, BMP)',
    icon: 'arrow.2.squarepath',
    route: '/convert',
    enabled: true,
  },
  {
    id: 'compress',
    title: 'Compress',
    description: 'Reduce image file size',
    icon: 'arrow.down.right.and.arrow.up.left',
    route: '/compress',
    enabled: false,
  },
  {
    id: 'resize',
    title: 'Resize',
    description: 'Change image dimensions',
    icon: 'arrow.up.left.and.arrow.down.right',
    route: '/resize',
    enabled: false,
  },
  {
    id: 'crop',
    title: 'Crop',
    description: 'Crop and trim images',
    icon: 'crop',
    route: '/crop',
    enabled: false,
  },
  {
    id: 'rotate',
    title: 'Rotate / Flip',
    description: 'Rotate or flip images',
    icon: 'rotate.right',
    route: '/rotate',
    enabled: false,
  },
  {
    id: 'metadata',
    title: 'Metadata',
    description: 'View or remove EXIF data',
    icon: 'info.circle',
    route: '/metadata',
    enabled: false,
  },
];
