"""
Gera os ícones PNG da extensão (16, 32, 48, 128) a partir de um desenho
único feito em alta resolução. Estilo: fundo verde arredondado com a sigla
"CA" (de "CNPJ Aberto") em branco.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent.parent / "icons"
OUT.mkdir(parents=True, exist_ok=True)

# Paleta da marca cnpjaberto.com.br
ACCENT_DARK = (124, 45, 18, 255)   # #7c2d12  orange-900
ACCENT = (154, 52, 18, 255)        # #9a3412  orange-800 (cor primária)
ACCENT_HOVER = (194, 65, 12, 255)  # #c2410c  orange-700
WHITE = (255, 255, 255, 255)
ACCENT_LIGHT = (255, 247, 237, 255)  # #fff7ed  orange-50


def find_font(size: int) -> ImageFont.FreeTypeFont:
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            continue
    return ImageFont.load_default()


def draw_master(side: int = 512) -> Image.Image:
    img = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    radius = int(side * 0.22)

    # gradiente diagonal (canto sup. esq. -> canto inf. dir.)
    # accent-dark -> accent -> accent-hover, espelhando o header do popup
    grad = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grad)
    stops = [(0.0, ACCENT_DARK), (0.55, ACCENT), (1.0, ACCENT_HOVER)]
    for y in range(side):
        for x in range(side):
            t = (x + y) / (2 * (side - 1))
            # interpola entre as paradas
            for i in range(len(stops) - 1):
                s0, c0 = stops[i]
                s1, c1 = stops[i + 1]
                if s0 <= t <= s1:
                    u = (t - s0) / (s1 - s0) if s1 > s0 else 0
                    r = int(c0[0] * (1 - u) + c1[0] * u)
                    g = int(c0[1] * (1 - u) + c1[1] * u)
                    b = int(c0[2] * (1 - u) + c1[2] * u)
                    grad.putpixel((x, y), (r, g, b, 255))
                    break

    # máscara arredondada
    mask = Image.new("L", (side, side), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle((0, 0, side - 1, side - 1), radius=radius, fill=255)
    img.paste(grad, (0, 0), mask)
    d = ImageDraw.Draw(img)

    # texto "CA"
    text = "CA"
    font = find_font(int(side * 0.55))
    bbox = d.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    tx = (side - tw) / 2 - bbox[0]
    ty = (side - th) / 2 - bbox[1] - int(side * 0.02)
    d.text((tx, ty), text, font=font, fill=WHITE)

    # bullet/decoração: pequeno círculo accent-light no canto inferior direito
    r = int(side * 0.07)
    cx, cy = side - int(side * 0.18), side - int(side * 0.18)
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=ACCENT_LIGHT)

    return img


def main() -> None:
    master = draw_master(512)
    for size in (16, 32, 48, 128):
        resized = master.resize((size, size), Image.LANCZOS)
        path = OUT / f"icon{size}.png"
        resized.save(path, "PNG")
        print(f"wrote {path}")


if __name__ == "__main__":
    main()
