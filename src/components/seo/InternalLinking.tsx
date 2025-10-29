import React from 'react';
import { Link } from 'react-router-dom';

interface InternalLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const InternalLink: React.FC<InternalLinkProps> = ({ to, children, className, title }) => {
  return (
    <Link
      to={to}
      className={className}
      title={title}
      aria-label={title}
    >
      {children}
    </Link>
  );
};

// Related content component for better internal linking
interface RelatedContentProps {
  title: string;
  links: Array<{
    to: string;
    text: string;
    description?: string;
  }>;
}

export const RelatedContent: React.FC<RelatedContentProps> = ({ title, links }) => {
  return (
    <nav className="bg-muted/50 rounded-lg p-6 mt-8" aria-labelledby="related-content">
      <h3 id="related-content" className="text-lg font-semibold mb-4">{title}</h3>
      <ul className="space-y-3">
        {links.map((link, index) => (
          <li key={index}>
            <InternalLink
              to={link.to}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
              title={link.description || link.text}
            >
              {link.text}
            </InternalLink>
            {link.description && (
              <p className="text-sm text-muted-foreground mt-1">{link.description}</p>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default InternalLink;