export function LogoCloud() {
  return (
    <section className="relative border-y border-white/10 bg-ink-900/40 py-12">
      <div className="container-px">
        <p className="text-center text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
          Recognised by
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-5 sm:gap-8">
          <PartnerLogo
            src="/lilly-logo.png"
            alt="Eli Lilly"
            caption="SLM provider"
          />
          <span className="hidden h-10 w-px bg-white/10 sm:inline-block" />
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
    <div className="flex flex-col items-center gap-2.5">
      <div className="flex h-14 items-center justify-center rounded-2xl border border-white/10 bg-ink-800/60 px-6 py-2 backdrop-blur transition hover:border-white/20 hover:bg-ink-800/80">
        <img
          src={src}
          alt={alt}
          className="h-8 w-auto select-none object-contain"
          draggable={false}
        />
      </div>
      <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">
        {caption}
      </span>
    </div>
  );
}
