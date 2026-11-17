'use client'

import { useState } from 'react'

type DeferredIframeProps = {
  src: string
  title?: string
  width?: number | string
  height?: number | string
  className?: string
  allowFullScreen?: boolean
}

export function DeferredIframe({
  src,
  title = 'Embedded interactive content',
  width = 640,
  height = 360,
  allowFullScreen = true,
}: DeferredIframeProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="my-8 w-full">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-neutral-950">
        {loaded ? (
          <iframe
            src={src}
            title={title}
            width={width}
            height={height}
            loading="lazy"
            allow="fullscreen; autoplay; picture-in-picture"
            allowFullScreen={allowFullScreen}
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setLoaded(true)}
            className="absolute inset-0 flex w-full flex-col items-center justify-center gap-3 px-6 text-center text-white transition-colors hover:bg-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"
            aria-label={`Load interactive content: ${title}`}
          >
            <span
              aria-hidden="true"
              className="flex h-14 w-14 items-center justify-center rounded-full border border-white/50 bg-white/10 text-2xl"
            >
              ▶
            </span>
            <span className="font-medium">Load interactive simulation</span>
            <span className="text-sm text-neutral-400">
              Loads the external demo only when you press play
            </span>
          </button>
        )}
      </div>
    </div>
  )
}
