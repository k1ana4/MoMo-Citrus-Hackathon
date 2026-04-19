import re

def prescan_code(code: str, language: str) -> dict:
    lines = code.split("\n")
    suspicious = []

    if language in ("cpp", "c"):
        for i, line in enumerate(lines, 1):
            stripped = line.strip()
            if re.search(r'\b(malloc|calloc|realloc)\s*\(', stripped):
                suspicious.append({"line": i, "type": "allocation", "code": stripped})
            if re.search(r'\bnew\s+\w+', stripped) and 'delete' not in stripped:
                suspicious.append({"line": i, "type": "new_allocation", "code": stripped})
            if re.search(r'\bfopen\s*\(', stripped):
                suspicious.append({"line": i, "type": "file_handle", "code": stripped})
            if re.search(r'\*\s*\w+\s*=.*(malloc|new)', stripped):
                suspicious.append({"line": i, "type": "raw_pointer", "code": stripped})
        alloc_count = len(re.findall(r'\b(malloc|calloc|realloc|new)\b', code))
        free_count = len(re.findall(r'\b(free|delete)\b', code))

    elif language == "python":
        for i, line in enumerate(lines, 1):
            stripped = line.strip()
            if re.search(r'self\.\w+\s*=\s*self', stripped):
                suspicious.append({"line": i, "type": "circular_ref", "code": stripped})
            if re.search(r'=\s*open\s*\(', stripped) and 'with' not in stripped:
                suspicious.append({"line": i, "type": "file_no_context", "code": stripped})
            if re.search(r'(cache|memo)\s*=\s*\{\}', stripped, re.IGNORECASE):
                suspicious.append({"line": i, "type": "unbounded_cache", "code": stripped})
        alloc_count = 0
        free_count = 0

    return {
        "suspicious_lines": suspicious,
        "alloc_count": alloc_count,
        "free_count": free_count,
        "potential_leak_count": max(0, alloc_count - free_count),
    }