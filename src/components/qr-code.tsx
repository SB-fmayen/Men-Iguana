import Image from 'next/image';

export function QrCode() {
  const menuUrl = "https://example.com/iguana-menu";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(menuUrl)}&qzone=1&color=000000&bgcolor=C0FF33&format=svg`;

  return (
    <section className="bg-black">
      <div className="container mx-auto py-16 px-4 text-center">
        <h2 className="font-headline font-bold italic text-4xl md:text-5xl text-primary mb-4">
          View on Your Device
        </h2>
        <p className="max-w-xl mx-auto mb-8 text-lg text-gray-300">
          Scan the QR code with your phone's camera to get the full interactive menu. No app required.
        </p>
        <div className="inline-block p-2 bg-primary rounded-xl shadow-lg">
           <div className="bg-primary rounded-lg">
            <Image
              src={qrCodeUrl}
              alt="QR code to view the digital menu"
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
