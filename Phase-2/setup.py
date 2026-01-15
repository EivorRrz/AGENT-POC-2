"""Phase-2 Physical Model Generator Setup"""
from setuptools import setup, find_packages
from pathlib import Path

readme_file = Path(__file__).parent / "README.md"
long_description = readme_file.read_text(encoding="utf-8") if readme_file.exists() else ""

setup(
    name="phase2-mysql-physical-model",
    version="1.0.0",
    author="EY POC Team - Amit Mishra",
    description="MySQL Physical SQL DDL and ERD generator",
    long_description=long_description,
    long_description_content_type="text/markdown",
    packages=find_packages(exclude=["tests", "tests.*"]),
    python_requires=">=3.9",
    install_requires=[
        "python-dotenv>=1.0.0",
        "pydantic>=2.5.0",
        "click>=8.1.7",
        "rich>=13.7.0",
        "pyppeteer>=1.0.2",
        "Pillow>=10.1.0",
    ],
    entry_points={
        "console_scripts": [
            "phase2-generate=src.main:main",
        ],
    },
)

