import re
from typing import List, Optional, Tuple
from backend.app.services.skill_extractor import SkillMatch
from backend.app.schemas.analysis import EvidenceDetail, EvidenceLevel

# Action and implementation verbs signaling active demonstration
STRONG_ACTION_VERBS = {
    "develop", "developed", "developing", "build", "built", "building",
    "create", "created", "creating", "implement", "implemented", "implementing",
    "design", "designed", "designing", "engineer", "engineered", "engineering",
    "architect", "architected", "architecting", "construct", "constructed",
    "integrate", "integrated", "integrating", "deploy", "deployed", "deploying",
    "optimize", "optimized", "optimizing", "automate", "automated", "automating",
    "program", "programmed", "programming", "lead", "led", "managed", "manage",
    "spearhead", "spearheaded", "deliver", "delivered", "maintain", "maintained",
    "execute", "executed", "configured", "configure", "refactor", "refactored"
}

# Contextual phrases indicating project / work application
APPLICATION_SIGNALS = [
    r"\bto\s+[a-z]+",                  # "to process student records"
    r"\bfor\s+(?:the\s+)?[a-z]+",      # "for user authentication"
    r"\busing\b",                      # "using Python"
    r"\butilizing\b",                  # "utilizing SQL"
    r"\bbuilt\s+(?:with|using)\b",     # "built using React"
    r"\bdeveloped\s+(?:a|an)\b",       # "developed an attendance system"
    r"\bapplication\b", r"\bsystem\b", r"\bplatform\b", r"\bpipeline\b",
    r"\bapi\b", r"\bdatabase\b", r"\binterface\b", r"\bmodel\b", r"\bdashboard\b"
]

def is_skills_list_sentence(sentence: str) -> bool:
    """
    Checks if a sentence looks like a standalone skills list (comma-delimited items or prefix).
    """
    lower = sentence.lower()
    if lower.startswith("skills:") or lower.startswith("technical skills:") or lower.startswith("technologies:"):
        return True
        
    # High density of commas and short length with few verbs
    commas = sentence.count(",")
    words = len(sentence.split())
    if commas >= 2 and words <= 12 and not any(v in lower.split() for v in STRONG_ACTION_VERBS):
        return True
        
    return False

def evaluate_match_evidence(match: SkillMatch) -> Tuple[EvidenceLevel, int, str]:
    """
    Evaluates a single SkillMatch and returns:
    (EvidenceLevel, score_rank, explanation)
    score_rank allows selecting the best passage among multiple mentions.
    """
    sentence = match.sentence
    section = match.section
    lower_sentence = sentence.lower()
    words = set(re.findall(r"\b[a-zA-Z]+\b", lower_sentence))
    
    # 1. Check if sentence is purely a skills list
    if section == "skills" or is_skills_list_sentence(sentence):
        return (
            "limited",
            1,
            f"Listed under technical skills without project implementation details."
        )

    # 2. Check for strong evidence (Action verb + Project/Experience context + Sufficient length)
    has_action_verb = bool(words.intersection(STRONG_ACTION_VERBS))
    has_application_signal = any(re.search(pat, lower_sentence) for pat in APPLICATION_SIGNALS)
    sentence_length = len(sentence.split())

    if (section in ("projects", "experience") or has_application_signal) and has_action_verb and sentence_length >= 7:
        return (
            "strong",
            3,
            f"Demonstrated with concrete implementation details and active project responsibilities."
        )

    # 3. Check for supported evidence (Associated with activity/project but brief details)
    if section in ("projects", "experience") or has_action_verb or has_application_signal or sentence_length >= 5:
        return (
            "supported",
            2,
            f"Referenced within a project or experience description, though further implementation details could strengthen it."
        )

    # 4. Fallback: Limited mention
    return (
        "limited",
        1,
        f"Mentioned in resume text with minimal context."
    )

def classify_skill_evidence(skill_name: str, matches: Optional[List[SkillMatch]]) -> EvidenceDetail:
    """
    Classifies a required skill based on all its occurrences in the resume.
    If no matches exist, classifies as 'missing'.
    If multiple matches exist, selects the strongest passage as primary evidence.
    """
    if not matches:
        return EvidenceDetail(
            skill_name=skill_name,
            evidence_level="missing",
            evidence_text=None,
            supporting_passage=None,
            section_found=None,
            explanation=f"No evidence of {skill_name} was found in the uploaded resume."
        )

    best_level: EvidenceLevel = "limited"
    best_rank: int = 0
    best_match: SkillMatch = matches[0]
    best_explanation: str = ""

    for m in matches:
        level, rank, explanation = evaluate_match_evidence(m)
        if rank > best_rank:
            best_rank = rank
            best_level = level
            best_match = m
            best_explanation = explanation

    return EvidenceDetail(
        skill_name=skill_name,
        evidence_level=best_level,
        evidence_text=best_match.sentence,
        supporting_passage=best_match.sentence,
        section_found=best_match.section.capitalize() if best_match.section else "General",
        explanation=best_explanation
    )
