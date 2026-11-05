import re
from typing import List, Tuple

# Common resume section markers
SECTION_PATTERNS = {
    "skills": re.compile(r"^(?:technical\s+)?skills(?:\s+(?:and|&)\s+abilities)?(?:\s*:)?$", re.IGNORECASE),
    "projects": re.compile(r"^(?:academic\s+|personal\s+|key\s+)?projects?(?:\s*:)?$", re.IGNORECASE),
    "experience": re.compile(r"^(?:work\s+|professional\s+|relevant\s+)?experience(?:\s*:)?$|^employment(?:\s+history)?(?:\s*:)?$", re.IGNORECASE),
    "education": re.compile(r"^education(?:\s+(?:and|&)\s+qualifications)?(?:\s*:)?$", re.IGNORECASE),
    "certifications": re.compile(r"^(?:certifications?|licenses?|training)(?:\s*:)?$", re.IGNORECASE),
}

def clean_text(text: str) -> str:
    """
    Cleans extracted resume text while preserving technical symbols,
    punctuation, and word boundaries.
    """
    if not text:
        return ""
    
    # Replace non-breaking spaces and unusual whitespace
    cleaned = text.replace("\u00a0", " ").replace("\u200b", " ")
    
    # Normalize unicode bullet points to a standard marker
    cleaned = re.sub(r"(?:^|(?<=\s))[•\u2022\u2023\u25E6\u2043\u2219\u25AA\u25AB\u25CF\u25CB*]\s*", " • ", cleaned)
    
    # Normalize dash bullet points at beginning of line or after newline
    cleaned = re.sub(r"(?:^|(?<=\n))\s*[-–—]\s+", " • ", cleaned)
    
    # Normalize multiple horizontal whitespaces
    cleaned = re.sub(r"[ \t]+", " ", cleaned)
    
    # Normalize repeated line breaks (more than 2 to exactly 2)
    cleaned = re.sub(r"\n\s*\n\s*\n+", "\n\n", cleaned)
    
    return cleaned.strip()

def split_into_lines(text: str) -> List[str]:
    """
    Splits text into non-empty, trimmed lines.
    """
    cleaned = clean_text(text)
    return [line.strip() for line in cleaned.splitlines() if line.strip()]

def segment_resume_sections(text: str) -> List[Tuple[str, str]]:
    """
    Segments the resume text into (section_name, section_text) blocks.
    Identifies sections such as Skills, Projects, Experience, and Education.
    """
    lines = split_into_lines(text)
    sections: List[Tuple[str, str]] = []
    
    current_section = "general"
    current_lines: List[str] = []
    
    for line in lines:
        detected_section = None
        # Check if line looks like a section header (short line matching pattern)
        if len(line.split()) <= 4:
            clean_line = re.sub(r"[^a-zA-Z\s]", "", line).strip()
            for sec_name, pattern in SECTION_PATTERNS.items():
                if pattern.match(clean_line):
                    detected_section = sec_name
                    break
        
        if detected_section:
            if current_lines:
                sections.append((current_section, "\n".join(current_lines)))
                current_lines = []
            current_section = detected_section
        else:
            current_lines.append(line)
            
    if current_lines:
        sections.append((current_section, "\n".join(current_lines)))
        
    return sections

def extract_sentences_and_bullets(text: str) -> List[str]:
    """
    Extracts distinct sentences, clauses, and bullet points from text.
    Preserves technical terms like Node.js and C++.
    """
    if not text:
        return []
        
    cleaned = clean_text(text)
    
    # Split first by newlines and bullets
    parts = re.split(r"\n+| • ", cleaned)
    
    sentences = []
    for part in parts:
        part = part.strip()
        if not part:
            continue
            
        # Split long sentences on period followed by whitespace and uppercase letter,
        # but avoid splitting on terms like Node.js, v1.0, etc.
        sub_sentences = re.split(r"(?<=[.!?])\s+(?=[A-Z])", part)
        for s in sub_sentences:
            s_trimmed = s.strip()
            if s_trimmed:
                sentences.append(s_trimmed)
                
    return sentences
