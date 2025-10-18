import { Shield } from 'lucide-react';

interface LogoImageProps {
  size?: number;
  className?: string;
}

export function LogoImage({ size = 32, className = '' }: LogoImageProps) {
  return (
    <Shield 
      className={className} 
      style={{ width: size, height: size }}
    />
  );
}

