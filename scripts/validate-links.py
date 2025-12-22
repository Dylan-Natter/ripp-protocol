#!/usr/bin/env python3
"""
RIPP Protocol - Documentation Link Validator

This script validates internal links in markdown files across the repository.
It checks that all relative links point to existing files or directories.

Usage:
    python3 scripts/validate-links.py

Exit codes:
    0: All links are valid
    1: One or more broken links found
"""

import os
import re
import sys
from pathlib import Path
from typing import List, Dict, Set, Optional


# Get the repository root directory
REPO_ROOT = Path(__file__).resolve().parent.parent


def is_path_safe(target_path: Path) -> bool:
    """
    Check if a resolved path is within the repository boundaries.
    Prevents directory traversal attacks.
    
    Args:
        target_path: The resolved path to check
    
    Returns:
        True if path is safe (within repository), False otherwise
    """
    try:
        # Resolve both paths to absolute paths
        resolved_target = target_path.resolve()
        resolved_root = REPO_ROOT.resolve()
        
        # Check if target is within repository root
        return resolved_target == resolved_root or resolved_root in resolved_target.parents
    except (ValueError, OSError):
        return False


def is_external_link(link: str) -> bool:
    """Check if a link is external (http/https/mailto)."""
    return link.startswith(('http://', 'https://', 'mailto:'))


def is_anchor_only(link: str) -> bool:
    """Check if a link is just an anchor (internal page link)."""
    return link.startswith('#')


def has_liquid_template(link: str) -> bool:
    """Check if a link contains Jekyll Liquid template syntax."""
    return '{{' in link or '}}' in link


def is_wiki_style_link(link: str, file_path: Path) -> bool:
    """
    Check if a link is a wiki-style link (no .md extension).
    Wiki-style links are valid in the docs/wiki directory.
    """
    return (
        'docs/wiki' in str(file_path) and
        not link.endswith('.md') and
        not link.endswith('/') and
        '/' not in link.split('#')[0]  # No path separators in the link
    )


def resolve_target_path(link: str, file_path: Path) -> Optional[Path]:
    """
    Resolve the target path for a link relative to the file it's in.
    
    Args:
        link: The link URL from the markdown file
        file_path: Path to the markdown file containing the link
    
    Returns:
        Path object for the expected target location, or None if path is unsafe
    """
    # Remove anchor from link
    clean_link = link.split('#')[0]
    
    # Handle absolute paths from docs root
    if clean_link.startswith('/'):
        target = REPO_ROOT / 'docs' / clean_link.lstrip('/')
    else:
        # Handle relative paths
        target = (file_path.parent / clean_link).resolve()
    
    # Validate path is within repository boundaries
    if not is_path_safe(target):
        return None
    
    return target


def check_wiki_style_link(link: str, file_path: Path) -> bool:
    """
    Check if a wiki-style link resolves to an existing file.
    Wiki-style links don't include the .md extension.
    """
    target_with_ext = file_path.parent / f"{link}.md"
    
    # Validate path is safe
    if not is_path_safe(target_with_ext):
        return False
    
    return target_with_ext.exists()


def find_markdown_links(content: str) -> List[tuple]:
    """
    Find all markdown-style links in content.
    Returns list of (text, url) tuples.
    """
    link_pattern = r'\[([^\]]*)\]\(([^)]+)\)'
    return re.findall(link_pattern, content)


def check_links(root_dir: str = '.') -> List[Dict]:
    """
    Check all markdown files for broken links.
    
    Returns:
        List of error dictionaries with file, link, and expected path
    """
    errors = []
    checked = set()
    root_path = Path(root_dir)
    
    # Find all markdown files
    for md_file in root_path.rglob('*.md'):
        # Skip node_modules and .git
        if 'node_modules' in str(md_file) or '.git' in str(md_file):
            continue
        
        # Skip audit directory (contains historical documentation)
        if 'docs/audit' in str(md_file):
            continue
            
        try:
            with open(md_file, 'r', encoding='utf-8', errors='replace') as f:
                content = f.read()
        except (IOError, OSError) as e:
            print(f"Warning: Could not read {md_file}: {e}", file=sys.stderr)
            continue
            
        # Find all markdown links
        links = find_markdown_links(content)
        
        for text, link in links:
            # Skip external URLs
            if is_external_link(link):
                continue
            
            # Skip anchor-only links
            if is_anchor_only(link):
                continue
                
            # Skip liquid template variables
            if has_liquid_template(link):
                continue
            
            # Remove anchor from link
            clean_link = link.split('#')[0]
            if not clean_link:
                continue
            
            # Generate unique key for this check
            check_key = f"{md_file}:{link}"
            if check_key in checked:
                continue
            checked.add(check_key)
            
            # Handle wiki-style links (no .md extension)
            if is_wiki_style_link(clean_link, md_file):
                if not check_wiki_style_link(clean_link, md_file):
                    errors.append({
                        'file': str(md_file),
                        'link': link,
                        'expected': str(md_file.parent / f"{clean_link}.md"),
                        'type': 'wiki-style'
                    })
                continue
            
            # Resolve target path for regular links
            target = resolve_target_path(clean_link, md_file)
            
            # Skip if path is unsafe (outside repository)
            if target is None:
                errors.append({
                    'file': str(md_file),
                    'link': link,
                    'expected': 'UNSAFE PATH (outside repository)',
                    'type': 'security'
                })
                continue
            
            # Check if target exists (file or directory)
            if not target.exists():
                errors.append({
                    'file': str(md_file),
                    'link': link,
                    'expected': str(target),
                    'type': 'regular'
                })
    
    return errors


def main():
    """Main entry point for the link validator."""
    print("=== RIPP Protocol - Documentation Link Validator ===\n")
    
    # Check links
    errors = check_links()
    
    if errors:
        print(f"❌ Found {len(errors)} broken link(s):\n")
        for err in errors:
            print(f"File: {err['file']}")
            print(f"  Link: {err['link']}")
            print(f"  Expected: {err['expected']}")
            print(f"  Type: {err['type']}")
            print()
        
        print("\n💡 Tips:")
        print("  - Check if the file exists at the expected location")
        print("  - Verify relative path depth (../ for parent directory)")
        print("  - Wiki-style links should not include .md extension")
        print("  - Use liquid template syntax for Jekyll links: {{ '/path' | relative_url }}")
        
        return 1
    else:
        print("✅ All internal links are valid!")
        print(f"   Checked markdown files in: docs/, tools/, examples/, *.md")
        return 0


if __name__ == '__main__':
    sys.exit(main())
