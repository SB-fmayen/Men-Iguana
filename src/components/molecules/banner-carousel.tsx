'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ScrollReveal } from '@/components/atoms/scroll-reveal';

interface BannerSlide {
  id: number;
  title: string;
  description: string;
  image: string;
  color: string;
}

const bannerSlides: BannerSlide[] = [
  {
    id: 1,
    title: '',
    description: '',
    image: '/Baner 1.png',
    color: 'from-purple-400 to-indigo-600'
  },
  {
    id: 2,
    title: 'Pizzas Deliciosas',
    description: 'Nuestras mejores pizzas con ingredientes frescos',
    image: '/Baner 1.png',
    color: 'from-orange-400 to-orange-600'
  },
  {
    id: 3,
    title: 'Shukos Sabrosos',
    description: 'Los mejores shukos de la zona',
    image: '/Baner 1.png',
    color: 'from-red-400 to-red-600'
  },
  {
    id: 5,
    title: 'Entradas y Más',
    description: 'Complementa tu pedido con nuestras delicias',
    image: '/Baner 1.png',
    color: 'from-amber-400 to-orange-600'
  }
];

export function BannerCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    if (!isAutoPlay) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlay]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    setIsAutoPlay(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
    setIsAutoPlay(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlay(false);
  };

  return (
    <ScrollReveal fullWidth>
      <div className="relative w-full overflow-hidden bg-black">
        {/* Carousel Container */}
        <div className="relative w-full aspect-[16/6] md:aspect-[16/5] lg:aspect-[16/5] min-h-[320px]">
          {bannerSlides.map((slide, index) => {
            const hasImageFile = slide.image.includes('/') || slide.image.includes('.');

            return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className={`h-full w-full bg-gradient-to-r ${slide.color} flex items-center justify-center relative overflow-hidden`}>
              {/* Decorative background */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 -left-20 w-96 h-96 rounded-full blur-3xl bg-white"></div>
                <div className="absolute bottom-0 -right-20 w-96 h-96 rounded-full blur-3xl bg-white"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 flex h-full w-full items-center justify-center px-0">
                {hasImageFile ? (
                  <div className="relative h-full w-full flex items-center justify-center">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center px-6 md:px-10 max-w-5xl">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                          {slide.title}
                        </h2>
                        <p className="text-lg md:text-xl text-white/90 drop-shadow-md mb-8">
                          {slide.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative text-center px-4 w-full max-w-7xl mx-auto">
                    <div className="text-8xl md:text-9xl mb-6">{slide.image}</div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                      {slide.title}
                    </h2>
                    <p className="text-lg md:text-xl text-white/90 drop-shadow-md mb-8">
                      {slide.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        })}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        onMouseEnter={() => setIsAutoPlay(false)}
        onMouseLeave={() => setIsAutoPlay(true)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        onMouseEnter={() => setIsAutoPlay(false)}
        onMouseLeave={() => setIsAutoPlay(true)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {bannerSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-white w-8'
                : 'bg-white/50 w-3 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute top-6 right-6 z-20 bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-sm text-sm font-medium">
        {currentSlide + 1} / {bannerSlides.length}
      </div>
    </div>
    </ScrollReveal>
  );
}
