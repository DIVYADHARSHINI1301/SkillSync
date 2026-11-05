import re
from typing import Dict, List, Set, Tuple, Optional
from backend.app.utils.text_normalizer import segment_resume_sections, extract_sentences_and_bullets

# Comprehensive canonical skill taxonomy and aliases
SKILL_TAXONOMY: Dict[str, List[str]] = {
    # Backend & Languages
    "Python": [r"python(?:3)?", r"pythonic"],
    "Java": [r"java(?!\s*script)", r"core\s+java", r"java\s+(?:8|11|17|21)", r"j2se", r"j2ee"],
    "SQL": [r"sql", r"mysql", r"postgresql", r"postgres", r"sqlite", r"t-sql", r"pl/sql", r"ms\s+sql", r"oracle\s+sql"],
    "REST API": [r"rest(?:ful)?\s+apis?", r"restful\s+web\s+services?", r"rest\s+endpoints?", r"api\s+development", r"rest\s+architecture"],
    "Authentication": [r"authentication", r"auth", r"jwt", r"json\s+web\s+tokens?", r"oauth(?:2)?", r"session\s+management", r"rbac", r"bcrypt"],
    "Git": [r"git(?!\s*(?:hub|lab))", r"github", r"gitlab", r"version\s+control\s+system", r"git\s+version\s+control"],
    "FastAPI": [r"fastapi", r"fast-api", r"fast\s+api"],
    "Spring Boot": [r"spring\s+boot", r"springboot", r"spring\s+framework", r"spring\s+mvc"],
    "OOP": [r"oop", r"oops", r"object[- ]oriented\s+programming", r"object\s+oriented\s+design", r"classes\s+and\s+objects"],
    "Node.js": [r"node\.?js", r"nodejs", r"node\s+js", r"node(?=\s+(?:runtime|backend|server|express))"],
    
    # Frontend
    "HTML": [r"html(?:5)?"],
    "CSS": [r"css(?:3)?", r"tailwind(?:\s+css)?", r"bootstrap", r"sass", r"scss"],
    "JavaScript": [r"javascript", r"js", r"ecmascript", r"es6\+?", r"vanilla\s+js"],
    "React": [r"react(?:\.?js)?", r"reactjs", r"react\s+native"],
    "Responsive Design": [r"responsive\s+(?:web\s+)?design", r"mobile[- ]first\s+design", r"responsive\s+ui", r"media\s+queries", r"mobile[- ]responsive"],
    
    # Data & Analytics
    "Excel": [r"excel", r"ms\s+excel", r"microsoft\s+excel", r"advanced\s+excel", r"spreadsheets?", r"vlookup"],
    "Statistics": [r"statistics", r"statistical\s+analysis", r"hypothesis\s+testing", r"probability\s+(?:and|&)\s+statistics", r"statistical\s+modeling", r"inferential\s+statistics"],
    "Power BI": [r"power\s*bi", r"power-bi", r"ms\s+power\s*bi", r"dax"],
    "Data Visualization": [r"data\s+visualization", r"data\s+visualisations?", r"tableau", r"matplotlib", r"seaborn", r"plotly", r"data\s+dashboards?", r"interactive\s+dashboards?"],
}

def build_regex_pattern(alias: str) -> re.Pattern:
    """
    Builds a regex pattern with strict word boundaries.
    Handles special characters like . in Node.js, + in C++, and - in Power-BI.
    """
    # If the alias already contains regex operators like (?!), wrap appropriately
    return re.compile(rf"(?<![a-zA-Z0-9_]){alias}(?![a-zA-Z0-9_])", re.IGNORECASE)

class SkillMatch:
    def __init__(self, canonical_name: str, matched_text: str, sentence: str, section: str):
        self.canonical_name = canonical_name
        self.matched_text = matched_text
        self.sentence = sentence.strip()
        self.section = section.lower()

    def __repr__(self):
        return f"<SkillMatch {self.canonical_name} in [{self.section}]: {self.matched_text}>"

def find_skills_in_sentence(sentence: str, section_name: str, target_skills: Optional[Set[str]] = None) -> List[SkillMatch]:
    """
    Finds all canonical skills present in a given sentence or bullet point.
    """
    matches: List[SkillMatch] = []
    
    for canonical_name, aliases in SKILL_TAXONOMY.items():
        if target_skills and canonical_name not in target_skills:
            continue
            
        for alias_pattern in aliases:
            pattern = build_regex_pattern(alias_pattern)
            match = pattern.search(sentence)
            if match:
                matches.append(SkillMatch(
                    canonical_name=canonical_name,
                    matched_text=match.group(0),
                    sentence=sentence,
                    section=section_name
                ))
                break  # Matched this canonical skill in this sentence, avoid duplicate match for same skill
                
    return matches

def extract_all_skill_matches(text: str, target_skills: Optional[Set[str]] = None) -> Dict[str, List[SkillMatch]]:
    """
    Extracts all occurrences of skills across the entire resume text,
    grouped by canonical skill name.
    """
    sections = segment_resume_sections(text)
    grouped_matches: Dict[str, List[SkillMatch]] = {}
    
    for section_name, section_text in sections:
        sentences = extract_sentences_and_bullets(section_text)
        for sentence in sentences:
            sentence_matches = find_skills_in_sentence(sentence, section_name, target_skills)
            for m in sentence_matches:
                if m.canonical_name not in grouped_matches:
                    grouped_matches[m.canonical_name] = []
                grouped_matches[m.canonical_name].append(m)
                
    return grouped_matches
