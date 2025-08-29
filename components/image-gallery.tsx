import { memo, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@heroui/react";

interface ImageGalleryProps {
  images: readonly string[];
}

const ImageGallery = memo(({ images }: ImageGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});

  const handleThumbnailClick = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const handleImageLoad = useCallback((index: number) => {
    setImageLoaded(prev => ({ ...prev, [index]: true }));
  }, []);

  // Preload first image
  useEffect(() => {
    if (images.length > 0) {
      const img = new Image();

      img.onload = () => handleImageLoad(0);
      img.src = images[0];
    }
  }, [images, handleImageLoad]);

  return (
    <div className="w-full flex flex-col items-center gap-4 mb-6" data-slot="image-gallery">
      <div className="w-full max-w-xl h-65 md:h-80 overflow-hidden rounded-xl relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={images[activeIndex]}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 w-full h-full"
            exit={{ opacity: 0, scale: 0.95 }}
            initial={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Skeleton 
              className="w-full h-full rounded-lg" 
              isLoaded={imageLoaded[activeIndex] ?? false}
            >
              <img
                alt={`Project image ${activeIndex + 1}`}
                className="w-full h-full object-cover"
                src={images[activeIndex]}
                onLoad={() => handleImageLoad(activeIndex)}
              />
            </Skeleton>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex gap-3">
        {images.map((img, index) => (
          <motion.div
            key={img}
            className={`w-15 h-19 md:w-20 md:h-20 rounded-lg overflow-hidden cursor-pointer border-2 ${index === activeIndex
              ? "border-blue-500"
              : "border-transparent"
              }`}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => handleThumbnailClick(index)}
          >
            <img
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
              src={img}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
});

export default ImageGallery;

ImageGallery.displayName = "ImageGallery";
