export function LogoCloud() {
  return (
    <section className="relative border-y border-white/10 bg-ink-900/40 py-12">
      <div className="container-px">
        <p className="text-center text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
          Recognised by
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          <PartnerLogo
            src="/lilly-logo.png"
            alt="Eli Lilly"
            caption="SLM provider"
          />
          <span className="hidden h-8 w-px bg-white/10 sm:inline-block" />
          <PartnerLogo
            src="/thub-logo.png"
            alt="T-Hub"
            caption="Accelerator finalist"
          />
        </div>
      </div>
    </section>
  );
}

function PartnerLogo({
  src,
  alt,
  caption
}: {
  src: string;
  alt: string;
  caption: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex h-14 items-center justify-center rounded-xl bg-white px-5 py-2 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)]">
        <img src={src} alt={alt} className="h-9 w-auto object-contain" />
      </div>
      <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">
        {caption}
      </span>
    </div>
  );
}
