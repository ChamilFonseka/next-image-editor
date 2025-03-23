import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

function PhotoFrame() {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{width: number, height: number} | null>(null);
  const [cropSizeWarning, setCropSizeWarning] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Constants for minimum crop size (in pixels)
  const MIN_WIDTH = 800;
  const MIN_HEIGHT = 1000; // To maintain 8:10 aspect ratio when min width is 800

  // Function to handle file input changes
  function onSelectFile(e: ChangeEvent<HTMLInputElement>): void {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        if (typeof reader.result === 'string') {
          setImgSrc(reader.result);
          setCroppedImage(null);
          setCropSizeWarning(null);
        }
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  // Function to initialize the crop when an image is loaded
  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>): void {
    const { width, height, naturalWidth, naturalHeight } = e.currentTarget;
    
    // Store original dimensions for quality information
    setOriginalDimensions({ width: naturalWidth, height: naturalHeight });
    
    // Check if the image is large enough for our minimum crop size
    if (naturalWidth < MIN_WIDTH || naturalHeight < MIN_HEIGHT) {
      setCropSizeWarning(`Warning: Your image (${naturalWidth}×${naturalHeight}px) is smaller than the recommended minimum size for 8"×10" printing (${MIN_WIDTH}×${MIN_HEIGHT}px). The quality may be reduced.`);
    } else {
      setCropSizeWarning(null);
    }
    
    // Initialize crop with 8:10 aspect ratio
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 80,
        },
        8 / 10, // 8:10 aspect ratio for 8"x10" prints
        width,
        height
      ),
      width,
      height
    );
    
    setCrop(crop);
  }

  // Function to validate crop size meets minimum requirements
  useEffect(() => {
    if (!completedCrop || !imgRef.current) return;
    
    const { naturalWidth, naturalHeight } = imgRef.current;
    const cropWidthPx = (completedCrop.width / 100) * naturalWidth;
    const cropHeightPx = (completedCrop.height / 100) * naturalHeight;
    
    if (cropWidthPx < MIN_WIDTH || cropHeightPx < MIN_HEIGHT) {
      setCropSizeWarning(`Current crop size (${Math.round(cropWidthPx)}×${Math.round(cropHeightPx)}px) is below the minimum recommended size (${MIN_WIDTH}×${MIN_HEIGHT}px) for quality printing.`);
    } else {
      setCropSizeWarning(null);
    }
  }, [completedCrop]);

  // Function to generate the cropped image at high quality
  function generateCrop(): void {
    if (!imgRef.current || !completedCrop || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Calculate scale factors
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    
    // Set dimensions for high-quality printable output
    const printWidth = Math.round(completedCrop.width * scaleX);
    const printHeight = Math.round(completedCrop.height * scaleY);
    
    // Make sure we maintain the 8:10 ratio exactly for printing
    canvas.width = printWidth;
    canvas.height = printHeight;
    
    // Draw the image at high resolution
    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      printWidth,
      printHeight
    );
    
    // Convert canvas to high-quality image
    const croppedImageUrl = canvas.toDataURL('image/jpeg', 1.0); // Use maximum quality
    setCroppedImage(croppedImageUrl);
  }

  // Function to download the cropped image
  function downloadCroppedImage(): void {
    if (!croppedImage) return;
    
    const link = document.createElement('a');
    link.download = '8x10_photo_print_quality.jpg';
    link.href = croppedImage;
    link.click();
  }

  // Calculate estimated DPI for an 8x10 print
  function calculateEstimatedDPI(): number | null {
    if (!croppedImage || !canvasRef.current) return null;
    
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    
    // Calculate DPI based on 8x10 inches
    const dpiWidth = width / 8;
    const dpiHeight = height / 10;
    
    // Return the average DPI
    return Math.round((dpiWidth + dpiHeight) / 2);
  }

  // Function to determine if the DPI is sufficient for quality printing
  function getDpiQualityLevel(dpi: number | null): string {
    if (!dpi) return 'Unknown';
    if (dpi >= 300) return 'Excellent';
    if (dpi >= 200) return 'Good';
    if (dpi >= 150) return 'Acceptable';
    return 'Low';
  }

  function enforceMinCropSize(c: Crop) {
    if (!imgRef.current) return;
  
    const { naturalWidth, naturalHeight } = imgRef.current;
  
    // Ensure crop width and height in pixels
    const cropWidthPx = (c.width / 100) * naturalWidth;
    const cropHeightPx = (c.height / 100) * naturalHeight;
  
    // If crop is smaller than allowed dimensions, enforce the minimum
    if (cropWidthPx < MIN_WIDTH || cropHeightPx < MIN_HEIGHT) {
      const newWidth = Math.max(cropWidthPx, MIN_WIDTH);
      const newHeight = Math.max(cropHeightPx, MIN_HEIGHT);
  
      // Convert back to percentage for ReactCrop
      const newCrop = {
        ...c,
        width: (newWidth / naturalWidth) * 100,
        height: (newHeight / naturalHeight) * 100,
      };
  
      setCrop(newCrop);
    } else {
      setCrop(c); // Allow valid crops
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">8"x10" Photo Frame App</h1>
      
      <div className="mb-4">
        <input 
          type="file" 
          accept="image/*" 
          onChange={onSelectFile} 
          className="mb-2"
        />
        
        <p className="text-sm text-gray-500 mb-4">
          Upload a photo and crop it to an 8"x10" aspect ratio for printing. 
          Minimum recommended size: {MIN_WIDTH}×{MIN_HEIGHT}px.
        </p>
      </div>
      
      {imgSrc && (
        <div className="mb-4">
          {cropSizeWarning && (
            <div className="p-3 mb-4 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded">
              ⚠️ {cropSizeWarning}
            </div>
          )}
          
          <div className="border border-gray-300 p-2 mb-4">
            <ReactCrop
              crop={crop}
              onChange={(c) => enforceMinCropSize(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={8 / 10}
              minWidth={(MIN_WIDTH / (imgRef.current?.naturalWidth || 1)) * 100} // Ensure 800px min
              minHeight={(MIN_HEIGHT / (imgRef.current?.naturalHeight || 1)) * 100} // Ensure 1000px min
            >
              <img
                ref={imgRef}
                src={imgSrc}
                onLoad={onImageLoad}
                alt="Upload"
                className="max-h-96 w-[1000px]"
              />
            </ReactCrop>
          </div>
          
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
            onClick={generateCrop}
            disabled={!completedCrop}
          >
            Set to Frame
          </button>
          
          {originalDimensions && (
            <div className="mt-2 text-sm text-gray-600">
              Original image: {originalDimensions.width} × {originalDimensions.height} pixels
            </div>
          )}
        </div>
      )}
      
      {croppedImage && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Your Framed Photo</h2>
          <div className="border-8 border-amber-700 inline-block mb-4">
            <img 
              src={croppedImage} 
              alt="Cropped" 
              className="max-w-full h-auto w-[250px]"
            />
          </div>
          
          <div className="mt-4">
            <button
              onClick={downloadCroppedImage}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
            >
              Download Print-Quality Image
            </button>
            
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h3 className="font-medium mb-2">Image Information:</h3>
              <ul className="list-disc pl-5 text-sm">
                <li>Aspect ratio: 8:10 (perfect for 8"×10" prints)</li>
                <li>Format: High-quality JPEG (100% quality)</li>
                {canvasRef.current && (
                  <>
                    <li>Resolution: {canvasRef.current.width} × {canvasRef.current.height} pixels</li>
                    <li>
                      Estimated print DPI: {calculateEstimatedDPI()} at 8"×10" size 
                      ({getDpiQualityLevel(calculateEstimatedDPI())} quality)
                    </li>
                  </>
                )}
                <li>Minimum size requirement: {MIN_WIDTH}×{MIN_HEIGHT}px (enforced by the app)</li>
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Hidden canvas used for cropping */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />
    </div>
  );
}

export default PhotoFrame;