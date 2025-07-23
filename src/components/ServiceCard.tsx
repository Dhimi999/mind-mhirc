
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import Button from "./Button";

interface ServiceCardProps {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

const ServiceCard = ({ id, title, description, icon: Icon, color }: ServiceCardProps) => {
  return (
    <div className="rounded-xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300 bg-card group h-full flex flex-col">
      <div className="p-6 flex-1 flex flex-col">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color} mb-6`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        
        <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-6 flex-1">
          {description}
        </p>
        
        <div className="mt-auto">
          <Link to={`/services/${id}`}>
            <Button variant="outline" className="w-full group">
              <span className="mr-auto">Selengkapnya</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
