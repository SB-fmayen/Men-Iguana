'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  fullWidth?: boolean;
}

export function ScrollReveal({ 
  children, 
  delay = 0, 
  direction = 'up',
  fullWidth = false 
}: ScrollRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={fullWidth ? 'w-full' : ''}
    >
      {children}
    </motion.div>
  );
}
