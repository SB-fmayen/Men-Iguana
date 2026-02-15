'use client';

import dynamic from 'next/dynamic';

const WhatsappButton = dynamic(() => import('@/components/atoms/whatsapp-button').then(mod => ({ default: mod.WhatsappButton })), {
  loading: () => null,
});

export function FooterClient() {
  return <WhatsappButton />;
}
