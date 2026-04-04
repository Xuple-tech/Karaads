import argparse
import json
import sys

from docx_builder import build_docx
from pdf_builder import build_pdf


def mime_type_for(fmt: str) -> str:
    if fmt == "pdf":
        return "application/pdf"
    if fmt == "docx":
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    return "application/octet-stream"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--stdin", action="store_true")
    args = parser.parse_args()

    try:
        raw = sys.stdin.read() if args.stdin else ""
        payload = json.loads(raw or "{}")

        title = payload.get("title", "Document")
        content_markdown = payload.get("content_markdown", "")
        fmt = str(payload.get("format", "pdf")).lower()
        options = payload.get("options", {}) or {}

        if fmt == "pdf":
            output_path, filename = build_pdf(title, content_markdown, options)
        elif fmt == "docx":
            output_path, filename = build_docx(title, content_markdown, options)
        else:
            raise ValueError(f"Unsupported format: {fmt}")

        print(
            json.dumps(
                {
                    "success": True,
                    "output_path": output_path,
                    "filename": filename,
                    "mime_type": mime_type_for(fmt),
                }
            )
        )
        return 0
    except Exception as exc:
        print(json.dumps({"success": False, "error": str(exc)}))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
