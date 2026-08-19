import { cn } from "@/lib/cn";

type Props = {
  size?: number;
  variant?: "light" | "dark";
  className?: string;
};

/**
 * Brand glyph — the user's two-color M.
 * We render the PNG at the requested size. The dark variant
 * is black-on-transparent for places where we draw on a light surface.
 */
export function BrandGlyph({ size = 24, variant = "light", className }: Props) {
  const file =
    size <= 20
      ? "/favicon-32.png"
      : size <= 64
      ? "/glyph-light-256.png"
      : size <= 256
      ? "/glyph-light-512.png"
      : "/glyph-light-1024.png";
  return (
    <img
      src={file}
      alt="Meridian"
      width={size}
      height={size}
      className={cn("inline-block select-none", className)}
      draggable={false}
      // Use SVG when available (sharper at all sizes); fall back to PNG.
      onError={(e) => {
        const img = e.currentTarget as HTMLImageElement;
        if (img.src.endsWith(".png")) img.src = variant === "dark" ? "/glyph.svg" : "/glyph.svg";
      }}
      style={{
        filter: variant === "dark" ? "invert(1)" : undefined,
      }}
    />
  );
}
