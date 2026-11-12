/**
 * The guard system map as a motif: the five nodes and five edges of
 * GuardSystemMap, drawn at hairline weight in the current text colour and
 * nothing else — no key, no labels, no interaction.
 *
 * It is decoration, so it is `aria-hidden` and carries no meaning the page
 * does not state in text. The real, keyboard-reachable map lives on the home
 * page. Keep the geometry identical to GuardSystemMap so the motif reads as
 * the same drawing seen from further away.
 *
 * Paint with `text-*` and `opacity-*` on the parent; strokes use currentColor.
 */
const NODES: ReadonlyArray<readonly [number, number]> = [
  [132, 92],
  [330, 212],
  [132, 332],
  [530, 104],
  [530, 320],
];

const EDGES: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [2, 1],
  [1, 3],
  [1, 4],
  [0, 2],
];

const RADIUS = 28;

export function SystemMapMotif({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 660 420"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
    >
      {EDGES.map(([a, b]) => {
        const [x1, y1] = NODES[a]!;
        const [x2, y2] = NODES[b]!;
        return <line key={`${a}-${b}`} x1={x1} y1={y1} x2={x2} y2={y2} />;
      })}
      {NODES.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={RADIUS} />
      ))}
    </svg>
  );
}
