"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductGallery({
  imagenes,
  nombre,
}: {
  imagenes: string[];
  nombre: string;
}) {
  const [activa, setActiva] = useState(0);
  const imagen = imagenes?.[activa];

  return (
    <div className="flex h-full flex-col">
      <div className="relative aspect-[4/5] min-h-64 flex-1 overflow-hidden bg-gradient-to-br from-muted to-card sm:aspect-auto sm:rounded-l-lg">
        {imagen ? (
          <Image
            src={imagen}
            alt={nombre}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Sin imagen
          </div>
        )}
      </div>
      {imagenes?.length > 1 && (
        <div className="flex flex-shrink-0 gap-2 p-3">
          {imagenes.map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => setActiva(i)}
              aria-label={`Ver imagen ${i + 1}`}
              className={`relative h-16 w-16 overflow-hidden rounded border ${
                i === activa ? "border-primary" : "border-border"
              }`}
            >
              <Image src={img} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
