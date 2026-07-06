#!/usr/bin/env python3
"""Sync React docs from react.dev into docs/react/ based on llms.md index."""

from __future__ import annotations

import re
import subprocess
import sys
import time
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
REACT_DOCS = DOCS / "react"
LLMS_INDEX = ROOT / "reference/rsc/docs/react/llms.md"
BASE_URL = "https://react.dev"

REACT_URL_PATTERN = re.compile(r"https://react\.dev/[^\s)]+")
MARKDOWN_LINK_PATTERN = re.compile(r"\]\((https://react\.dev/[^)#]+)(#[^)]+)?\)")
INTERNAL_REACT_PATH = re.compile(r"\]\((/(?:learn|reference)/[^)#]+)(#[^)]+)?\)")


def react_url_to_local_path(url: str) -> str:
    """Map react.dev URL to /docs/react/... local path."""
    parsed = urlparse(url)
    path = parsed.path.lstrip("/")
    if not path:
        path = "index.md"
    if path.startswith("reference/"):
        path = path.removeprefix("reference/")
    return f"/docs/react/{path}"


def local_path_for(local_doc_path: str) -> Path:
    return DOCS / local_doc_path.removeprefix("/docs/")


def extract_urls(content: str) -> list[str]:
    urls = {m.group(0).rstrip(").,") for m in REACT_URL_PATTERN.finditer(content)}
    return sorted(urls)


def ensure_md_suffix(path: str) -> str:
    if path.endswith(".md"):
        return path
    if re.search(r"\.[a-z0-9]+$", path, re.IGNORECASE):
        return path
    return f"{path}.md"


def postprocess_markdown(content: str) -> str:
    """Rewrite react.dev and internal /learn /reference links to local docs paths."""

    def repl_absolute(match: re.Match[str]) -> str:
        url = match.group(1)
        anchor = match.group(2) or ""
        local = react_url_to_local_path(url)
        return f"]({local}{anchor})"

    content = MARKDOWN_LINK_PATTERN.sub(repl_absolute, content)

    def repl_internal(match: re.Match[str]) -> str:
        path = match.group(1)
        anchor = match.group(2) or ""
        if path.startswith("/reference/"):
            path = "/docs/react/" + path.removeprefix("/reference/")
        else:
            path = "/docs/react" + path
        path = ensure_md_suffix(path)
        return f"]({path}{anchor})"

    return INTERNAL_REACT_PATH.sub(repl_internal, content)


def update_llms_index(content: str) -> str:
    def repl(match: re.Match[str]) -> str:
        url = match.group(0)
        return react_url_to_local_path(url)

    return REACT_URL_PATTERN.sub(repl, content)


def download_doc(url: str) -> tuple[bool, str]:
    local_doc_path = react_url_to_local_path(url)
    local = local_path_for(local_doc_path)
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


def main() -> int:
    if not LLMS_INDEX.exists():
        print(f"Missing {LLMS_INDEX}", file=sys.stderr)
        return 1

    original_index = LLMS_INDEX.read_text(encoding="utf-8")
    urls = extract_urls(original_index)
    print(f"Found {len(urls)} React doc URLs in llms.md")

    missing = [u for u in urls if not local_path_for(react_url_to_local_path(u)).exists()]
    print(f"Missing locally: {len(missing)}")

    ok, fail = 0, 0
    errors: list[str] = []
    for i, url in enumerate(missing, 1):
        success, message = download_doc(url)
        if success:
            ok += 1
            if i % 25 == 0 or i == len(missing):
                print(f"  [{i}/{len(missing)}] {message}")
        else:
            fail += 1
            errors.append(f"{url}: {message}")
        time.sleep(0.05)

    updated_index = update_llms_index(original_index)
    if updated_index != original_index:
        LLMS_INDEX.write_text(updated_index, encoding="utf-8")
        print(f"Updated links in {LLMS_INDEX.relative_to(ROOT)}")

    print(f"Done: {ok} downloaded, {fail} failed, {len(urls) - len(missing)} already present")
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
