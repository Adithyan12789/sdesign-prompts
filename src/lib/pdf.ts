/** Minimal, dependency-free PDF writer: wraps plain text into a valid
 *  multi-page PDF (Helvetica). Used for generated guide documents. */
function escapePdfText(s: string) {
  return s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function wrap(text: string, width: number): string[] {
  const out: string[] = [];
  for (const raw of text.split('\n')) {
    if (!raw.trim()) { out.push(''); continue; }
    let line = '';
    for (const word of raw.split(/\s+/)) {
      if ((line + ' ' + word).trim().length > width) { out.push(line.trim()); line = word; }
      else line += ' ' + word;
    }
    if (line.trim()) out.push(line.trim());
  }
  return out;
}

export function makePdf(title: string, body: string): Buffer {
  const linesPerPage = 46;
  const lines = wrap(body, 92);
  const pages: string[][] = [];
  for (let i = 0; i < lines.length; i += linesPerPage) pages.push(lines.slice(i, i + linesPerPage));
  if (!pages.length) pages.push([]);

  const objects: string[] = [];
  const fontId = 3;
  let nextId = 4;
  const pageIds: number[] = [];
  const contentIds: number[] = [];
  pages.forEach(() => { pageIds.push(nextId++); contentIds.push(nextId++); });

  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`;
  objects[fontId] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';

  pages.forEach((pageLines, i) => {
    objects[pageIds[i]] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentIds[i]} 0 R >>`;
    const ops: string[] = ['BT', '/F1 20 Tf', '56 786 Td', `(${escapePdfText(title.slice(0, 60))}) Tj`, '/F1 10.5 Tf', '0 -26 Td'];
    for (const line of pageLines) { ops.push(`(${escapePdfText(line)}) Tj`, '0 -15 Td'); }
    ops.push('ET');
    const stream = ops.join('\n');
    objects[contentIds[i]] = `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`;
  });

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  const maxId = Math.max(...pageIds, ...contentIds, fontId, 2);
  for (let id = 1; id <= maxId; id++) {
    if (!objects[id]) continue;
    offsets[id] = Buffer.byteLength(pdf);
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xrefPos = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${maxId + 1}\n0000000000 65535 f \n`;
  for (let id = 1; id <= maxId; id++) {
    pdf += `${String(offsets[id] ?? 0).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${maxId + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
  return Buffer.from(pdf, 'latin1');
}
