// src/app/components/MagneticButton.tsx

"use client";

import { useRef } from 'react';
import { motion, useSpring } from 'framer-motion';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  href: string;
}

export default function MagneticButton({ children, className, href }: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  const springConfig = { stiffness: 150, damping: 20, mass: 0.1 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const mouseX = e.clientX - left;
    const mouseY = e.clientY - top;
    
    // El movimiento será un porcentaje de la distancia desde el centro
    const moveX = (mouseX - width / 2) * 0.4;
    const moveY = (mouseY - height / 2) * 0.4;
    
    x.set(moveX);
    y.set(moveY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
      className={className}
    >
      {children}
    </motion.a>
  );
}