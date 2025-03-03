
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import Button from "./Button";

interface TestCardProps {
  id: string;
  title: string;
  description: string;
  duration: string;
  questions: number;
  image: string;
  category: string;
}

const TestCard = ({
  id,
  title,
  description,
  duration,
  questions,
  image,
  category
}: TestCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="relative rounded-xl overflow-hidden shadow-soft transition-all duration-300 hover:shadow-medium bg-card group h-full flex flex-col" 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-primary/90 text-white text-xs font-medium rounded-full">
            {category}
          </span>
        </div>
      </div>
      
      <div className="p-6 space-y-4 flex-1 flex flex-col">
        <h3 className="text-xl font-semibold group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>
        
        <p className="text-muted-foreground text-sm line-clamp-2">
          {description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 mt-auto">
          <div className="flex items-center space-x-1">
            <Clock size={16} />
            <span>{duration}</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle2 size={16} />
            <span>{questions} pertanyaan</span>
          </div>
        </div>
        
        <div className="pt-2">
          <Link to={`/tests/${id}`}>
            <Button className="w-full group">
              <span className="mr-auto">Mulai Tes</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TestCard;
