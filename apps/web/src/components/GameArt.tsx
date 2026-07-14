"use client";

import { useState, type ReactNode } from "react";

export function GameArt({
  src,
  alt,
  fallback,
  className,
  imgClassName,
}: {
  src: string | null;
  alt: string;
  fallback: ReactNode;
  className?: string;
  imgClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = src !== null && !failed;

  return (
    <div className={className}>
      {showImage ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className={imgClassName ?? "h-full w-full object-cover"}
        />
      ) : (
        fallback
      )}
    </div>
  );
}
