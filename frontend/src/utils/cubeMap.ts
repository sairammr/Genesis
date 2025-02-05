interface CubeOrientation {
    x: number;
    y: number;
    z: number;
  }
  
  interface FacePosition {
    x: number;
    y: number;
  }
  
  class CubeMapProcessor {
    private interpolation: 'nearest' | 'linear' | 'cubic' | 'lanczos';
    private resolution: number;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private workers: Worker[];
  
    constructor(interpolation: 'nearest' | 'linear' | 'cubic' | 'lanczos' = 'linear', resolution = 2048) {
      this.interpolation = interpolation;
      this.resolution = resolution;
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
      this.workers = [];
    }
  
    private clamp(x: number, min: number, max: number): number {
      return Math.min(max, Math.max(x, min));
    }
  
    private mod(x: number, n: number): number {
      return ((x % n) + n) % n;
    }
  
    private copyPixelNearest(read: ImageData, write: ImageData) {
      const {width, height, data} = read;
      const readIndex = (x: number, y: number) => 4 * (y * width + x);
  
      return (xFrom: number, yFrom: number, to: number) => {
        const nearest = readIndex(
          this.clamp(Math.round(xFrom), 0, width - 1),
          this.clamp(Math.round(yFrom), 0, height - 1)
        );
  
        for (let channel = 0; channel < 3; channel++) {
          write.data[to + channel] = data[nearest + channel];
        }
      };
    }
  
    private copyPixelBilinear(read: ImageData, write: ImageData) {
      const {width, height, data} = read;
      const readIndex = (x: number, y: number) => 4 * (y * width + x);
  
      return (xFrom: number, yFrom: number, to: number) => {
        const xl = this.clamp(Math.floor(xFrom), 0, width - 1);
        const xr = this.clamp(Math.ceil(xFrom), 0, width - 1);
        const xf = xFrom - xl;
  
        const yl = this.clamp(Math.floor(yFrom), 0, height - 1);
        const yr = this.clamp(Math.ceil(yFrom), 0, height - 1);
        const yf = yFrom - yl;
  
        const p00 = readIndex(xl, yl);
        const p10 = readIndex(xr, yl);
        const p01 = readIndex(xl, yr);
        const p11 = readIndex(xr, yr);
  
        for (let channel = 0; channel < 3; channel++) {
          const p0 = data[p00 + channel] * (1 - xf) + data[p10 + channel] * xf;
          const p1 = data[p01 + channel] * (1 - xf) + data[p11 + channel] * xf;
          write.data[to + channel] = Math.ceil(p0 * (1 - yf) + p1 * yf);
        }
      };
    }
  
    private kernelResample(
      read: ImageData, 
      write: ImageData, 
      filterSize: number, 
      kernel: (x: number) => number
    ) {
      const {width, height, data} = read;
      const readIndex = (x: number, y: number) => 4 * (y * width + x);
  
      const twoFilterSize = 2 * filterSize;
      const xMax = width - 1;
      const yMax = height - 1;
      const xKernel = new Array(4);
      const yKernel = new Array(4);
  
      return (xFrom: number, yFrom: number, to: number) => {
        const xl = Math.floor(xFrom);
        const yl = Math.floor(yFrom);
        const xStart = xl - filterSize + 1;
        const yStart = yl - filterSize + 1;
  
        for (let i = 0; i < twoFilterSize; i++) {
          xKernel[i] = kernel(xFrom - (xStart + i));
          yKernel[i] = kernel(yFrom - (yStart + i));
        }
  
        for (let channel = 0; channel < 3; channel++) {
          let q = 0;
  
          for (let i = 0; i < twoFilterSize; i++) {
            const y = yStart + i;
            const yClamped = this.clamp(y, 0, yMax);
            let p = 0;
            for (let j = 0; j < twoFilterSize; j++) {
              const x = xStart + j;
              const index = readIndex(this.clamp(x, 0, xMax), yClamped);
              p += data[index + channel] * xKernel[j];
            }
            q += p * yKernel[i];
          }
  
          write.data[to + channel] = Math.round(q);
        }
      };
    }
  
    private copyPixelBicubic(read: ImageData, write: ImageData) {
      const b = -0.5;
      const kernel = (x: number) => {
        x = Math.abs(x);
        const x2 = x * x;
        const x3 = x * x * x;
        return x <= 1 ?
          (b + 2) * x3 - (b + 3) * x2 + 1 :
          b * x3 - 5 * b * x2 + 8 * b * x - 4 * b;
      };
  
      return this.kernelResample(read, write, 2, kernel);
    }
  
    private copyPixelLanczos(read: ImageData, write: ImageData) {
      const filterSize = 5;
      const kernel = (x: number) => {
        if (x === 0) {
          return 1;
        } else {
          const xp = Math.PI * x;
          return filterSize * Math.sin(xp) * Math.sin(xp / filterSize) / (xp * xp);
        }
      };
  
      return this.kernelResample(read, write, filterSize, kernel);
    }
  
    private orientations: Record<string, (out: CubeOrientation, x: number, y: number) => void> = {
      pz: (out, x, y) => {
        out.x = -1;
        out.y = -x;
        out.z = -y;
      },
      nz: (out, x, y) => {
        out.x = 1;
        out.y = x;
        out.z = -y;
      },
      px: (out, x, y) => {
        out.x = x;
        out.y = -1;
        out.z = -y;
      },
      nx: (out, x, y) => {
        out.x = -x;
        out.y = 1;
        out.z = -y;
      },
      py: (out, x, y) => {
        out.x = -y;
        out.y = -x;
        out.z = 1;
      },
      ny: (out, x, y) => {
        out.x = y;
        out.y = -x;
        out.z = -1;
      }
    };
  
    async processImage(image: HTMLImageElement): Promise<Record<string, ImageData>> {
      const {width, height} = image;
      this.canvas.width = width;
      this.canvas.height = height;
      this.ctx.drawImage(image, 0, 0);
      const data = this.ctx.getImageData(0, 0, width, height);
  
      const facePositions: Record<string, FacePosition> = {
        pz: {x: 1, y: 1},
        nz: {x: 3, y: 1},
        px: {x: 2, y: 1},
        nx: {x: 0, y: 1},
        py: {x: 1, y: 0},
        ny: {x: 1, y: 2}
      };
  
      const results: Record<string, ImageData> = {};
  
      for (let [faceName, position] of Object.entries(facePositions)) {
        const faceData = await this.renderFace(data, faceName, position);
        results[faceName] = faceData;
      }
  
      return results;
    }
  
    private renderFace(data: ImageData, faceName: string, position: FacePosition): Promise<ImageData> {
      return new Promise((resolve) => {
        const faceWidth = this.resolution;
        const faceHeight = this.resolution;
  
        const cube: CubeOrientation = {x: 0, y: 0, z: 0};
        const orientation = this.orientations[faceName];
  
        const writeData = new ImageData(faceWidth, faceHeight);
  
        const copyPixel =
          this.interpolation === 'linear' ? this.copyPixelBilinear(data, writeData) :
          this.interpolation === 'cubic' ? this.copyPixelBicubic(data, writeData) :
          this.interpolation === 'lanczos' ? this.copyPixelLanczos(data, writeData) :
          this.copyPixelNearest(data, writeData);
  
        for (let x = 0; x < faceWidth; x++) {
          for (let y = 0; y < faceHeight; y++) {
            const to = 4 * (y * faceWidth + x);
  
            // fill alpha channel
            writeData.data[to + 3] = 255;
  
            // get position on cube face
            // cube is centered at the origin with a side length of 2
            orientation(cube, (2 * (x + 0.5) / faceWidth - 1), (2 * (y + 0.5) / faceHeight - 1));
  
            // project cube face onto unit sphere by converting cartesian to spherical coordinates
            const r = Math.sqrt(cube.x * cube.x + cube.y * cube.y + cube.z * cube.z);
            const lon = this.mod(Math.atan2(cube.y, cube.x), 2 * Math.PI);
            const lat = Math.acos(cube.z / r);
  
            copyPixel(data.width * lon / Math.PI / 2 - 0.5, data.height * lat / Math.PI - 0.5, to);
          }
        }
  
        resolve(writeData);
      });
    }
  }
  
  export default CubeMapProcessor;