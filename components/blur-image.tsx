"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

/** Smooth image reveal for local catalogue, landing and detail photos. */
export function BlurImage({ className = "", onLoad, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  return <Image {...props} className={`${className} syrine-blur-image ${loaded ? "is-loaded" : ""}`}
    onLoad={event => { setLoaded(true); onLoad?.(event); }} />;
}
