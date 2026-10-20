export interface DiffLine {
  kind: 'same' | 'added' | 'removed';
  text: string;
}

export function diffLines(previous: string, current: string): DiffLine[] {
  if (!previous) return current.split('\n').map((text) => ({ kind: 'added', text }));
  const before = previous.split('\n');
  const after = current.split('\n');

  if (before.length * after.length > 100_000) {
    return [
      ...before.map((text) => ({ kind: 'removed' as const, text })),
      ...after.map((text) => ({ kind: 'added' as const, text })),
    ];
  }

  const columns = after.length + 1;
  const lengths = new Uint32Array((before.length + 1) * columns);
  for (let i = before.length - 1; i >= 0; i -= 1) {
    for (let j = after.length - 1; j >= 0; j -= 1) {
      const index = i * columns + j;
      lengths[index] = before[i] === after[j]
        ? lengths[(i + 1) * columns + j + 1] + 1
        : Math.max(lengths[(i + 1) * columns + j], lengths[i * columns + j + 1]);
    }
  }

  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < before.length && j < after.length) {
    if (before[i] === after[j]) {
      result.push({ kind: 'same', text: before[i] });
      i += 1;
      j += 1;
    } else if (lengths[(i + 1) * columns + j] >= lengths[i * columns + j + 1]) {
      result.push({ kind: 'removed', text: before[i] });
      i += 1;
    } else {
      result.push({ kind: 'added', text: after[j] });
      j += 1;
    }
  }
  while (i < before.length) result.push({ kind: 'removed', text: before[i++] });
  while (j < after.length) result.push({ kind: 'added', text: after[j++] });
  return result;
}
