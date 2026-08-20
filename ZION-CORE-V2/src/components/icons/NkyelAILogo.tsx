import { SVGProps } from 'react';
import Image from 'next/image';

interface NkyelAILogoProps {
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const NkyelAILogo = ({ width = 24, height = 24, className, style }: NkyelAILogoProps) => (
  <img
    src="/nkyel-ai.svg"
    alt="Nkyel AI"
    width={width}
    height={height}
    className={className}
    style={{ ...style, objectFit: 'contain' }}
  />
);

