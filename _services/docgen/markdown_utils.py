from markdown import markdown
from bs4 import BeautifulSoup


def markdown_to_soup(content: str) -> BeautifulSoup:
    html = markdown(
        content or "",
        extensions=["extra", "sane_lists", "tables", "fenced_code"],
        output_format="html5",
    )
    return BeautifulSoup(html, "html.parser")
