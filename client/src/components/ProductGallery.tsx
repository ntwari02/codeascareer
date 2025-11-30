import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, Maximize2 } from 'lucide-react';
import type { ProductImage } from '@/types';

interface ProductGalleryProps {
  images: ProductImage[];
  productTitle: string;
  className?: string;
}

export function ProductGallery({ images, productTitle, className = '' }: ProductGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Sort images: primary first, then by position
  const sortedImages = [...images].sort((a, b) => {
    // Primary image first
    if ((a as any).is_primary && !(b as any).is_primary) return -1;
    if (!(a as any).is_primary && (b as any).is_primary) return 1;
    // Then by position
    return (a.position || 0) - (b.position || 0);
  });

  // Find primary image index
  useEffect(() => {
    const primaryIndex = sortedImages.findIndex((img) => (img as any).is_primary);
    if (primaryIndex !== -1) {
      setSelectedImageIndex(primaryIndex);
    }
  }, [images]);

  const mainImage = sortedImages[selectedImageIndex] || sortedImages[0];
  const galleryImages = sortedImages.filter((_, idx) => idx !== selectedImageIndex);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setLightboxIndex((prev) => (prev > 0 ? prev - 1 : sortedImages.length - 1));
    } else {
      setLightboxIndex((prev) => (prev < sortedImages.length - 1 ? prev + 1 : 0));
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox('prev');
      if (e.key === 'ArrowRight') navigateLightbox('next');
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isLightboxOpen]);

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg aspect-square flex items-center justify-center ${className}`}>
        <p className="text-gray-400">No images available</p>
      </div>
    );
  }

  return (
    <>
      <div className={className}>
        {/* Main Image Display */}
        <div className="relative mb-4 group">
          <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm aspect-square relative">
            <img
              src={mainImage?.url}
              alt={mainImage?.alt_text || productTitle}
              className="w-full h-full object-cover cursor-zoom-in transition-transform duration-300 group-hover:scale-105"
              onClick={() => openLightbox(selectedImageIndex)}
            />
            
            {/* Zoom Indicator */}
            <button
              onClick={() => openLightbox(selectedImageIndex)}
              className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all opacity-0 group-hover:opacity-100"
              aria-label="View full size"
            >
              <ZoomIn className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>

            {/* Navigation Arrows (if multiple images) */}
            {sortedImages.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : sortedImages.length - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                </button>
                <button
                  onClick={() => setSelectedImageIndex((prev) => (prev < sortedImages.length - 1 ? prev + 1 : 0))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                </button>
              </>
            )}

            {/* Image Counter */}
            {sortedImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                {selectedImageIndex + 1} / {sortedImages.length}
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail Gallery */}
        {sortedImages.length > 1 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Gallery</h3>
              <button
                onClick={() => openLightbox(0)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <Maximize2 className="h-3 w-3" />
                View All
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {/* Selected main image thumbnail */}
              <button
                onClick={() => setSelectedImageIndex(selectedImageIndex)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  true
                    ? 'border-blue-600 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <img
                  src={mainImage?.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
                {(mainImage as any)?.is_primary && (
                  <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded">
                    Main
                  </div>
                )}
              </button>

              {/* Other gallery images */}
              {galleryImages.slice(0, 4).map((img, idx) => {
                const originalIndex = sortedImages.findIndex((i) => i.id === img.id);
                return (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageIndex(originalIndex)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all relative ${
                      selectedImageIndex === originalIndex
                        ? 'border-blue-600 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.alt_text || ''}
                      className="w-full h-full object-cover"
                    />
                    {(img as any)?.is_primary && (
                      <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded">
                        Main
                      </div>
                    )}
                  </button>
                );
              })}

              {/* Show more indicator if there are more than 5 images */}
              {sortedImages.length > 5 && (
                <button
                  onClick={() => openLightbox(0)}
                  className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                >
                  <span className="text-xs font-medium">+{sortedImages.length - 5}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            aria-label="Close lightbox"
          >
            <X className="h-8 w-8" />
          </button>

          <div
            className="relative max-w-7xl w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Main Image */}
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={sortedImages[lightboxIndex]?.url}
                alt={sortedImages[lightboxIndex]?.alt_text || productTitle}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Navigation */}
            {sortedImages.length > 1 && (
              <>
                <button
                  onClick={() => navigateLightbox('prev')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all hover:scale-110"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={() => navigateLightbox('next')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all hover:scale-110"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full">
              {lightboxIndex + 1} / {sortedImages.length}
            </div>

            {/* Thumbnail Strip */}
            {sortedImages.length > 1 && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 max-w-4xl overflow-x-auto px-4">
                {sortedImages.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setLightboxIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      lightboxIndex === idx
                        ? 'border-white ring-2 ring-blue-400'
                        : 'border-white/50 hover:border-white/80'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

