import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  placeholder?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  loading = 'lazy',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yMCAyOEMxNi42ODYzIDI4IDEzLjUwNTQgMjYuNjgzNSAxMS4xNzE2IDI0LjM0OTdDOC44Mzc4NCAyMi4wMTU5IDcuNTIxNDYgMTguODM1IDcuNTIxNDYgMTUuNTIxNUM3LjUyMTQ2IDEyLjIwOCA4LjgzNzg0IDkuMDI3MSAxMS4xNzE2IDYuNjkzMzJDMTMuNTA1NCA0LjM1OTU0IDE2LjY4NjMgMy4wNDMxNSAyMCAzLjA0MzE1QzIzLjMxMzcgMy4wNDMxNSAyNi40OTQ2IDQuMzU5NTQgMjguODI4NCA2LjY5MzMyQzMxLjE2MjIgOS4wMjcxIDMyLjQ3ODUgMTIuMjA4IDMyLjQ3ODUgMTUuNTIxNUMzMi40Nzg1IDE4LjgzNSAzMS4xNjIyIDIyLjAxNTkgMjguODI4NCAyNC4zNDk3QzI2LjQ5NDYgMjYuNjgzNSAyMy4zMTM3IDI4IDIwIDI4WiIgZmlsbD0iI0Q5RDlEOSIvPgo8L3N2Zz4K'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {!isLoaded && (
        <img
          src={placeholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          aria-hidden="true"
        />
      )}
      
      <img
        src={hasError ? placeholder : src}
        alt={alt}
        className={cn(
          'transition-opacity duration-300 w-full h-full object-cover',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading={loading}
        width={width}
        height={height}
      />
    </div>
  );
};

export default LazyImage;