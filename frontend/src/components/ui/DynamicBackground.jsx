import React from 'react'

export default function DynamicBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
      aria-hidden="true"
    >
      {/* Dynamic Animated Aurora Color Orbs (Mesh Gradient) */}
      <div className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full bg-gradient-to-br from-blue-400/25 via-indigo-400/20 to-transparent dark:from-blue-600/15 dark:via-indigo-600/10 blur-[90px] animate-aurora-1 will-change-transform" />

      <div className="absolute top-[20%] -right-[10%] w-[50vw] h-[50vw] max-w-[650px] max-h-[650px] rounded-full bg-gradient-to-bl from-emerald-400/25 via-teal-300/15 to-transparent dark:from-emerald-600/15 dark:via-teal-600/10 blur-[100px] animate-aurora-2 will-change-transform" />

      <div className="absolute -bottom-[15%] left-[20%] w-[60vw] h-[60vw] max-w-[750px] max-h-[750px] rounded-full bg-gradient-to-tr from-purple-400/20 via-violet-300/15 to-transparent dark:from-purple-600/15 dark:via-violet-600/10 blur-[100px] animate-aurora-3 will-change-transform" />

      <div className="absolute top-[50%] left-[45%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-gradient-to-r from-amber-300/15 via-rose-300/10 to-transparent dark:from-amber-600/10 dark:via-rose-600/5 blur-[85px] animate-aurora-4 will-change-transform" />

      {/* Subtle CAD Garment Weave Dot Grid Texture Overlay */}
      <div
        className="absolute inset-0 opacity-[0.25] dark:opacity-[0.12]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #64748b 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Fine Linear Weave Gridlines */}
      <div
        className="absolute inset-0 opacity-[0.08] dark:opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #3b82f6 1px, transparent 1px), linear-gradient(to bottom, #3b82f6 1px, transparent 1px)',
          backgroundSize: '96px 96px',
        }}
      />
    </div>
  )
}
