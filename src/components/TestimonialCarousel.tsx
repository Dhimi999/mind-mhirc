import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import Button from "./Button";

interface Author {
  name: string;
  role: string;
  avatar: string;
}

interface Testimonial {
  content: string;
  author: Author;
  rating: number;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
}

const TestimonialCarousel = ({ testimonials }: TestimonialCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  // Autoplay functionality
  useEffect(() => {
    if (!autoplay) return;
    
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [activeIndex, autoplay, testimonials.length]);

  // Pause autoplay on hover
  const handleMouseEnter = () => setAutoplay(false);
  const handleMouseLeave = () => setAutoplay(true);

  // Function to render star ratings
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center space-x-1">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-4 h-4 fill-accent text-accent" />
        ))}
        
        {hasHalfStar && (
          <div className="relative">
            <Star className="w-4 h-4 text-accent" />
            <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
              <Star className="w-4 h-4 fill-accent text-accent" />
            </div>
          </div>
        )}
        
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 text-muted-foreground/40" />
        ))}
      </div>
    );
  };

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="overflow-hidden relative">
        <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
          {testimonials.map((testimonial, index) => (
            <div key={index} className="w-full flex-shrink-0 px-4">
              <div className="bg-card rounded-xl p-6 md:p-8 shadow-soft h-full flex flex-col">
                <div className="mb-6">
                  {renderStars(testimonial.rating)}
                </div>
                
                <blockquote className="text-lg font-medium mb-6 flex-grow">
                  &ldquo;{testimonial.content}&rdquo;
                </blockquote>
                
                <footer className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img
                      src={testimonial.author.avatar}
                      alt={testimonial.author.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.author.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.author.role}</p>
                  </div>
                </footer>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-center mt-8 space-x-2">
        <Button variant="outline" size="sm" onClick={handlePrev} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Previous</span>
        </Button>
        
        <div className="flex items-center space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                index === activeIndex ? "bg-primary" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        
        <Button variant="outline" size="sm" onClick={handleNext} className="rounded-full">
          <ArrowRight className="h-5 w-5" />
          <span className="sr-only">Next</span>
        </Button>
      </div>
      
      {/* Auto-scroll indicator */}
      {autoplay && (
        <div className="flex justify-center mt-4">
          <div className="h-1 bg-muted-foreground/20 rounded-full w-32 overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-100 rounded-full"
              style={{ 
                width: `${((activeIndex % 1) * 100)}%`,
                animation: "progress 5s linear infinite"
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialCarousel;
