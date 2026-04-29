"""
Gera os ícones PNG da extensão (16, 32, 48, 128) a partir de um desenho
único feito em alta resolução. Estilo: fundo verde arredondado com a sigla
"CA" (de "CNPJ Aberto") em branco.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent.parent / "icons"
OUT.mkdir(parents=True, exist_ok=True)

GREEN_DARK = (27, 94, 32, 255)
GREEN = (46, 125, 50, 255)
WHITE = (255, 255, 255, 255)


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

    # gradiente vertical simples (escuro -> claro)
    grad = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grad)
    for y in range(side):
        t = y / (side - 1)
        r = int(GREEN_DARK[0] * (1 - t) + GREEN[0] * t)
        g = int(GREEN_DARK[1] * (1 - t) + GREEN[1] * t)
        b = int(GREEN_DARK[2] * (1 - t) + GREEN[2] * t)
        gd.line([(0, y), (side, y)], fill=(r, g, b, 255))

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

    # bullet/decoração: pequeno círculo branco no canto inferior direito
    r = int(side * 0.07)
    cx, cy = side - int(side * 0.18), side - int(side * 0.18)
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=WHITE)

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
