interface PhotoLightboxProps {
  photoUrl: string
  onClose: () => void
}

export function PhotoLightbox({ photoUrl, onClose }: PhotoLightboxProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo du ticket en grand"
      onClick={onClose}
      className="fixed inset-0 z-9999 flex items-center justify-center bg-ink/85 p-4"
    >
      <button
        aria-label="Fermer"
        onClick={onClose}
        className="absolute right-4 top-4 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-white/15 text-white"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="h-5 w-5">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <img
        src={photoUrl}
        alt="Ticket de caisse en grand"
        onClick={(e) => e.stopPropagation()}
        className="max-h-full max-w-full rounded-2xl object-contain shadow-[0_10px_40px_rgba(0,0,0,0.4)]"
      />
    </div>
  )
}
