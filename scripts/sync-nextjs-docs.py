#!/usr/bin/env python3
"""Sync Next.js docs from nextjs.org into docs/ and fix sitemap.md links."""

from __future__ import annotations

import re
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
SITEMAP = DOCS / "sitemap.md"
BASE_URL = "https://nextjs.org"

LINK_PATTERN = re.compile(r"\]\((/docs/[^)]+)\)")
INTERNAL_DOC_LINK = re.compile(r"\]\((/docs/[^)#]+)\)")


def ensure_md_suffix(path: str) -> str:
    if path.endswith(".md"):
        return path
    # Preserve non-markdown assets referenced under /docs/
    if re.search(r"\.[a-z0-9]+$", path, re.IGNORECASE):
        return path
    return f"{path}.md"


def fix_sitemap_links(content: str) -> str:
    def repl(match: re.Match[str]) -> str:
        path = match.group(1)
        return f"]({ensure_md_suffix(path)})"

    return LINK_PATTERN.sub(repl, content)


def extract_paths(content: str) -> list[str]:
    paths = {ensure_md_suffix(m.group(1)) for m in LINK_PATTERN.finditer(content)}
    return sorted(paths)


def local_path_for(doc_path: str) -> Path:
    """Map /docs/app/foo.md -> docs/app/foo.md"""
    return DOCS / doc_path.removeprefix("/docs/")


def postprocess_markdown(content: str) -> str:
    """Normalize internal /docs links to include .md suffix."""

    def repl(match: re.Match[str]) -> str:
        path = match.group(1)
        if path.endswith(".md"):
            return match.group(0)
        return f"]({ensure_md_suffix(path)})"

    return INTERNAL_DOC_LINK.sub(repl, content)


def download_doc(doc_path: str) -> tuple[bool, str]:
    url = f"{BASE_URL}{doc_path}"
    local = local_path_for(doc_path)
    local.parent.mkdir(parents=True, exist_ok=True)

    result = subprocess.run(
        ["curl", "-fsSL", url],
        capture_output=True,
        text=True,
        timeout=60,
    )
    if result.returncode != 0:
        return False, result.stderr.strip() or f"curl failed ({result.returncode})"

    content = postprocess_markdown(result.stdout)
    local.write_text(content, encoding="utf-8")
    return True, str(local.relative_to(ROOT))


def remove_empty_placeholder_dirs() -> int:
    removed = 0
    for path in sorted(DOCS.rglob("*"), reverse=True):
        if not path.is_dir():
            continue
        md_sibling = Path(f"{path}.md")
        if md_sibling.exists():
            continue
        try:
            if not any(path.iterdir()):
                path.rmdir()
                removed += 1
        except OSError:
            pass
    return removed


def main() -> int:
    if not SITEMAP.exists():
        print(f"Missing {SITEMAP}", file=sys.stderr)
        return 1

    original = SITEMAP.read_text(encoding="utf-8")
    fixed = fix_sitemap_links(original)
    if fixed != original:
        SITEMAP.write_text(fixed, encoding="utf-8")
        print(f"Updated links in {SITEMAP.relative_to(ROOT)}")
    else:
        print("sitemap.md links already use .md suffix")

    paths = extract_paths(fixed)
    missing = [p for p in paths if not local_path_for(p).exists()]
    print(f"Total doc paths: {len(paths)} | Missing: {len(missing)}")

    ok, fail = 0, 0
    errors: list[str] = []
    for i, doc_path in enumerate(missing, 1):
        success, message = download_doc(doc_path)
        if success:
            ok += 1
            if i % 25 == 0 or i == len(missing):
                print(f"  [{i}/{len(missing)}] downloaded {doc_path}")
        else:
            fail += 1
            errors.append(f"{doc_path}: {message}")
        time.sleep(0.05)

    removed = remove_empty_placeholder_dirs()
    if removed:
        print(f"Removed {removed} empty placeholder directories")

    print(f"Done: {ok} downloaded, {fail} failed, {len(paths) - len(missing)} already present")
    if errors:
        print("\nFailures:", file=sys.stderr)
        for err in errors[:20]:
            print(f"  - {err}", file=sys.stderr)
        if len(errors) > 20:
            print(f"  ... and {len(errors) - 20} more", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
