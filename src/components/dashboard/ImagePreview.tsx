
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface ImagePreviewProps {
  url: string;
  alt: string;
  className?: string;
}

const ImagePreview = ({ url, alt, className = "" }: ImagePreviewProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <div className="mt-2 relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
      
      {error ? (
        <div className="bg-red-50 text-red-500 p-2 rounded text-sm text-center">
          Failed to load image
        </div>
      ) : (
        <img
          src={url}
          alt={alt}
          className={`rounded ${className}`}
          style={{ maxWidth: "100%", display: loading ? "none" : "block" }}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
};

export default ImagePreview;
