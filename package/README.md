# Azalea - The AI-Native Programming Language

![Azalea Banner](https://via.placeholder.com/1200x300/424658/ffc5cd?text=Azalea+AI+Native)

[![npm version](https://badge.fury.io/js/azae.svg)](https://badge.fury.io/js/azae)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Azalea is a revolutionary programming language with **Large Language Models embedded in the runtime**. It replaces traditional glue code with semantic instructions, features self-healing execution, and includes autonomous agent primitives.

## Key Features

*   **AI-Aware Compiler:** Instructions like `import ai` generate code on the fly.
*   **Semantic Search:** `rag "query"` built-in for vector retrieval.
*   **Agent Loops:** `agent Name: ...` creates autonomous loops with memory.
*   **Data Inspector:** `inspect(var)` uses AI to explain runtime state.
*   **Self-Healing:** Runtime errors trigger automatic AI analysis and suggestion.

## Installation

Install the official compiler and CLI tool via NPM:

```bash
npm install -g azae
```

## Usage

Create a file named `main.az`:

```azalea
fn main():
    # Generate a module for game logic
    import ai "chess_utils"
    
    # Use an autonomous agent
    agent PlayerOne:
        ai "Make a move"
        
    rag "How does the pawn move?"
```

Run it:

```bash
azae main.az
```

## VS Code Extension

Install "Azalea AI" from the VS Code marketplace for full syntax highlighting and AI integration.

## License

MIT © 2025 Azalea Team

