import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MusicNotes, MagnifyingGlass, User } from "@phosphor-icons/react";
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const Footer: React.FC<FooterProps> = ({ className, ...props }) => {
  const location = useLocation();

  const renderIcon = (path: string, Icon: React.ElementType) => {
    const isActive = location.pathname === path;
    return (
      <Button
        asChild
        className={cn(
          'flex-1 bg-transparent',
          isActive 
            ? 'text-neutral-100' 
            : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 active:bg-neutral-700 active:text-neutral-100'
        )}
      >
        <Link to={path}>
          <Icon className="w-6 h-6" weight={isActive ? "fill" : "regular"} />
        </Link>
      </Button>
    );
  };

  return (
    <div
      className={cn(
        "sticky bottom-0 left-0 right-0 flex justify-between bg-neutral-900 border-t border-neutral-800 p-4 z-20",
        className
      )}
      {...props}
    >
      {renderIcon('/', MusicNotes)}
      {renderIcon('/search', MagnifyingGlass)}
      {renderIcon('/profile', User)}
    </div>
  );
};

export default Footer;
