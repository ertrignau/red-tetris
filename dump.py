from pathlib import Path

ROOT = Path(".")
OUTPUT = Path("red_tetris_dump.md")

EXCLUDED_DIRS = {
    "node_modules",
    ".git",
    "dist",
    "coverage",
    ".vite",
}

EXCLUDED_FILES = {
    "package-lock.json",
    "red_tetris_dump.md",
}

ALLOWED_EXTENSIONS = {
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".json",
    ".css",
    ".html",
    ".md",
}

def should_ignore(path: Path) -> bool:
    if any(part in EXCLUDED_DIRS for part in path.parts):
        return True

    if path.name in EXCLUDED_FILES:
        return True

    if path.suffix not in ALLOWED_EXTENSIONS:
        return True

    return False


def language_for(path: Path) -> str:
    mapping = {
        ".js": "javascript",
        ".jsx": "jsx",
        ".ts": "typescript",
        ".tsx": "tsx",
        ".json": "json",
        ".css": "css",
        ".html": "html",
        ".md": "markdown",
    }

    return mapping.get(path.suffix, "")


def main():
    files = sorted(
        path
        for path in ROOT.rglob("*")
        if path.is_file() and not should_ignore(path)
    )

    with OUTPUT.open("w", encoding="utf-8") as output:
        output.write("# Red Tetris project dump\n\n")

        output.write("## File tree\n\n")
        output.write("```text\n")

        for path in files:
            output.write(f"{path.as_posix()}\n")

        output.write("```\n\n")

        output.write("# Files\n\n")

        for path in files:
            print(f"Adding {path}")

            output.write(
                f"## `{path.as_posix()}`\n\n"
            )

            output.write(
                f"```{language_for(path)}\n"
            )

            try:
                content = path.read_text(
                    encoding="utf-8"
                )
            except UnicodeDecodeError:
                output.write(
                    "[Unable to decode file]\n"
                )
            else:
                output.write(content)

                if not content.endswith("\n"):
                    output.write("\n")

            output.write("```\n\n")

    print()
    print(
        f"Done: {OUTPUT.resolve()}"
    )


if __name__ == "__main__":
    main()