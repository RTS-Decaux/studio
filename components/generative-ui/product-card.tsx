"use client";

import { motion } from "framer-motion";
import { Package, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";

export type ProductData = {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  imageUrl?: string;
  inStock: boolean;
  category?: string;
  brand?: string;
};

export function ProductCard({ data }: { data: ProductData }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const discount = data.originalPrice
    ? Math.round(((data.originalPrice - data.price) / data.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="relative flex w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-lg"
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
    >
      {data.imageUrl && (
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          <img
            alt={data.name}
            className={`h-full w-full object-cover transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            src={data.imageUrl}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="h-12 w-12 animate-pulse text-muted-foreground" />
            </div>
          )}
          {discount > 0 && (
            <div className="absolute top-3 right-3 rounded-full bg-rose-500 px-3 py-1 font-bold text-sm text-white shadow-lg">
              -{discount}%
            </div>
          )}
          {!data.inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="rounded-full bg-white px-4 py-2 font-bold text-black text-sm">
                Out of Stock
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 p-4">
        {data.category && (
          <div className="font-medium text-primary text-xs">
            {data.category}
          </div>
        )}

        <div>
          <h3 className="line-clamp-2 font-bold text-foreground text-lg">
            {data.name}
          </h3>
          {data.brand && (
            <p className="mt-1 text-muted-foreground text-sm">{data.brand}</p>
          )}
        </div>

        <p className="line-clamp-2 text-muted-foreground text-sm">
          {data.description}
        </p>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-foreground text-sm">
              {data.rating.toFixed(1)}
            </span>
          </div>
          <span className="text-muted-foreground text-sm">
            ({data.reviewCount.toLocaleString()} reviews)
          </span>
        </div>

        <div className="flex items-end gap-2">
          <span className="font-bold text-2xl text-foreground">
            ${data.price.toFixed(2)}
          </span>
          {data.originalPrice && (
            <span className="mb-1 text-muted-foreground text-sm line-through">
              ${data.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        <button
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground text-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!data.inStock}
        >
          <ShoppingCart className="h-4 w-4" />
          {data.inStock ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </motion.div>
  );
}

export function ProductCardLoading() {
  return (
    <div className="flex w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-background">
      <div className="aspect-square w-full animate-pulse bg-muted" />
      <div className="flex flex-col gap-3 p-4">
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        <div className="h-6 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-8 w-28 animate-pulse rounded bg-muted" />
        <div className="h-12 w-full animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  );
}
