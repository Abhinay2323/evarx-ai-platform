// Subtle gradient blobs in the corners of the app background — the same
// aesthetic as the marketing site, just dialed down.
export function BackgroundGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -top-40 left-1/4 h-[420px] w-[420px] rounded-full bg-helix-500/10 blur-[120px]" />
      <div className="absolute right-0 top-1/3 h-[360px] w-[360px] rounded-full bg-plasma-500/10 blur-[120px]" />
      <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-helix-400/5 blur-[100px]" />
    </div>
  );
}
