import { createCanvas, GlobalFonts, loadImage, type SKRSContext2D } from '@napi-rs/canvas';
import { writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { config } from '../config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FONT_DIR = join(__dirname, '..', '..', 'assets', 'fonts');

let fontsLoaded = false;

function loadFonts(): void {
  if (fontsLoaded) return;
  try {
    GlobalFonts.registerFromPath(join(FONT_DIR, 'PlayfairDisplay.ttf'), 'Playfair');
    GlobalFonts.registerFromPath(join(FONT_DIR, 'CormorantGaramond.ttf'), 'Cormorant');
    GlobalFonts.registerFromPath(join(FONT_DIR, 'GreatVibes.ttf'), 'GreatVibes');
    GlobalFonts.registerFromPath(join(FONT_DIR, 'Marcellus.ttf'), 'Marcellus');
    fontsLoaded = true;
  } catch (error) {
    console.warn('[card] font load failed:', error instanceof Error ? error.message : error);
  }
}

export type CardSpec = {
  heading: string;
  subheading?: string;
  width?: number;
  height?: number;
  theme?: 'gold-maroon' | 'gold-navy';
  style?: 'script' | 'serif';
  emojiGlyph?: 'diya' | 'star' | 'none';
};

const THEMES = {
  'gold-maroon': {
    bg: '#34111a',
    bgDeep: '#150609',
    gold: '#e8c079',
    goldBright: '#f9e7b6',
    goldDark: '#a67a35',
    accent: 'rgba(232,192,121,0.9)',
  },
  'gold-navy': {
    bg: '#232544',
    bgDeep: '#10111f',
    gold: '#dfba6a',
    goldBright: '#f7e4b0',
    goldDark: '#9d7a34',
    accent: 'rgba(223,186,106,0.9)',
  },
} as const;

export async function composeCard(spec: CardSpec, backgroundPath: string | null): Promise<string> {
  loadFonts();

  const width = spec.width ?? 1080;
  const height = spec.height ?? 1350;
  const theme = THEMES[spec.theme ?? 'gold-navy'];
  const style = spec.style ?? 'script';

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  paintBackground(ctx, width, height, theme);

  if (backgroundPath) {
    try {
      const img = await loadImage(backgroundPath);
      ctx.save();
      ctx.globalAlpha = 0.42;
      drawCover(ctx, img, width, height);
      ctx.restore();
      const veil = ctx.createRadialGradient(
        width / 2,
        height * 0.45,
        width * 0.1,
        width / 2,
        height * 0.45,
        width * 0.75,
      );
      veil.addColorStop(0, 'rgba(10,10,20,0.18)');
      veil.addColorStop(1, 'rgba(10,10,20,0.72)');
      ctx.fillStyle = veil;
      ctx.fillRect(0, 0, width, height);
    } catch {
      // keep gradient background
    }
  }

  drawMandala(ctx, width / 2, height * 0.43, width * 0.36, theme);
  drawBorder(ctx, width, height, theme);
  drawCornerFlourish(ctx, width, height, theme);

  const headingFont = style === 'script' ? 'GreatVibes' : 'Playfair';
  const headingLines = splitHeading(spec.heading, style);
  const longest = headingLines.reduce((a, b) => (a.length >= b.length ? a : b), '');
  const headingSize = fitFontSize(
    ctx,
    longest,
    width * 0.72,
    headingFont,
    style === 'script' ? 250 : 170,
    70,
  );
  const lineGap = headingSize * (style === 'script' ? 0.78 : 0.92);
  const totalHeight = headingSize + lineGap * (headingLines.length - 1);
  const blockTop = height * 0.34;
  const headingY = blockTop + totalHeight / 2 - headingSize * 0.12;

  if (spec.emojiGlyph !== 'none') {
    drawFlame(ctx, width / 2, blockTop - headingSize * 0.3, headingSize * 0.26, theme);
  }

  headingLines.forEach((line, i) => {
    const y = headingY + (i - (headingLines.length - 1) / 2) * lineGap;
    drawGoldText(
      ctx,
      line,
      width / 2,
      y,
      `${style === 'script' ? '' : '600 '}${headingSize}px ${headingFont}`.trim(),
      theme,
    );
  });

  if (spec.subheading) {
    const subSize = Math.round(Math.min(headingSize * 0.15, 32));
    const lines = wrapText(ctx, spec.subheading, width * 0.74, `300 ${subSize}px Cormorant`);
    const startY = blockTop + totalHeight + subSize * 1.4;
    const lineHeight = subSize * 1.65;

    lines.forEach((line, i) => {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `300 ${subSize}px Cormorant`;
      ctx.fillStyle = theme.gold;
      ctx.globalAlpha = 0.92;
      ctx.fillText(line, width / 2, startY + i * lineHeight);
      ctx.restore();
    });
  }

  const filename = `card-${randomUUID()}.png`;
  await writeFile(join(config.publicMediaDir, filename), await canvas.encode('png'));
  return filename;
}

function paintBackground(
  ctx: SKRSContext2D,
  width: number,
  height: number,
  theme: (typeof THEMES)[keyof typeof THEMES],
): void {
  const grad = ctx.createRadialGradient(
    width / 2,
    height * 0.4,
    width * 0.05,
    width / 2,
    height * 0.55,
    height * 0.9,
  );
  grad.addColorStop(0, theme.bg);
  grad.addColorStop(1, theme.bgDeep);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

function drawCover(
  ctx: SKRSContext2D,
  img: { width: number; height: number },
  width: number,
  height: number,
): void {
  const scale = Math.max(width / img.width, height / img.height);
  ctx.drawImage(img as never, (width - img.width * scale) / 2, (height - img.height * scale) / 2, img.width * scale, img.height * scale);
}

function drawMandala(
  ctx: SKRSContext2D,
  cx: number,
  cy: number,
  radius: number,
  theme: (typeof THEMES)[keyof typeof THEMES],
): void {
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.strokeStyle = theme.gold;
  ctx.translate(cx, cy);

  for (let ring = 0; ring < 3; ring++) {
    const r = radius * (0.62 + ring * 0.19);
    ctx.lineWidth = ring === 0 ? 1.6 : 1;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();

    const petals = ring === 0 ? 16 : ring === 1 ? 24 : 32;
    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2;
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.quadraticCurveTo(r * 0.045, -r * 1.09, 0, -r * 1.16);
      ctx.quadraticCurveTo(-r * 0.045, -r * 1.09, 0, -r);
      ctx.stroke();
      ctx.restore();
    }
  }

  ctx.restore();
}

function drawBorder(
  ctx: SKRSContext2D,
  width: number,
  height: number,
  theme: (typeof THEMES)[keyof typeof THEMES],
): void {
  const outer = 34;
  const inner = outer + 14;

  ctx.save();
  ctx.strokeStyle = theme.gold;
  ctx.globalAlpha = 0.9;
  ctx.lineWidth = 2.4;
  roundedRect(ctx, outer, outer, width - outer * 2, height - outer * 2, 18);
  ctx.stroke();

  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 1.1;
  roundedRect(ctx, inner, inner, width - inner * 2, height - inner * 2, 14);
  ctx.stroke();
  ctx.restore();
}

function drawCornerFlourish(
  ctx: SKRSContext2D,
  width: number,
  height: number,
  theme: (typeof THEMES)[keyof typeof THEMES],
): void {
  const size = 130;
  const offset = 74;
  const corners: Array<[number, number, number]> = [
    [offset, offset, 0],
    [width - offset, offset, Math.PI / 2],
    [width - offset, height - offset, Math.PI],
    [offset, height - offset, -Math.PI / 2],
  ];

  for (const [x, y, rotation] of corners) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.strokeStyle = theme.gold;
    ctx.lineWidth = 1.8;
    ctx.globalAlpha = 0.85;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(size * 0.5, size * 0.05, size * 0.9, size * 0.35, size, size * 0.85);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(size * 0.06, size * 0.55, size * 0.35, size * 0.88, size * 0.85, size);
    ctx.stroke();

    for (let i = 1; i <= 3; i++) {
      const t = i / 4;
      const px = size * (0.34 * t + 0.34 * t * t);
      const py = size * (0.1 * t + 0.62 * t * t);
      ctx.beginPath();
      ctx.arc(px, py, 3.2 - i * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = theme.goldBright;
      ctx.globalAlpha = 0.75;
      ctx.fill();
    }

    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(size * 0.16, 0);
    ctx.quadraticCurveTo(size * 0.3, size * 0.16, size * 0.16, size * 0.32);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, size * 0.16);
    ctx.quadraticCurveTo(size * 0.16, size * 0.3, size * 0.32, size * 0.16);
    ctx.stroke();

    ctx.restore();
  }
}

function drawFlame(
  ctx: SKRSContext2D,
  cx: number,
  cy: number,
  size: number,
  theme: (typeof THEMES)[keyof typeof THEMES],
): void {
  ctx.save();
  ctx.translate(cx, cy);

  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.bezierCurveTo(size * 0.62, -size * 0.2, size * 0.42, size * 0.55, 0, size * 0.55);
  ctx.bezierCurveTo(-size * 0.42, size * 0.55, -size * 0.62, -size * 0.2, 0, -size);
  ctx.closePath();

  const flameGrad = ctx.createLinearGradient(0, -size, 0, size * 0.55);
  flameGrad.addColorStop(0, theme.goldBright);
  flameGrad.addColorStop(0.55, theme.gold);
  flameGrad.addColorStop(1, theme.goldDark);
  ctx.fillStyle = flameGrad;
  ctx.shadowColor = 'rgba(240,200,120,0.55)';
  ctx.shadowBlur = 26;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(cx, cy + size * 1.02);
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.86, size * 0.2, 0, 0, Math.PI * 2);
  ctx.strokeStyle = theme.gold;
  ctx.globalAlpha = 0.8;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawGoldText(
  ctx: SKRSContext2D,
  text: string,
  x: number,
  y: number,
  font: string,
  theme: (typeof THEMES)[keyof typeof THEMES],
): void {
  ctx.save();
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const metrics = ctx.measureText(text);
  const grad = ctx.createLinearGradient(x - metrics.width / 2, y - 70, x + metrics.width / 2, y + 70);
  grad.addColorStop(0, theme.goldBright);
  grad.addColorStop(0.35, theme.gold);
  grad.addColorStop(0.5, theme.goldBright);
  grad.addColorStop(0.75, theme.gold);
  grad.addColorStop(1, theme.goldDark);

  ctx.shadowColor = 'rgba(232,192,121,0.4)';
  ctx.shadowBlur = 40;
  ctx.fillStyle = grad;
  ctx.fillText(text, x, y);

  ctx.shadowBlur = 0;
  ctx.fillText(text, x, y);

  ctx.lineWidth = 1.1;
  ctx.strokeStyle = 'rgba(255,244,214,0.25)';
  ctx.strokeText(text, x, y);
  ctx.restore();
}

function splitHeading(heading: string, style: 'script' | 'serif'): string[] {
  const trimmed = heading.trim();
  const words = trimmed.split(/\s+/);
  if (style === 'script' && words.length === 2 && trimmed.length <= 22) {
    return words;
  }
  if (style === 'script' && words.length === 3) {
    return [words.slice(0, 2).join(' '), words.slice(2).join(' ')];
  }
  return [trimmed];
}

function fitFontSize(
  ctx: SKRSContext2D,
  text: string,
  maxWidth: number,
  family: string,
  startSize: number,
  minSize: number,
): number {
  let size = startSize;
  while (size > minSize) {
    ctx.font = `${size}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 4;
  }
  return minSize;
}

function wrapText(ctx: SKRSContext2D, text: string, maxWidth: number, font: string): string[] {
  ctx.save();
  ctx.font = font;
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  ctx.restore();
  return lines;
}

function roundedRect(
  ctx: SKRSContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
