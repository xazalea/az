import { TokenType } from './types';
import type { Token } from './types';

export class Lexer {
    private input: string;
    private position: number = 0;
    private line: number = 1;
    private column: number = 1;
    private indentStack: number[] = [0];
    private tokens: Token[] = [];

    constructor(input: string) {
        this.input = input;
    }

    public tokenize(): Token[] {
        this.tokens = [];
        this.position = 0;
        this.line = 1;
        this.column = 1;
        this.indentStack = [0];

        while (this.position < this.input.length) {
            // Handle Indentation at start of line
            if (this.column === 1) {
                this.handleIndentation();
                if (this.position >= this.input.length) break;
            }

            const char = this.peek();

            if (this.isWhitespace(char)) {
                this.skipWhitespace();
                continue;
            }

            if (char === '\n') {
                this.addToken(TokenType.NEWLINE, '\n');
                this.advance();
                this.line++;
                this.column = 1;
                continue;
            }

            if (char === '#') {
                this.skipComment();
                continue;
            }

            if (this.isAlpha(char)) {
                this.identifier();
                continue;
            }

            if (this.isDigit(char)) {
                this.number();
                continue;
            }

            if (char === '"' || char === "'") {
                this.string(char);
                continue;
            }

            this.handleSymbol(char);
        }

        // Emit remaining DEDENTs at EOF
        while (this.indentStack.length > 1) {
            this.indentStack.pop();
            this.addToken(TokenType.DEDENT, '');
        }
        this.addToken(TokenType.EOF, '');

        return this.tokens;
    }

    private handleIndentation() {
        let indentLevel = 0;
        let spaces = 0;
        
        // Look ahead to count indentation
        let i = 0;
        while (this.position + i < this.input.length) {
            const c = this.input[this.position + i];
            if (c === ' ') {
                spaces++;
                i++;
            } else if (c === '\t') {
                spaces += 4; // Assume tab is 4 spaces
                i++;
            } else {
                break;
            }
        }
        indentLevel = spaces;

        // If line is empty or just a comment, ignore indentation
        let isLineEmpty = false;
        if (this.position + i >= this.input.length || this.input[this.position + i] === '\n') {
            isLineEmpty = true;
        } else if (this.input[this.position + i] === '#') {
            isLineEmpty = true; // Treat comment-only lines as empty for indentation purposes
        }

        if (isLineEmpty) {
            // Consume the whitespace/comment but don't generate INDENT/DEDENT
            // actually, if it's a comment, we might want to preserve it?
            // But usually comments are ignored or handled separately.
            // The loop in tokenize() handles comments.
            // We just need to skip the indentation characters here if the line is effectively empty.
            // But wait, if we consume them here, tokenize loop won't see them.
            // Better: if line is empty, we do nothing here, and let the main loop consume whitespace/newline.
            return;
        }

        // Consuming indentation characters
        while (i > 0) {
            this.advance();
            i--;
        }

        const currentIndent = this.indentStack[this.indentStack.length - 1];

        if (indentLevel > currentIndent) {
            this.indentStack.push(indentLevel);
            this.addToken(TokenType.INDENT, '');
        } else if (indentLevel < currentIndent) {
            while (this.indentStack.length > 1 && this.indentStack[this.indentStack.length - 1] > indentLevel) {
                this.indentStack.pop();
                this.addToken(TokenType.DEDENT, '');
            }
            if (this.indentStack[this.indentStack.length - 1] !== indentLevel) {
                throw new Error(`Indentation error at line ${this.line}. Expected ${this.indentStack[this.indentStack.length - 1]} but got ${indentLevel}.`);
            }
        }
    }

    private handleSymbol(char: string) {
        switch (char) {
            case '+': this.addToken(TokenType.PLUS, '+'); this.advance(); break;
            case '-': this.addToken(TokenType.MINUS, '-'); this.advance(); break;
            case '*': this.addToken(TokenType.MULTIPLY, '*'); this.advance(); break;
            case '/': this.addToken(TokenType.DIVIDE, '/'); this.advance(); break;
            case '=':
                if (this.peek(1) === '=') {
                    this.addToken(TokenType.EQUALS, '==');
                    this.advance(); this.advance();
                } else {
                    this.addToken(TokenType.ASSIGN, '=');
                    this.advance();
                }
                break;
            case '!':
                if (this.peek(1) === '=') {
                    this.addToken(TokenType.NOT_EQUALS, '!=');
                    this.advance(); this.advance();
                } else {
                    throw new Error(`Unexpected character '!' at line ${this.line}`);
                }
                break;
            case '<': this.addToken(TokenType.LESS_THAN, '<'); this.advance(); break;
            case '>': this.addToken(TokenType.GREATER_THAN, '>'); this.advance(); break;
            case '(': this.addToken(TokenType.LPAREN, '('); this.advance(); break;
            case ')': this.addToken(TokenType.RPAREN, ')'); this.advance(); break;
            case ',': this.addToken(TokenType.COMMA, ','); this.advance(); break;
            case ':': this.addToken(TokenType.COLON, ':'); this.advance(); break;
            default:
                throw new Error(`Unexpected character '${char}' at line ${this.line}`);
        }
    }

    private advance() {
        this.position++;
        this.column++;
    }

    private peek(offset: number = 0): string {
        return this.input[this.position + offset];
    }

    private addToken(type: TokenType, value: string) {
        this.tokens.push({ type, value, line: this.line, column: this.column });
    }

    private isWhitespace(char: string): boolean {
        return char === ' ' || char === '\t' || char === '\r';
    }

    private skipWhitespace() {
        while (this.position < this.input.length && this.isWhitespace(this.peek())) {
            this.advance();
        }
    }

    private skipComment() {
        while (this.position < this.input.length && this.peek() !== '\n') {
            this.advance();
        }
    }

    private isAlpha(char: string): boolean {
        return /[a-zA-Z_]/.test(char);
    }

    private isDigit(char: string): boolean {
        return /[0-9]/.test(char);
    }

    private identifier() {
        let value = '';
        while (this.position < this.input.length && (this.isAlpha(this.peek()) || this.isDigit(this.peek()) || this.peek() === '.')) {
            value += this.peek();
            this.advance();
        }

        switch (value) {
            case 'fn': this.addToken(TokenType.FUNCTION, value); break;
            case 'return': this.addToken(TokenType.RETURN, value); break;
            case 'if': this.addToken(TokenType.IF, value); break;
            case 'else': this.addToken(TokenType.ELSE, value); break;
            case 'while': this.addToken(TokenType.WHILE, value); break;
            case 'var':
            case 'let':
                this.addToken(TokenType.VAR, value); break;
            case 'box': this.addToken(TokenType.BOX, value); break;
            case 'text': this.addToken(TokenType.TEXT, value); break;
            case 'button': this.addToken(TokenType.BUTTON, value); break;
            case 'generate': this.addToken(TokenType.GENERATE, value); break;
            case 'description': this.addToken(TokenType.DESCRIPTION, value); break;
            case 'ai.optimize': this.addToken(TokenType.AI_OPTIMIZE, value); break;
            case 'ai': this.addToken(TokenType.AI, value); break;
            default: this.addToken(TokenType.IDENTIFIER, value); break;
        }
    }

    private number() {
        let value = '';
        while (this.position < this.input.length && this.isDigit(this.peek())) {
            value += this.peek();
            this.advance();
        }
        this.addToken(TokenType.NUMBER, value);
    }

    private string(quote: string) {
        this.advance(); // Skip opening quote
        let value = '';
        while (this.position < this.input.length && this.peek() !== quote) {
            // Handle escape characters if needed? For now basic string
            value += this.peek();
            this.advance();
        }
        this.advance(); // Skip closing quote
        this.addToken(TokenType.STRING, value);
    }
}
