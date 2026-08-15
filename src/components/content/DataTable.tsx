import type { ReactNode } from 'react'

export function DataTable({ caption, headers, rows }: { caption: string; headers: readonly string[]; rows: readonly (readonly ReactNode[])[] }) {
  return <div className="data-table"><div className="data-table__scroll" tabIndex={0} role="region" aria-label={`${caption}; scroll horizontally`}><table><caption>{caption}</caption><thead><tr>{headers.map((header) => <th key={header} scope="col">{header}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div><div className="data-table__hint">Scroll table horizontally if needed.</div></div>
}
