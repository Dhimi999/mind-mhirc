
import { Mail, ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TeamMemberProps {
  name: string;
  role: string;
  bio: string;
  image: string;
  email?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

const TeamMember = ({ name, role, bio, image, email, socialLinks }: TeamMemberProps) => {
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="group rounded-lg overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300 bg-card">
      <div className="flex items-center p-4">
        <div className="w-14 h-14 rounded-full overflow-hidden mr-3 flex-shrink-0">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold truncate group-hover:text-primary transition-colors">
            {name}
          </h3>
          
          <p className="text-primary text-sm font-medium">
            {role}
          </p>
        </div>
      </div>
      
      <div className="px-4 pb-4">
        <p className="text-muted-foreground text-xs line-clamp-2">
          {bio}
        </p>
        
        {email && (
          <div className="mt-2 flex justify-end">
            <a
              href={`mailto:${email}`}
              className="flex items-center text-xs text-primary hover:underline"
            >
              <Mail size={14} className="mr-1" />
              Kontak
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMember;
