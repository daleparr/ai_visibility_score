'use client';

import { useEffect, useState } from 'react';

interface Logo {
  logo_id: string;
  logo_name: string;
  file_url: string;
  alt_text: string;
  display_order: number;
}

interface LogoDisplayProps {
  collectionKey: string;
  title?: string;
  className?: string;
}

export function LogoDisplay({ collectionKey, title, className = '' }: LogoDisplayProps) {
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogos();
  }, [collectionKey]);

  const loadLogos = async () => {
    try {
      const response = await fetch(`/api/logos/collection/${collectionKey}`);
      const data = await response.json();
      setLogos(data.logos || []);
    } catch (error) {
      console.error('Failed to load logos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (logos.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {title && (
        <div className="text-center mb-8">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            {title}
          </h3>
        </div>
      )}
      
      <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap">
        {logos.map((logo) => (
          <div
            key={logo.logo_id}
            className="flex items-center justify-center h-12 md:h-16 transition-all"
          >
            <img
              src={logo.file_url}
              alt={logo.alt_text}
              className="max-h-full w-auto object-contain grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
              style={{ maxWidth: '140px' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

