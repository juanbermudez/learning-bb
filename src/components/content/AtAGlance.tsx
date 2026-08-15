export function AtAGlance({ items }: { items: readonly string[] }) {
  return <section className="at-a-glance" aria-labelledby="at-a-glance-title"><div id="at-a-glance-title" className="at-a-glance__label">At a glance</div><ul>{items.slice(0, 3).map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul></section>
}
