#!/usr/bin/env python3
"""
Fix agent result structure - convert from old to new format without creating duplicates
"""
import re
from pathlib import Path

def fix_return_statement(content):
    """Fix a single return statement block"""
    # Only replace if both rawValue and normalizedScore exist in the block
    # Replace the first occurrence with score, remove the second
    
    # Pattern: resultType: 'xxx' followed by rawValue and normalizedScore
    pattern = r"(resultType:\s*'[^']+',\s*)\n(\s*)rawValue:\s*([^,]+),\s*\n\s*normalizedScore:\s*[^,]+,\s*\n(\s*)confidenceLevel:"
    replacement = r"\1\n\2score: \3,\n\4confidence:"
    
    content = re.sub(pattern, replacement, content)
    
    # Also convert standalone resultType to type
    content = re.sub(r'\bresultType:', 'type:', content)
    
    # Convert standalone rawValue/normalizedScore to score (for cases where only one exists)
    content = re.sub(r'\brawValue:', 'score:', content)
    content = re.sub(r'\bnormalizedScore:', 'score:', content)
    content = re.sub(r'\bconfidenceLevel:', 'confidence:', content)
    
    # Remove duplicate score lines (score: X, followed immediately by score: Y)
    content = re.sub(r'(\s+score:\s*[^,]+,)\s*\n\s*score:\s*[^,]+,', r'\1', content)
    
    return content

def main():
    agents_to_fix = [
        'real-geo-visibility-agent.ts',
        'real-citation-agent.ts',
        'real-commerce-agent.ts',
        'advanced-crawl-agent.ts'
    ]
    
    for agent_file in agents_to_fix:
        file_path = Path('src/agents') / agent_file
        if not file_path.exists():
            print(f"Warning: {agent_file} not found")
            continue
        
        print(f"Fixing {agent_file}...")
        content = file_path.read_text()
        fixed_content = fix_return_statement(content)
        file_path.write_text(fixed_content)
        print(f"Fixed {agent_file}")

if __name__ == '__main__':
    main()
    print("\nAll agents updated to new structure!")

