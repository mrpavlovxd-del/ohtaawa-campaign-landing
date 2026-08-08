from pathlib import Path

from PIL import Image, ImageEnhance


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "proof" / "real"
OUTPUT = SOURCE / "crops"

# Top positions are art-directed for the owner-provided vertical frames.
CROPS = {
    "real-finished-porsche.webp": ("finished-porsche-wide.webp", 700),
    "real-film-wide-process.webp": ("film-wide-process-wide.webp", 520),
    "real-film-edge-process.webp": ("film-edge-process-wide.webp", 390),
    "real-full-body-disassembly.webp": ("full-body-disassembly-wide.webp", 350),
    "real-gloss-front.webp": ("gloss-front-wide.webp", 455),
    "real-gloss-panel.webp": ("gloss-panel-wide.webp", 485),
}


def crop_wide(source: Path, output: Path, preferred_top: int) -> None:
    image = Image.open(source).convert("RGB")
    width, height = image.size
    crop_height = round(width * 9 / 16)
    if crop_height > height:
        crop_height = height
        crop_width = round(height * 16 / 9)
        left = max(0, (width - crop_width) // 2)
        box = (left, 0, left + crop_width, height)
    else:
        top = min(max(0, preferred_top), height - crop_height)
        box = (0, top, width, top + crop_height)

    result = image.crop(box)
    result = ImageEnhance.Brightness(result).enhance(0.98)
    result = ImageEnhance.Contrast(result).enhance(1.06)
    result = ImageEnhance.Color(result).enhance(0.94)
    result = ImageEnhance.Sharpness(result).enhance(1.06)
    result.save(output, "WEBP", quality=90, method=6)


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for source_name, (output_name, top) in CROPS.items():
        crop_wide(SOURCE / source_name, OUTPUT / output_name, top)
        print(output_name)


if __name__ == "__main__":
    main()
