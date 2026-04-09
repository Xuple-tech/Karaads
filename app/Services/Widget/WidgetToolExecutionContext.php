<?php

namespace App\Services\Widget;

class WidgetToolExecutionContext
{
    /** @var array<string, callable> */
    private array $handlers = [];

    public function activate(array $handlers): void
    {
        $this->handlers = $handlers;
    }

    public function clear(): void
    {
        $this->handlers = [];
    }

    public function hasHandler(string $name): bool
    {
        return isset($this->handlers[$name]);
    }

    public function execute(string $name, array $arguments): array
    {
        if (! $this->hasHandler($name)) {
            throw new \RuntimeException("Dynamic tool {$name} is not available.");
        }

        return ($this->handlers[$name])($arguments);
    }
}
