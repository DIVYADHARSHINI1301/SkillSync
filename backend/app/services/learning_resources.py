"""
Verified learning resource catalogue for Stage 3.
All URLs are official documentation or well-established free platforms.
Resources are keyed by canonical skill name matching the SKILL_TAXONOMY in skill_extractor.py.
"""
from typing import Dict, List
from backend.app.schemas.stage3 import LearningResource

RESOURCE_CATALOGUE: Dict[str, List[LearningResource]] = {
    "Python": [
        LearningResource(
            skill="Python",
            title="Python Official Documentation",
            resource_type="documentation",
            source="python.org",
            url="https://docs.python.org/3/tutorial/",
            description="The official Python tutorial covering all core language features.",
            is_free=True,
        ),
        LearningResource(
            skill="Python",
            title="Python for Everybody — freeCodeCamp",
            resource_type="course",
            source="freeCodeCamp / YouTube",
            url="https://www.youtube.com/watch?v=8DvywoWv6fI",
            description="Beginner-friendly full Python course covering data structures, functions, and files.",
            is_free=True,
        ),
        LearningResource(
            skill="Python",
            title="Real Python Tutorials",
            resource_type="tutorial",
            source="realpython.com",
            url="https://realpython.com/",
            description="Practical Python tutorials from beginner to advanced with project examples.",
            is_free=True,
        ),
    ],
    "SQL": [
        LearningResource(
            skill="SQL",
            title="SQLZoo Interactive SQL Tutorial",
            resource_type="exercise",
            source="sqlzoo.net",
            url="https://sqlzoo.net/wiki/SQL_Tutorial",
            description="Interactive SQL exercises covering SELECT, JOIN, aggregation, and subqueries.",
            is_free=True,
        ),
        LearningResource(
            skill="SQL",
            title="PostgreSQL Official Documentation",
            resource_type="documentation",
            source="postgresql.org",
            url="https://www.postgresql.org/docs/current/tutorial.html",
            description="Official PostgreSQL tutorial covering tables, queries, and transactions.",
            is_free=True,
        ),
        LearningResource(
            skill="SQL",
            title="Mode SQL Tutorial",
            resource_type="tutorial",
            source="mode.com",
            url="https://mode.com/sql-tutorial/",
            description="Structured SQL tutorial from basic queries to advanced analytics.",
            is_free=True,
        ),
    ],
    "REST API": [
        LearningResource(
            skill="REST API",
            title="REST API Design — MDN Web Docs",
            resource_type="documentation",
            source="developer.mozilla.org",
            url="https://developer.mozilla.org/en-US/docs/Glossary/REST",
            description="MDN explanation of REST architecture and HTTP methods.",
            is_free=True,
        ),
        LearningResource(
            skill="REST API",
            title="REST API Tutorial",
            resource_type="tutorial",
            source="restapitutorial.com",
            url="https://www.restapitutorial.com/",
            description="Comprehensive guide to REST API design principles and HTTP status codes.",
            is_free=True,
        ),
    ],
    "Authentication": [
        LearningResource(
            skill="Authentication",
            title="JWT Introduction",
            resource_type="documentation",
            source="jwt.io",
            url="https://jwt.io/introduction",
            description="Official JWT introduction explaining token structure and verification.",
            is_free=True,
        ),
        LearningResource(
            skill="Authentication",
            title="OWASP Authentication Cheat Sheet",
            resource_type="guide",
            source="owasp.org",
            url="https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html",
            description="Security best practices for implementing authentication in web applications.",
            is_free=True,
        ),
    ],
    "Git": [
        LearningResource(
            skill="Git",
            title="Pro Git Book",
            resource_type="documentation",
            source="git-scm.com",
            url="https://git-scm.com/book/en/v2",
            description="The complete, free official Git reference book covering all core concepts.",
            is_free=True,
        ),
        LearningResource(
            skill="Git",
            title="Learn Git Branching",
            resource_type="exercise",
            source="learngitbranching.js.org",
            url="https://learngitbranching.js.org/",
            description="Interactive visual exercises for learning Git branching and merging.",
            is_free=True,
        ),
    ],
    "FastAPI": [
        LearningResource(
            skill="FastAPI",
            title="FastAPI Official Documentation",
            resource_type="documentation",
            source="fastapi.tiangolo.com",
            url="https://fastapi.tiangolo.com/tutorial/",
            description="Official FastAPI tutorial covering path operations, request bodies, and validation.",
            is_free=True,
        ),
        LearningResource(
            skill="FastAPI",
            title="FastAPI Full Course — freeCodeCamp",
            resource_type="course",
            source="freeCodeCamp / YouTube",
            url="https://www.youtube.com/watch?v=0sOvCWFmrtA",
            description="Complete FastAPI course building a real API with authentication and database.",
            is_free=True,
        ),
    ],
    "Spring Boot": [
        LearningResource(
            skill="Spring Boot",
            title="Spring Boot Official Guides",
            resource_type="documentation",
            source="spring.io",
            url="https://spring.io/guides",
            description="Official Spring Boot getting-started guides for REST APIs and data access.",
            is_free=True,
        ),
        LearningResource(
            skill="Spring Boot",
            title="Baeldung Spring Boot Tutorials",
            resource_type="tutorial",
            source="baeldung.com",
            url="https://www.baeldung.com/spring-boot",
            description="Practical Spring Boot tutorials covering REST, security, and JPA.",
            is_free=True,
        ),
    ],
    "OOP": [
        LearningResource(
            skill="OOP",
            title="Object-Oriented Programming in Python — Real Python",
            resource_type="tutorial",
            source="realpython.com",
            url="https://realpython.com/python3-object-oriented-programming/",
            description="Practical guide to classes, inheritance, and encapsulation in Python.",
            is_free=True,
        ),
        LearningResource(
            skill="OOP",
            title="OOP Concepts — GeeksforGeeks",
            resource_type="guide",
            source="geeksforgeeks.org",
            url="https://www.geeksforgeeks.org/object-oriented-programming-oops-concept-in-java/",
            description="Clear explanation of OOP principles with Java and Python examples.",
            is_free=True,
        ),
    ],
    "Node.js": [
        LearningResource(
            skill="Node.js",
            title="Node.js Official Documentation",
            resource_type="documentation",
            source="nodejs.org",
            url="https://nodejs.org/en/docs/guides/",
            description="Official Node.js guides covering the event loop, modules, and HTTP.",
            is_free=True,
        ),
        LearningResource(
            skill="Node.js",
            title="The Odin Project — NodeJS",
            resource_type="course",
            source="theodinproject.com",
            url="https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs",
            description="Free structured Node.js curriculum with projects and exercises.",
            is_free=True,
        ),
    ],
    "HTML": [
        LearningResource(
            skill="HTML",
            title="MDN HTML Basics",
            resource_type="documentation",
            source="developer.mozilla.org",
            url="https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML",
            description="Official MDN introduction to HTML structure, elements, and semantics.",
            is_free=True,
        ),
    ],
    "CSS": [
        LearningResource(
            skill="CSS",
            title="MDN CSS First Steps",
            resource_type="documentation",
            source="developer.mozilla.org",
            url="https://developer.mozilla.org/en-US/docs/Learn/CSS/First_steps",
            description="Official MDN CSS tutorial covering selectors, properties, and layout.",
            is_free=True,
        ),
        LearningResource(
            skill="CSS",
            title="Flexbox Froggy",
            resource_type="exercise",
            source="flexboxfroggy.com",
            url="https://flexboxfroggy.com/",
            description="Interactive game for learning CSS Flexbox layout.",
            is_free=True,
        ),
    ],
    "JavaScript": [
        LearningResource(
            skill="JavaScript",
            title="MDN JavaScript Guide",
            resource_type="documentation",
            source="developer.mozilla.org",
            url="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
            description="Comprehensive official JavaScript guide from basics to advanced topics.",
            is_free=True,
        ),
        LearningResource(
            skill="JavaScript",
            title="javascript.info",
            resource_type="tutorial",
            source="javascript.info",
            url="https://javascript.info/",
            description="Modern JavaScript tutorial covering the language and browser APIs in depth.",
            is_free=True,
        ),
    ],
    "React": [
        LearningResource(
            skill="React",
            title="React Official Documentation",
            resource_type="documentation",
            source="react.dev",
            url="https://react.dev/learn",
            description="Official React tutorial covering components, state, hooks, and effects.",
            is_free=True,
        ),
        LearningResource(
            skill="React",
            title="The Odin Project — React",
            resource_type="course",
            source="theodinproject.com",
            url="https://www.theodinproject.com/paths/full-stack-javascript/courses/react",
            description="Free structured React curriculum with hands-on projects.",
            is_free=True,
        ),
    ],
    "Responsive Design": [
        LearningResource(
            skill="Responsive Design",
            title="MDN Responsive Design Guide",
            resource_type="documentation",
            source="developer.mozilla.org",
            url="https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design",
            description="Official guide to responsive web design using media queries and flexible layouts.",
            is_free=True,
        ),
    ],
    "Excel": [
        LearningResource(
            skill="Excel",
            title="Microsoft Excel Training",
            resource_type="course",
            source="microsoft.com",
            url="https://support.microsoft.com/en-us/office/excel-video-training-9bc05390-e94c-46af-a5b3-d7c22f6990bb",
            description="Official Microsoft Excel training videos from beginner to advanced.",
            is_free=True,
        ),
    ],
    "Statistics": [
        LearningResource(
            skill="Statistics",
            title="Khan Academy Statistics",
            resource_type="course",
            source="khanacademy.org",
            url="https://www.khanacademy.org/math/statistics-probability",
            description="Free statistics and probability course covering descriptive stats, distributions, and inference.",
            is_free=True,
        ),
    ],
    "Power BI": [
        LearningResource(
            skill="Power BI",
            title="Microsoft Power BI Learning",
            resource_type="documentation",
            source="learn.microsoft.com",
            url="https://learn.microsoft.com/en-us/training/powerplatform/power-bi",
            description="Official Microsoft Power BI learning paths from beginner to advanced.",
            is_free=True,
        ),
    ],
    "Data Visualization": [
        LearningResource(
            skill="Data Visualization",
            title="Matplotlib Official Tutorials",
            resource_type="documentation",
            source="matplotlib.org",
            url="https://matplotlib.org/stable/tutorials/index.html",
            description="Official Matplotlib tutorials for creating charts and visualizations in Python.",
            is_free=True,
        ),
        LearningResource(
            skill="Data Visualization",
            title="Seaborn Tutorial",
            resource_type="documentation",
            source="seaborn.pydata.org",
            url="https://seaborn.pydata.org/tutorial.html",
            description="Official Seaborn tutorial for statistical data visualization.",
            is_free=True,
        ),
    ],
    "Java": [
        LearningResource(
            skill="Java",
            title="Oracle Java Tutorials",
            resource_type="documentation",
            source="docs.oracle.com",
            url="https://docs.oracle.com/javase/tutorial/",
            description="Official Oracle Java tutorials covering language basics, OOP, and APIs.",
            is_free=True,
        ),
        LearningResource(
            skill="Java",
            title="Java Programming — freeCodeCamp",
            resource_type="course",
            source="freeCodeCamp / YouTube",
            url="https://www.youtube.com/watch?v=grEKMHGYyns",
            description="Full Java programming course for beginners covering OOP and data structures.",
            is_free=True,
        ),
    ],
}


def get_resources_for_skill(skill_name: str) -> list:
    """Returns learning resources for a given canonical skill name."""
    return RESOURCE_CATALOGUE.get(skill_name, [])


def get_resources_for_skills(skill_names: list) -> dict:
    """Returns a dict of skill -> resources for a list of skill names."""
    return {skill: get_resources_for_skill(skill) for skill in skill_names if get_resources_for_skill(skill)}
