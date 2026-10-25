"use client";
import Image from "next/image";
import { Globe2 } from "lucide-react";
import { useState } from "react";
import { faviconSources } from "@/lib/favicon";

function FaviconImage({ sources, className }: { sources: string[]; className: string }) {
  const [index, setIndex] = useState(0);
  if (index >= sources.length) return <Globe2 className={className} aria-hidden="true" />;
  return <Image unoptimized src={sources[index]} width={32} height={32} alt="" aria-hidden="true" className={"object-contain " + className} referrerPolicy="no-referrer" onError={() => setIndex((current) => current + 1)} />;
}

export function SiteFavicon({ url, className = "size-6" }: { url: string; className?: string }) {
  const sources = faviconSources(url);
  return <FaviconImage key={sources[0] || "invalid"} sources={sources} className={className} />;
}
