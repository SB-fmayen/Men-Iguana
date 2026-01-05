import Image from 'next/image';

export function QrCode() {
  const menuUrl = "https://example.com/tecinteca-menu";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(menuUrl)}&qzone=1&color=000000&bgcolor=C0FF33&format=svg`;

  return (
    <section className="bg-black">
      <div className="container mx-auto py-16 px-4 text-center">
        <h2 className="font-headline font-bold italic text-4xl md:text-5xl text-primary mb-4">
          Ver en tu Dispositivo
        </h2>
        <p className="max-w-xl mx-auto mb-8 text-lg text-gray-300">
          Escanea el código QR con la cámara de tu teléfono para obtener el menú interactivo completo. No se requiere aplicación.
        </p>
        <div className="inline-block p-2 bg-primary rounded-xl shadow-lg">
           <div className="bg-primary rounded-lg">
            <Image
              src={qrCodeUrl}
              alt="QR code para ver el menú digital"
              width={180}
              height={180}
              className="rounded-md"
            />
           </div>
        </div>
      </div>
    </section>
  );
}
