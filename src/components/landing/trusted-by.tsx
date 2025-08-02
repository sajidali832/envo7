
import Image from 'next/image';

const logos = [
  { src: 'https://placehold.co/150x60.png', alt: 'Company 1', hint: 'logo abstract' },
  { src: 'https://placehold.co/150x60.png', alt: 'Company 2', hint: 'logo abstract' },
  { src: 'https://placehold.co/150x60.png', alt: 'Company 3', hint: 'logo technology' },
  { src: 'https://placehold.co/150x60.png', alt: 'Company 4', hint: 'logo finance' },
  { src: 'https://placehold.co/150x60.png', alt: 'Company 5', hint: 'logo business' },
  { src: 'https://placehold.co/150x60.png', alt: 'Company 6', hint: 'logo consulting' },
];

export function TrustedBySection() {
  const extendedLogos = [...logos, ...logos]; 

  return (
    <section className="py-12 bg-secondary/50">
      <div className="container px-4">
        <h3 className="text-center text-lg font-semibold text-muted-foreground mb-8">
          Trusted by leading companies in Pakistan
        </h3>
        <div className="relative w-full overflow-hidden">
          <div className="flex animate-slide-in">
            {extendedLogos.map((logo, index) => (
              <div key={index} className="flex-shrink-0 mx-4 sm:mx-8">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={120}
                  height={48}
                  data-ai-hint={logo.hint}
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
