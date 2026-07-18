from pathlib import Path

ROOT = Path('.')
app_path = ROOT / 'app.js'
server_path = ROOT / 'api/server.js'
styles_path = ROOT / 'styles.css'
index_path = ROOT / 'index.html'
validator_path = ROOT / 'scripts/validate-product-logic.mjs'


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected one anchor, found {count}')
    return text.replace(old, new, 1)


def insert_after(text: str, anchor: str, addition: str, label: str) -> str:
    return replace_once(text, anchor, anchor + addition, label)


def function_end(text: str, start: int) -> int:
    brace = text.find('{', start)
    if brace < 0:
        raise SystemExit('function brace not found')
    depth = 0
    quote = None
    escaped = False
    template_depth = 0
    index = brace
    while index < len(text):
        char = text[index]
        if quote:
            if escaped:
                escaped = False
            elif char == '\\':
                escaped = True
            elif quote == '`' and char == '$' and index + 1 < len(text) and text[index + 1] == '{':
                template_depth += 1
                index += 1
            elif char == quote and template_depth == 0:
                quote = None
            elif quote == '`' and char == '}' and template_depth:
                template_depth -= 1
        else:
            if char in ('"', "'", '`'):
                quote = char
            elif char == '{':
                depth += 1
            elif char == '}':
                depth -= 1
                if depth == 0:
                    return index + 1
        index += 1
    raise SystemExit('function end not found')
