"""
Root conftest.py — ensures the project root is on sys.path so that
`backend.*` imports resolve correctly when pytest is run from any directory.
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
