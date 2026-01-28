'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const toRadians = (deg: number) => deg * Math.PI / 180;
const map = (val: number, a1: number, a2: number, b1: number, b2: number) => 
  b1 + (val - a1) * (b2 - b1) / (a2 - a1);

class Pizza {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  sliceCount: number;
  sliceSize: number;
  width: number;
  height: number;
  center: number;
  sliceDegree: number;
  sliceRadians: number;
  progress: number;
  cooldown: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    this.sliceCount = 6;
    this.sliceSize = 80;

    this.width = this.height = this.canvas.height = this.canvas.width = this.sliceSize * 2 + 50;
    this.center = this.height / 2 | 0;

    this.sliceDegree = 360 / this.sliceCount;
    this.sliceRadians = toRadians(this.sliceDegree);
    this.progress = 0;
    this.cooldown = 10;
  }

  update() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    if (--this.cooldown < 0) this.progress += this.sliceRadians * 0.01 + this.progress * 0.07;

    ctx.save();
    ctx.translate(this.center, this.center);
    
    for (let i = this.sliceCount - 1; i > 0; i--) {
      let rad;
      if (i === this.sliceCount - 1) {
        const ii = this.sliceCount - 1;
        rad = this.sliceRadians * i + this.progress;

        ctx.strokeStyle = '#FBC02D';
        this.cheese(ctx, rad, .9, ii);
        this.cheese(ctx, rad, .6, ii);
        this.cheese(ctx, rad, .5, ii);
        this.cheese(ctx, rad, .3, ii);
      } else {
        rad = this.sliceRadians * i;
      }
      
      // border
      ctx.beginPath();
      ctx.lineCap = 'butt';
      ctx.lineWidth = 11;
      ctx.arc(0, 0, this.sliceSize, rad, rad + this.sliceRadians);
      ctx.strokeStyle = '#F57F17';
      ctx.stroke();

      // slice
      const startX = this.sliceSize * Math.cos(rad);
      const startY = this.sliceSize * Math.sin(rad);
      ctx.fillStyle = '#FBC02D';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(startX, startY);
      ctx.arc(0, 0, this.sliceSize, rad, rad + this.sliceRadians);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.lineWidth = .3;
      ctx.stroke();

      // meat
      const x = this.sliceSize * .65 * Math.cos(rad + this.sliceRadians / 2);
      const y = this.sliceSize * .65 * Math.sin(rad + this.sliceRadians / 2);
      ctx.beginPath();
      ctx.arc(x, y, this.sliceDegree / 6, 0, 2 * Math.PI);
      ctx.fillStyle = '#D84315';
      ctx.fill();
    }

    ctx.restore();

    if (this.progress > this.sliceRadians) {
      ctx.translate(this.center, this.center);
      ctx.rotate(-this.sliceDegree * Math.PI / 180);
      ctx.translate(-this.center, -this.center);

      this.progress = 0;
      this.cooldown = 20;
    }
  }

  cheese(ctx: CanvasRenderingContext2D, rad: number, multi: number, ii: number) {
    const x1 = this.sliceSize * multi * Math.cos(toRadians(ii * this.sliceDegree) - .2);
    const y1 = this.sliceSize * multi * Math.sin(toRadians(ii * this.sliceDegree) - .2);
    const x2 = this.sliceSize * multi * Math.cos(rad + .2);
    const y2 = this.sliceSize * multi * Math.sin(rad + .2);

    const csx = this.sliceSize * Math.cos(rad);
    const csy = this.sliceSize * Math.sin(rad);

    const d = Math.sqrt((x1 - csx) * (x1 - csx) + (y1 - csy) * (y1 - csy));
    ctx.beginPath();
    ctx.lineCap = 'round';

    const percentage = map(d, 15, 70, 1.2, 0.2);

    let tx = x1 + (x2 - x1) * percentage;
    let ty = y1 + (y2 - y1) * percentage;
    ctx.moveTo(x1, y1);
    ctx.lineTo(tx, ty);

    tx = x2 + (x1 - x2) * percentage;
    ty = y2 + (y1 - y2) * percentage;
    ctx.moveTo(x2, y2);
    ctx.lineTo(tx, ty);

    ctx.lineWidth = map(d, 0, 100, 20, 2);
    ctx.stroke();
  }
}

export function PizzaPreloader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pizzaRef = useRef<Pizza | null>(null);
  const animationRef = useRef<number>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (canvasRef.current) {
      pizzaRef.current = new Pizza(canvasRef.current);

      const update = () => {
        if (pizzaRef.current) {
          pizzaRef.current.update();
          animationRef.current = requestAnimationFrame(update);
        }
      };

      update();
    }

    // Hide preloader after initial load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-black"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ 
              scale: 1, 
              rotate: 0,
              filter: [
                'drop-shadow(0 0 0px rgba(251, 192, 45, 0))',
                'drop-shadow(0 0 30px rgba(251, 192, 45, 0.6))',
                'drop-shadow(0 0 20px rgba(251, 192, 45, 0.4))'
              ]
            }}
            transition={{ 
              duration: 0.8, 
              ease: [0.34, 1.56, 0.64, 1],
              filter: {
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse'
              }
            }}
          >
            <canvas ref={canvasRef} id="pizza" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-center"
          >
            <motion.h2 
              className="text-2xl font-bold text-white mb-2"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Shukos y Pizza La Iguana
            </motion.h2>
            <motion.p
              className="text-yellow-400 text-sm"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Preparando tu menú...
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
