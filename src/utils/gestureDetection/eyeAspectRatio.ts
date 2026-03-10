export function eyeAspectRatio(top: number, bottom: number, left: number, right: number) {
  const vertical = Math.abs(top - bottom);
  const horizontal = Math.abs(left - right);
  return horizontal > 0 ? vertical / horizontal : 0;
}
