import { useEffect, useRef } from "react";
import loader from "/imgloader.gif";

interface SmartImageProps {
  src: string;
  fallback?: string;
  loading?: string;
  alt?: string;
  className?: string;
  delay?: number;
  onLoad?: () => void;
}

export default function SmartImage({
  src,
  fallback = loader,
  loading = loader,
  alt = "image",
  className = "",
  delay = 0,
  onLoad, 
}: SmartImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    imgRef.current.src = loading;
    imgRef.current.classList.remove("opacity-100");
    imgRef.current.classList.add("opacity-0");

    const realImg = new Image();
    realImg.src = src;

    realImg.onload = () => {
      setTimeout(() => {
        if (imgRef.current) {
          imgRef.current.src = src;
          requestAnimationFrame(() => {
            imgRef.current?.classList.add("opacity-100");
          });

          if (onLoad) onLoad(); 
        }
      }, delay);
    };

    realImg.onerror = () => {
      setTimeout(() => {
        if (imgRef.current) {
          imgRef.current.src = fallback;
          imgRef.current.classList.add("opacity-100");
        }
      }, delay);
    };
  }, [src, fallback, loading, delay, onLoad]); 

  return (
    <img
      ref={imgRef}
      alt={alt}
      className={`transition-opacity duration-500 ${className}`}
    />
  );
}
