"""
Language configuration for the Mandarin learning application.

This module centralizes language-specific settings, allowing easy addition of new languages
and maintainability of language-to-API-code mappings.
"""

LANGUAGE_CONFIG = {
    'en': {
        'deepl_code': 'EN-US',
        'argos_code': 'en',
        'name': 'English',
        'default_translators': ['deepl', 'argos'],  # Priority order
        'label': 'English',
    },
    'de': {
        'deepl_code': 'DE',
        'argos_code': 'de',
        'name': 'German',
        'default_translators': ['deepl', 'argos'],
        'label': 'Deutsch',
    },
    # Future languages can be added here:
    # 'fr': {
    #     'deepl_code': 'FR',
    #     'argos_code': 'fr',
    #     'name': 'French',
    #     'default_translators': ['deepl', 'argos'],
    #     'label': 'Français',
    # },
}

SUPPORTED_LANGUAGES = tuple(LANGUAGE_CONFIG.keys())
DEFAULT_LANGUAGE = 'en'


def get_language_config(language_code):
    """
    Get language configuration for a given language code.
    
    Args:
        language_code (str): Language code (e.g., 'en', 'de')
        
    Returns:
        dict: Language configuration, defaults to English config if not found
    """
    return LANGUAGE_CONFIG.get(language_code, LANGUAGE_CONFIG[DEFAULT_LANGUAGE])


def is_supported_language(language_code):
    """Check if a language is supported."""
    return language_code in SUPPORTED_LANGUAGES
