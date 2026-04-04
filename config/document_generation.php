<?php

return [
    'python_binary' => env('DOCUMENT_PYTHON_BINARY', 'py'),
    'venv_path' => env('DOCUMENT_PYTHON_VENV', base_path('_services/docgen/.venv')),
    'entrypoint' => env('DOCUMENT_PYTHON_ENTRYPOINT', base_path('_services/docgen/main.py')),
    'timeout' => (int) env('DOCUMENT_PYTHON_TIMEOUT', 120),
    'bootstrap' => filter_var(env('DOCUMENT_PYTHON_BOOTSTRAP', false), FILTER_VALIDATE_BOOL),
];
