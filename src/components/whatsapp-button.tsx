'use client';

import { MessageCircle } from 'lucide-react';

export function WhatsappButton() {
  const phoneNumber = '50242872910'; // WhatsApp format: country code (502 Guatemala) + number without spaces
  const whatsappUrl = `https://wa.me/${phoneNumber}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
      aria-label="Contactar por WhatsApp"
      title="Contactar por WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
}
