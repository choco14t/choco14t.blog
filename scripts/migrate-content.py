"""One-time migration of this repository's single-line TOML frontmatter."""
from pathlib import Path
import re
import shutil

source = Path("content/posts")
target = Path("src/content/posts")
for path in source.rglob("*"):
    if not path.is_file() or path.name == "_index.md":
        continue
    destination = target / path.relative_to(source)
    destination.parent.mkdir(parents=True, exist_ok=True)
    if path.suffix != ".md":
        shutil.copyfile(path, destination)
        continue
    match = re.fullmatch(r"\+\+\+\n(.*?)\n\+\+\+([\s\S]*)", path.read_text(), re.S)
    if not match:
        raise ValueError(f"Unexpected frontmatter in {path}")
    fields = []
    for line in match[1].splitlines():
        field = re.fullmatch(r"(title|slug|draft|date|description|tags) = (.*)", line)
        if field:
            fields.append(f"{field[1]}: {field[2]}")
        elif line.strip() and line not in ("[taxonomies]", "[extra]") and not line.startswith("category = "):
            raise ValueError(f"Unexpected frontmatter field in {path}: {line}")
    destination.write_text("---\n" + "\n".join(fields) + "\n---" + match[2])
