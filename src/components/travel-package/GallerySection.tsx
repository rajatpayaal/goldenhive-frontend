"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";

import type { TravelPackageImage } from "@/components/travel-package/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/cn";

export function GallerySection({ images }: { images: TravelPackageImage[] }) {
  const [index, setIndex] = React.useState(0);

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  if (!images.length) return null;

  return (
    <Dialog>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-slate-900">Gallery</h2>
        <DialogTrigger>
          <Button variant="outline" className="hidden sm:inline-flex">
            <Maximize2 className="h-4 w-4" />
            Open lightbox
          </Button>
        </DialogTrigger>
      </div>

      <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-2">
        {images.map((img, i) => (
          <DialogTrigger key={img.url + i}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                "relative h-24 w-36 shrink-0 overflow-hidden rounded-2xl border bg-white shadow-sm",
                i === index ? "border-emerald-400 ring-2 ring-emerald-200" : "border-slate-200"
              )}
              aria-label={`Open image ${i + 1}`}
            >
              <Image
                src={img.url}
                alt={`Gallery image ${i + 1}`}
                fill
                className="object-cover"
                sizes="144px"
              />
            </button>
          </DialogTrigger>
        ))}
      </div>

      <DialogContent className="max-w-5xl bg-slate-950 p-0 text-white">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-white/10 px-4 py-3">
          <DialogTitle className="text-white">
            Image {index + 1} of {images.length}
          </DialogTitle>
          <DialogClose>
            <Button size="icon" variant="ghost" className="text-white hover:bg-white/10">
              <X className="h-5 w-5" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="relative aspect-[16/10] w-full">
          <Image
            src={images[index].url}
            alt={`Gallery image ${index + 1}`}
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 1024px"
            priority
          />

          <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-between px-3">
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/10"
              onClick={prev}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/10"
              onClick={next}
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

