import React, { useState, useRef, useCallback } from "react";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface ImageCropModalProps {
  imageUrl: string;
  onClose: () => void;
  onCrop: (croppedImageUrl: string) => void;
  aspect?: number; // misalnya 16/9 atau 1 (default bisa diatur di parent)
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({ imageUrl, onClose, onCrop, aspect }) => {
  // State untuk crop, gunakan persen (default 50% lebar)
  const [crop, setCrop] = useState<Crop>({ unit: "%", width: 50, x: 25, y: 25, height: 50 });
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  
  // Refs untuk image dan canvas preview
  const imageRef = useRef<HTMLImageElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Callback ketika gambar sudah dimuat
  const onImageLoaded = (img: HTMLImageElement) => {
    imageRef.current = img;
    return false; // untuk mencegah perubahan ukuran otomatis
  };

  // Callback ketika crop sudah selesai
  const onCropCompleteHandler = (crop: Crop) => {
    setCompletedCrop(crop);
  };

  // Fungsi untuk menghasilkan cropped image data URL
  const getCroppedImg = useCallback(() => {
    if (!completedCrop || !imageRef.current || !previewCanvasRef.current) return;

    const image = imageRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;

    // Hitung skala gambar asli terhadap tampilan
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width!;
    canvas.height = crop.height!;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(
      image,
      crop.x! * scaleX,
      crop.y! * scaleY,
      crop.width! * scaleX,
      crop.height! * scaleY,
      0,
      0,
      crop.width!,
      crop.height!
    );

    // Dapatkan data URL dari canvas
    return canvas.toDataURL("image/png");
  }, [completedCrop]);

  // Fungsi yang dipanggil saat tombol Crop ditekan
  const handleCrop = () => {
    const croppedImageUrl = getCroppedImg();
    if (croppedImageUrl) {
      onCrop(croppedImageUrl);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded-md shadow-lg max-w-lg w-full">
        <h2 className="text-xl font-bold mb-4">Preview & Crop Gambar</h2>
        <ReactCrop
          crop={crop}
          aspect={aspect}
          onComplete={onCropCompleteHandler}
          onChange={(newCrop) => setCrop(newCrop)}
        >
          <img
            src={imageUrl}
            onLoad={(e) => onImageLoaded(e.currentTarget)}
            alt="Crop preview"
          />
        </ReactCrop>
        {/* Canvas untuk proses cropping (tidak ditampilkan) */}
        <canvas ref={previewCanvasRef} style={{ display: "none" }} />
        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
          >
            Batal
          </button>
          <button
            onClick={handleCrop}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Crop
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;
