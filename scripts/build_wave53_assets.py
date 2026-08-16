"""Build deterministic Wave53 derivatives from the immutable OHTAAWA brand asset.

Usage:
    python scripts/build_wave53_assets.py "G:/ohtaawa redisign/public/images/ohtaawa/premium-car.jpg"
"""

from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

from PIL import Image, ImageOps

EXPECTED_SOURCE_SHA256 = "b9775de3cc94f1f180037ce068de693fd5c9142092e08113f876b469a99be079"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def save_webp(image: Image.Image, destination: Path, size: tuple[int, int]) -> None:
    output = ImageOps.fit(
        image,
        size,
        method=Image.Resampling.LANCZOS,
        centering=(0.58, 0.52),
    ).convert("RGB")
    output.save(destination, "WEBP", quality=84, method=6, exif=b"")


def main() -> int:
    if len(sys.argv) != 2:
        print("Expected one source image path.", file=sys.stderr)
        return 2

    source = Path(sys.argv[1]).resolve()
    if not source.is_file():
        print(f"Source does not exist: {source}", file=sys.stderr)
        return 3

    source_hash = sha256(source)
    if source_hash != EXPECTED_SOURCE_SHA256:
        print("Source SHA256 does not match the reviewed asset.", file=sys.stderr)
        return 4

    repo_root = Path(__file__).resolve().parents[1]
    output_dir = repo_root / "assets" / "leather-care"
    output_dir.mkdir(parents=True, exist_ok=True)

    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGB")
        save_webp(image, output_dir / "hero-desktop.webp", (1500, 1000))
        save_webp(image, output_dir / "hero-mobile.webp", (810, 1080))

    manifest = {
        "source_sha256": source_hash,
        "derivatives": [
            {
                "file": "assets/leather-care/hero-desktop.webp",
                "width": 1500,
                "height": 1000,
                "sha256": sha256(output_dir / "hero-desktop.webp"),
                "transformation": "truthful crop, Lanczos resize, WebP quality 84, metadata stripped",
            },
            {
                "file": "assets/leather-care/hero-mobile.webp",
                "width": 810,
                "height": 1080,
                "sha256": sha256(output_dir / "hero-mobile.webp"),
                "transformation": "truthful crop, Lanczos resize, WebP quality 84, metadata stripped",
            },
        ],
    }
    print(json.dumps(manifest, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
