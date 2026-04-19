#!/usr/bin/env python3
"""QR 4x4 pulgadas @ 300 DPI para cajas Kayalac."""
import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers.pil import RoundedModuleDrawer
from qrcode.image.styles.colormasks import SolidFillColorMask
from PIL import Image, ImageDraw, ImageFont
import os

URL = "https://kayalac.github.io/calculadora-lamina-vinyl-kayalac/?utm_source=qr_caja&utm_medium=print&utm_campaign=cajas_china"
OUT_DIR = "/Users/kayala/calculadora-lamina-vinyl-kayalac"

# 4" x 4" @ 300 DPI = 1200 x 1200 px
CANVAS = 1200

# ── QR code ──
qr = qrcode.QRCode(
    version=None,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=18,
    border=1,
)
qr.add_data(URL)
qr.make(fit=True)

qr_img = qr.make_image(fill_color="black", back_color="white").convert("RGBA")

# QR grande y simple
QR_SIZE = 900
qr_img = qr_img.resize((QR_SIZE, QR_SIZE), Image.LANCZOS)

# ── Canvas final 1200x1200 ──
canvas = Image.new("RGB", (CANVAS, CANVAS), (255, 255, 255))
draw = ImageDraw.Draw(canvas)

# Fonts
def load_font(size, bold=False):
    paths = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for p in paths:
        if os.path.exists(p):
            try: return ImageFont.truetype(p, size)
            except: continue
    return ImageFont.load_default()

font_title = load_font(40, bold=True)

def center(text, font, y, color):
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    draw.text(((CANVAS - tw) // 2, y), text, font=font, fill=color)

# ── Texto superior ──
center("Usa nuestra calculadora", font_title, 60, (0, 0, 0))
center("para potenciar y facilitar tus proyectos!", font_title, 115, (0, 0, 0))

# ── QR centrado ──
qr_x = (CANVAS - QR_SIZE) // 2
qr_y = 210
canvas.paste(qr_img, (qr_x, qr_y), qr_img)

# ── Guardar ──
out = os.path.join(OUT_DIR, "qr_kayalac_4x4.png")
canvas.save(out, "PNG", dpi=(300, 300))
print(f"✓ QR 4x4\" generado: {out}")
print(f"  {CANVAS}x{CANVAS}px @ 300 DPI = 4\" x 4\" impreso")
