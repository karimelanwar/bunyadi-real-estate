// The wordmark is an SVG, so next/image would add nothing (no raster sizes to
// generate) while requiring `dangerouslyAllowSVG` — hence the plain <img>, and
// the single eslint suppression here instead of one per call site.
//
// width/height are the SVG's own 2028x357 aspect ratio reduced to round
// numbers: they only fix the box shape, since every call site sets the real
// size with a height class plus `w-auto`. Getting them wrong reintroduces the
// letterboxing this replaced, so they live in one place.
export default function Logo({
  className = "",
  priority = false,
  /** Renders the green mark white, for use on the dark brand background. */
  onDark = false,
}: {
  className?: string;
  priority?: boolean;
  onDark?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.svg"
      alt="Bunyadi Real Estate"
      width={576}
      height={100}
      {...(priority ? { fetchPriority: "high" as const } : {})}
      className={["w-auto object-contain", onDark && "brightness-0 invert", className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
