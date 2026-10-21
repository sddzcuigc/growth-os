// Merge independent edits; keep a conflict whenever both devices changed a fact.
const copy = value => value === undefined ? undefined : structuredClone(value);
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);

export function contentOf(state) {
  if (!state) return state;
  const value = copy(state);
  delete value.current; // Selected child belongs to this device, not the family.
  return value;
}

export function mergeSnapshots(base, local, remote) {
  const conflicts = [];
  function merge(b, l, r, path) {
    if (equal(l, b)) return copy(r);
    if (equal(r, b)) return copy(l);
    // Counters can represent separate actions even when their new values match.
    if (typeof l === 'number' && typeof r === 'number' && /\.(xp|coins|gems|reviews|minutes|height)$/.test(path)) {
      conflicts.push(path);
      return copy(l);
    }
    if (equal(l, r)) return copy(l);
    if (object(l) && object(r) && (object(b) || b === undefined)) {
      const out = {};
      for (const key of new Set([...Object.keys(b || {}), ...Object.keys(l), ...Object.keys(r)])) {
        const value = merge(b?.[key], l[key], r[key], `${path}.${key}`);
        if (value !== undefined) Object.defineProperty(out, key, {value, enumerable:true, writable:true, configurable:true});
      }
      return out;
    }
    if (Array.isArray(l) && Array.isArray(r) && (Array.isArray(b) || b === undefined)) {
      const all = [...(b || []), ...l, ...r];
      const keyOf = all.every(x => object(x) && typeof x.id === 'string') ? x => x.id
        : all.every(x => object(x) && typeof x.clientEventId === 'string') ? x => x.clientEventId
        : all.every(x => object(x) && typeof x.at === 'string' && typeof x.skill === 'string') ? x => `${x.at}:${x.skill}` : null;
      if (keyOf && [b || [], l, r].every(a => new Set(a.map(keyOf)).size === a.length)) {
        const bm = new Map((b || []).map(x => [keyOf(x), x])), lm = new Map(l.map(x => [keyOf(x), x])), rm = new Map(r.map(x => [keyOf(x), x]));
        const out = [];
        for (const id of new Set([...r.map(keyOf), ...l.map(keyOf), ...(b || []).map(keyOf)])) {
          const value = merge(bm.get(id), lm.get(id), rm.get(id), `${path}[${id}]`);
          if (value !== undefined) out.push(value);
        }
        return out;
      }
      if (all.every(x => typeof x === 'string') && [b || [], l, r].every(a => new Set(a).size === a.length)) {
        return [...new Set([...r, ...l])].filter(id => merge((b || []).includes(id), l.includes(id), r.includes(id), `${path}[${id}]`));
      }
    }
    conflicts.push(path);
    return copy(l);
  }
  const state = merge(contentOf(base), contentOf(local), contentOf(remote), 'state');
  if (state && local?.current !== undefined) state.current = local.current;
  return {state, conflicts};
}

export function removeAcknowledged(queue, acknowledgedIds) {
  const ids = new Set(acknowledgedIds);
  return queue.filter(item => !ids.has(item.body?.clientEventId || item.clientEventId));
}
