import os
import re
import tempfile

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, StyleSheet1, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import ListFlowable, ListItem, Paragraph, Preformatted, SimpleDocTemplate, Spacer, Table, TableStyle

from markdown_utils import markdown_to_soup


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", value or "document").strip("-").lower()
    return slug or "document"


def _styles() -> StyleSheet1:
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="KwatiBody",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=10.5,
            leading=16,
            textColor=colors.HexColor("#1f2937"),
            spaceAfter=8,
            alignment=TA_LEFT,
        )
    )
    styles.add(
        ParagraphStyle(
            name="KwatiH1",
            parent=styles["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=22,
            leading=28,
            textColor=colors.HexColor("#0f172a"),
            spaceAfter=14,
        )
    )
    styles.add(
        ParagraphStyle(
            name="KwatiH2",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=16,
            leading=22,
            textColor=colors.HexColor("#0f172a"),
            spaceBefore=8,
            spaceAfter=10,
        )
    )
    styles.add(
        ParagraphStyle(
            name="KwatiH3",
            parent=styles["Heading3"],
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=18,
            textColor=colors.HexColor("#1d4ed8"),
            spaceBefore=6,
            spaceAfter=8,
        )
    )
    styles.add(
        ParagraphStyle(
            name="KwatiQuote",
            parent=styles["BodyText"],
            fontName="Helvetica-Oblique",
            fontSize=10.5,
            leading=16,
            leftIndent=12,
            borderPadding=8,
            borderColor=colors.HexColor("#cbd5e1"),
            borderWidth=1,
            borderLeft=True,
            textColor=colors.HexColor("#475569"),
            spaceAfter=10,
        )
    )
    styles.add(
        ParagraphStyle(
            name="KwatiCode",
            parent=styles["Code"],
            fontName="Courier",
            fontSize=9,
            leading=12,
            backColor=colors.HexColor("#f8fafc"),
            borderColor=colors.HexColor("#e2e8f0"),
            borderWidth=1,
            borderPadding=8,
            spaceAfter=10,
        )
    )
    return styles


def _render_inlines(node) -> str:
    parts = []
    for child in node.children:
        name = getattr(child, "name", None)
        if name is None:
            parts.append(str(child))
            continue
        text = _render_inlines(child)
        if name in ("strong", "b"):
            parts.append(f"<b>{text}</b>")
        elif name in ("em", "i"):
            parts.append(f"<i>{text}</i>")
        elif name == "code":
            parts.append(f"<font face='Courier'>{text}</font>")
        elif name == "a":
            href = child.get("href", "")
            parts.append(f"<link href='{href}' color='#2563eb'>{text}</link>")
        elif name == "br":
            parts.append("<br/>")
        else:
            parts.append(text)
    return "".join(parts)


def _table_from_html(node, styles: StyleSheet1):
    rows = []
    for row in node.find_all("tr"):
        cells = row.find_all(["th", "td"])
        rows.append([Paragraph(_render_inlines(cell), styles["KwatiBody"]) for cell in cells])
    if not rows:
        return None
    table = Table(rows, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
                ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#0f172a")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    return table


def build_pdf(title: str, content_markdown: str, options: dict):
    styles = _styles()
    soup = markdown_to_soup(content_markdown)
    story = []

    for node in soup.contents:
        name = getattr(node, "name", None)
        if name is None:
            continue
        if name == "h1":
            story.append(Paragraph(_render_inlines(node), styles["KwatiH1"]))
        elif name == "h2":
            story.append(Paragraph(_render_inlines(node), styles["KwatiH2"]))
        elif name == "h3":
            story.append(Paragraph(_render_inlines(node), styles["KwatiH3"]))
        elif name == "p":
            story.append(Paragraph(_render_inlines(node), styles["KwatiBody"]))
        elif name in ("ul", "ol"):
            items = []
            bullet_type = "1" if name == "ol" else "bullet"
            for child in node.find_all("li", recursive=False):
                items.append(ListItem(Paragraph(_render_inlines(child), styles["KwatiBody"])))
            if items:
                story.append(ListFlowable(items, bulletType=bullet_type, leftIndent=16))
                story.append(Spacer(1, 6))
        elif name == "blockquote":
            story.append(Paragraph(_render_inlines(node), styles["KwatiQuote"]))
        elif name == "pre":
            code = node.get_text("\n").strip()
            if code:
                story.append(Preformatted(code, styles["KwatiCode"]))
        elif name == "table":
            table = _table_from_html(node, styles)
            if table is not None:
                story.append(table)
                story.append(Spacer(1, 8))

    if not story:
        story.append(Paragraph(title, styles["KwatiH1"]))

    temp_dir = tempfile.mkdtemp(prefix="kwati_docgen_")
    filename = f"{_slugify(title)}.pdf"
    output_path = os.path.join(temp_dir, filename)

    document = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
        title=title,
    )
    document.build(story)

    return output_path, filename
