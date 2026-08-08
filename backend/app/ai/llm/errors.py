class LLMProviderError(Exception):
    pass


class LLMProviderConfigurationError(LLMProviderError):
    pass


class LLMProviderAuthenticationError(LLMProviderError):
    pass


class LLMProviderRequestError(LLMProviderError):
    pass


class LLMProviderTimeoutError(LLMProviderError):
    pass


class LLMProviderResponseError(LLMProviderError):
    pass
