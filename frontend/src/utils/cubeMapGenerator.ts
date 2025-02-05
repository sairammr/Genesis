import CubeMapProcessor from './cubeMap';

export async function processCubeMap(imagePath: string, options?: {
  interpolation?: 'nearest' | 'linear' | 'cubic' | 'lanczos',
  resolution?: number
}) {
  // Create an image element
  const image = new Image();
  image.src = imagePath;

  // Wait for image to load
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  // Create processor instance with optional parameters
  const processor = new CubeMapProcessor(
    options?.interpolation || 'linear', 
    options?.resolution || 1024
  );

  try {
    // Process the image
    const cubeFaces = await processor.processImage(image);

    // Convert faces to canvases
    const faces = Object.entries(cubeFaces).map(([name, imageData]) => {
      const canvas = document.createElement('canvas');
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      const ctx = canvas.getContext('2d')!;
      ctx.putImageData(imageData, 0, 0);
      return { name, canvas };
    });

    return faces;
  } catch (error) {
    console.error('Cube map processing failed:', error);
    throw error;
  }
}
