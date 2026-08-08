"""Configuration for the document chunking layer.

Token sizes are approximated with a simple deterministic character-based
measure (4 characters per token) so no external tokenizer dependency is
required at this stage.
"""

CHARS_PER_TOKEN = 4

TARGET_TOKENS = 1200
OVERLAP_TOKENS = 150

TARGET_CHARS = TARGET_TOKENS * CHARS_PER_TOKEN
OVERLAP_CHARS = OVERLAP_TOKENS * CHARS_PER_TOKEN
