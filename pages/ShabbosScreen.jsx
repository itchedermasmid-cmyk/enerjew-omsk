import React from 'react';
import { motion } from 'framer-motion';
import { formatDateTime } from '@/lib/campaign';

export default function ShabbosScreen({ closurePeriod }) {
  const endTime = closurePeriod?.end_time ? formatDateTime(closurePeriod.end_time) : '';
  const customMessage = closurePeriod?.custom_message;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/20 via-background to-primary/10 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-sm"
      >
        {/* Candle icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-secondary/20 rounded-full flex items-center justify-center">
            <span className="text-5xl">🕯️</span>
          </div>
        </div>

        <h1 className="text-3xl font-display font-bold text-foreground mb-4">
          Закрыто на Шаббат
        </h1>
        
        <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
          {customMessage || 'Приложение откроется после окончания Шаббата.'}
        </p>

        {endTime && (
          <div className="bg-card rounded-2xl p-4 shadow-sm border mb-6">
            <p className="text-sm text-muted-foreground mb-1">Откроется</p>
            <p className="text-lg font-semibold text-foreground">{endTime}</p>
          </div>
        )}

        <p className="text-2xl font-display font-bold text-primary hebrew-text">
          שבת שלום!
        </p>
        <p className="text-lg text-muted-foreground mt-2">
          Шаббат шалом!
        </p>
      </motion.div>
    </div>
  );
}