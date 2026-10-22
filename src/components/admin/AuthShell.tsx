// Navy full-screen frame of the sign-in, "forgot password" and "new password" pages.
export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative grid min-h-svh place-items-center overflow-hidden bg-ink px-5 py-16">
      <span aria-hidden className="absolute inset-y-0 left-0 w-2 bg-brand sm:w-3" />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-size-[22px_22px]"
      />
      <svg aria-hidden viewBox="0 0 600 600" className="absolute -right-56 -top-56 size-176">
        {[140, 220, 300].map((r) => (
          <circle key={r} cx="300" cy="300" r={r} fill="none" stroke="white" strokeOpacity="0.07" />
        ))}
      </svg>
      <div className="relative w-full max-w-md">
        <p className="text-center text-4xl font-black tracking-[-0.04em]">
          <span className="text-white">DSA</span>
          <span className="text-brand">Talks</span>
        </p>
        <p className="mt-2 text-center text-xs font-bold uppercase tracking-[0.35em] text-white/60">Yönetim Paneli</p>
        <div className="mt-8 rounded-3xl bg-white p-7 shadow-2xl shadow-black/30 sm:p-9">{children}</div>
      </div>
    </div>
  );
}
