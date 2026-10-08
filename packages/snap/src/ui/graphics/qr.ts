import qrcode from 'qrcode-generator';

const DARK = '#121314';

/**
 * QR code in a softer style: round dots, rounded finder patterns, a rounded
 * white card and a real quiet zone. Always dark-on-white so every scanner
 * reads it, whatever the wallet theme.
 *
 * @param text - Content to encode.
 * @param displaySize - Rendered size in px.
 * @returns SVG markup.
 */
export function qrSvg(text: string, displaySize = 200): string {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();

  const count = qr.getModuleCount();
  const margin = 3; // quiet zone, in modules
  const cell = 10;
  const size = (count + margin * 2) * cell;
  const at = (index: number) => (index + margin) * cell;

  const inFinder = (row: number, col: number) =>
    (row < 7 && col < 7) || (row < 7 && col >= count - 7) || (row >= count - 7 && col < 7);

  const dots: string[] = [];
  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (qr.isDark(row, col) && !inFinder(row, col)) {
        dots.push(`<circle cx="${at(col) + cell / 2}" cy="${at(row) + cell / 2}" r="${cell * 0.43}"/>`);
      }
    }
  }

  const finder = (row: number, col: number) => {
    const x = at(col);
    const y = at(row);
    return (
      `<rect x="${x}" y="${y}" width="${cell * 7}" height="${cell * 7}" rx="${cell * 2.2}" fill="${DARK}"/>` +
      `<rect x="${x + cell}" y="${y + cell}" width="${cell * 5}" height="${cell * 5}" rx="${cell * 1.6}" fill="#ffffff"/>` +
      `<rect x="${x + cell * 2}" y="${y + cell * 2}" width="${cell * 3}" height="${cell * 3}" rx="${cell}" fill="${DARK}"/>`
    );
  };

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${displaySize}" height="${displaySize}" viewBox="0 0 ${size} ${size}">` +
    `<rect width="${size}" height="${size}" rx="${cell * 3}" fill="#ffffff"/>` +
    `<g fill="${DARK}">${dots.join('')}</g>` +
    finder(0, 0) +
    finder(0, count - 7) +
    finder(count - 7, 0) +
    `</svg>`
  );
}
