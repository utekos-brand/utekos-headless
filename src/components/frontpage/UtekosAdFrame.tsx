export default function UtekosAdFrame() {
  return (
    <article className="grid grid-cols-1 md:grid-cols-12 min-h-[80vh] w-full overflow-hidden bg-(--brand-maritime) text-(--brand-light) font-sans">
      
      {/* TYPOGRAFI SOM ARKITEKTUR & MASSIV FARGEBLOKK (66% av skjermen)
        Her dominerer merkevarefargen og skrifttypen umiddelbart (Share of Screen).
      */}
      <div className="md:col-span-8 flex flex-col justify-between p-8 md:p-16 lg:p-24 z-10">
        <header className="flex flex-col gap-6">
          {/* Gigantisk, overdimensjonert typografi for umiddelbar gjenkjennelse i scrollen */}
          <h1 className="text-7xl md:text-9xl font-black leading-none tracking-tighter uppercase break-words">
            Utekos<br />Original.
          </h1>
          <p className="text-xl md:text-3xl max-w-2xl font-medium leading-relaxed opacity-90">
            Norsk ekstremkomfort. Konstruert for å tåle elementene, designet for å dominere stillheten.
          </p>
        </header>
        
        {/* Kontrastmarkør / Call to action - Geometrisk og brutalistisk */}
        <div className="mt-12">
          <a 
            href="/produkter/original" 
            className="inline-flex items-center justify-center px-10 py-6 bg-(--brand-light) text-(--brand-maritime) font-bold text-lg md:text-xl hover:opacity-90 transition-opacity focus:ring-4 focus:ring-offset-4 focus:ring-(--brand-light) focus:outline-hidden"
            aria-label="Kjøp Utekos Original"
          >
            Utforsk Stadionjakken
          </a>
        </div>
      </div>

      {/* MAKROFORMAT / "HERO PRODUCT" (33% av skjermen)
        Fastlåst proporsjon som alltid viser tekstur eller et massivt utsnitt.
      */}
      <figure className="md:col-span-4 relative min-h-[400px] md:h-full w-full bg-gray-200 border-t-8 md:border-t-0 md:border-l-8 border-(--brand-light) shrink-0">
        {/* Bilde-placeholder. 
          Regel: Ikke vis hele jakken. Zoom inn på glidelåsen, CloudWeave-fyllet eller en strukturell søm slik at teksturen blir nesten abstrakt stor. 
        */}
        <div className="absolute inset-0 flex items-center justify-center p-8 bg-gray-300">
          <span className="text-gray-700 font-bold text-center p-4">
            [Makro-bilde av Stadionjakke-detalj]
          </span>
        </div>
      </figure>

    </article>
  );
}