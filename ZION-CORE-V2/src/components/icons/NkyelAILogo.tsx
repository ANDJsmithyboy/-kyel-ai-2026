import { SVGProps } from 'react';
import Image from 'next/image';

interface Nkyel AILogoProps {
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const Nkyel AILogo = ({ width = 24, height = 24, className, style }: Nkyel AILogoProps) => (
  <img
    src="/vrai-içone-pro-gaboma-ai2026.png"
    alt="Nkyel AI"
    width={width}
    height={height}
    className={className}
    style={{ ...style, objectFit: 'contain' }}
  />
);
