import { TokenType } from './types';
import type { Token, Program, Statement, Expression, FunctionDeclaration, VariableDeclaration, IfStatement, WhileStatement, ReturnStatement, ExpressionStatement, BinaryExpression, CallExpression, Identifier, Literal, UIPrimitive, GenerateStatement, AIOptimizeStatement } from './types';



export class Parser {
    private tokens: Token[];
    private current: number = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    public parse(): Program {
        const body: Statement[] = [];
        while (!this.isAtEnd()) {
            // Skip top-level newlines
            while (this.match(TokenType.NEWLINE)) { }
            if (this.isAtEnd()) break;

            body.push(this.parseStatement());

            // Consume newlines after statement
            while (this.match(TokenType.NEWLINE)) { }
        }
        return { type: 'Program', body };
    }

    private parseStatement(): Statement {
        if (this.match(TokenType.FUNCTION)) return this.parseFunction();
        if (this.match(TokenType.VAR)) return this.parseVariable();
        if (this.match(TokenType.RETURN)) return this.parseReturn();
        if (this.match(TokenType.IF)) return this.parseIf();
        if (this.match(TokenType.WHILE)) return this.parseWhile();
        if (this.match(TokenType.GENERATE)) return this.parseGenerate();
        if (this.match(TokenType.AI_OPTIMIZE)) return this.parseAIOptimize();

        return this.parseExpressionStatement();
    }

    private parseFunction(): FunctionDeclaration {
        const name = this.consume(TokenType.IDENTIFIER, "Expected function name").value;
        this.consume(TokenType.LPAREN, "Expected '(' after function name");

        const params: string[] = [];
        if (!this.check(TokenType.RPAREN)) {
            do {
                params.push(this.consume(TokenType.IDENTIFIER, "Expected parameter name").value);
            } while (this.match(TokenType.COMMA));
        }
        this.consume(TokenType.RPAREN, "Expected ')' after parameters");
        this.consume(TokenType.COLON, "Expected ':' before function body");

        const body = this.parseBlock();
        return { type: 'FunctionDeclaration', name, params, body };
    }

    private parseVariable(): VariableDeclaration {
        const name = this.consume(TokenType.IDENTIFIER, "Expected variable name").value;
        let init: Expression | null = null;
        if (this.match(TokenType.ASSIGN)) {
            init = this.parseExpression();
        }
        // Semicolon is optional/replaced by newline, so we don't consume it explicitly here
        // but the main loop will handle newlines.
        return { type: 'VariableDeclaration', name, init };
    }

    private parseReturn(): ReturnStatement {
        let argument: Expression | null = null;
        if (!this.check(TokenType.NEWLINE) && !this.isAtEnd()) {
            argument = this.parseExpression();
        }
        return { type: 'ReturnStatement', argument };
    }

    private parseIf(): IfStatement {
        const test = this.parseExpression();
        this.consume(TokenType.COLON, "Expected ':' after if condition");

        const consequent = this.parseBlock();
        let alternate: Statement[] | null = null;

        // Check for else
        // We might have newlines before else
        const savedCurrent = this.current;
        while (this.match(TokenType.NEWLINE)) { }

        if (this.match(TokenType.ELSE)) {
            this.consume(TokenType.COLON, "Expected ':' after else");
            alternate = this.parseBlock();
        } else {
            // Backtrack if no else found (restore consumed newlines if any, 
            // though usually we want to consume them if they are just spacing. 
            // Actually, if there's no else, we just continue. 
            // But if we consumed newlines and found something else, we might be eating into next statement.
            // However, parseBlock consumes the DEDENT, so we should be at the right level.
            // If we are at the same level, we might see 'else'.
            this.current = savedCurrent;
        }

        return { type: 'IfStatement', test, consequent, alternate };
    }

    private parseWhile(): WhileStatement {
        const test = this.parseExpression();
        this.consume(TokenType.COLON, "Expected ':' after while condition");
        const body = this.parseBlock();
        return { type: 'WhileStatement', test, body };
    }

    private parseGenerate(): GenerateStatement {
        // generate function name(args): description "..."
        this.consume(TokenType.FUNCTION, "Expected 'function' after generate");
        const name = this.consume(TokenType.IDENTIFIER, "Expected function name").value;
        this.consume(TokenType.LPAREN, "Expected '('");
        const params: string[] = [];
        if (!this.check(TokenType.RPAREN)) {
            do {
                params.push(this.consume(TokenType.IDENTIFIER, "Expected parameter name").value);
            } while (this.match(TokenType.COMMA));
        }
        this.consume(TokenType.RPAREN, "Expected ')'");
        this.consume(TokenType.COLON, "Expected ':'");
        this.consume(TokenType.DESCRIPTION, "Expected 'description'");
        const description = this.consume(TokenType.STRING, "Expected description string").value;

        return { type: 'GenerateStatement', name, params, description };
    }

    private parseAIOptimize(): AIOptimizeStatement {
        this.consume(TokenType.COLON, "Expected ':' after ai.optimize");
        const body = this.parseBlock();
        return { type: 'AIOptimizeStatement', body };
    }

    private parseBlock(): Statement[] {
        this.consume(TokenType.NEWLINE, "Expected newline before block");
        while (this.match(TokenType.NEWLINE)) { }
        this.consume(TokenType.INDENT, "Expected indentation");

        const statements: Statement[] = [];
        while (!this.check(TokenType.DEDENT) && !this.isAtEnd()) {
            // Skip extra newlines inside block
            while (this.match(TokenType.NEWLINE)) { }
            if (this.check(TokenType.DEDENT) || this.isAtEnd()) break;

            statements.push(this.parseStatement());

            while (this.match(TokenType.NEWLINE)) { }
        }

        this.consume(TokenType.DEDENT, "Expected dedent after block");
        return statements;
    }

    private parseExpressionStatement(): ExpressionStatement {
        const expression = this.parseExpression();
        return { type: 'ExpressionStatement', expression };
    }

    private parseExpression(): Expression {
        return this.parseComparison();
    }

    private parseComparison(): Expression {
        let expr = this.parseTerm();

        while (this.match(TokenType.LESS_THAN, TokenType.GREATER_THAN, TokenType.EQUALS, TokenType.NOT_EQUALS)) {
            const operator = this.previous().value;
            const right = this.parseTerm();
            expr = { type: 'BinaryExpression', operator, left: expr, right };
        }

        return expr;
    }

    private parseTerm(): Expression {
        let expr = this.parseFactor();

        while (this.match(TokenType.PLUS, TokenType.MINUS)) {
            const operator = this.previous().value;
            const right = this.parseFactor();
            expr = { type: 'BinaryExpression', operator, left: expr, right };
        }

        return expr;
    }

    private parseFactor(): Expression {
        let expr = this.parsePrimary();

        while (this.match(TokenType.MULTIPLY, TokenType.DIVIDE)) {
            const operator = this.previous().value;
            const right = this.parsePrimary();
            expr = { type: 'BinaryExpression', operator, left: expr, right };
        }

        return expr;
    }

    private parsePrimary(): Expression {
        if (this.match(TokenType.NUMBER)) {
            return { type: 'Literal', value: parseFloat(this.previous().value), raw: this.previous().value };
        }
        if (this.match(TokenType.STRING)) {
            return { type: 'Literal', value: this.previous().value, raw: this.previous().value };
        }
        if (this.match(TokenType.IDENTIFIER)) {
            const name = this.previous().value;
            // Check for function call
            if (this.match(TokenType.LPAREN)) {
                const args: Expression[] = [];
                if (!this.check(TokenType.RPAREN)) {
                    do {
                        args.push(this.parseExpression());
                    } while (this.match(TokenType.COMMA));
                }
                this.consume(TokenType.RPAREN, "Expected ')' after arguments");
                return { type: 'CallExpression', callee: { type: 'Identifier', name }, arguments: args };
            }
            return { type: 'Identifier', name };
        }
        // UI Primitives
        if (this.match(TokenType.BOX, TokenType.TEXT, TokenType.BUTTON)) {
            const type = this.previous().type;
            const elementType = type === TokenType.BOX ? 'box' : type === TokenType.TEXT ? 'text' : 'button';

            // Parse arguments like a function call: box(arg1, arg2)
            const args: Expression[] = [];
            if (this.match(TokenType.LPAREN)) {
                if (!this.check(TokenType.RPAREN)) {
                    do {
                        args.push(this.parseExpression());
                    } while (this.match(TokenType.COMMA));
                }
                this.consume(TokenType.RPAREN, "Expected ')'");
            }

            // Parse children block if present (colon + indent)
            const children: Expression[] = [];
            if (this.match(TokenType.COLON)) {
                // It's a block of UI elements
                this.consume(TokenType.NEWLINE, "Expected newline");
                while (this.match(TokenType.NEWLINE)) { }
                this.consume(TokenType.INDENT, "Expected indent");
                while (!this.check(TokenType.DEDENT) && !this.isAtEnd()) {
                    while (this.match(TokenType.NEWLINE)) { }
                    if (this.check(TokenType.DEDENT)) break;
                    // We expect expressions (UI elements) here
                    children.push(this.parseExpression());
                    while (this.match(TokenType.NEWLINE)) { }
                }
                this.consume(TokenType.DEDENT, "Expected dedent");
            }

            return {
                type: 'UIPrimitive',
                elementType,
                props: { args: args as any }, // Hack to store args in props for now
                children
            };
        }

        if (this.match(TokenType.LPAREN)) {
            const expr = this.parseExpression();
            this.consume(TokenType.RPAREN, "Expected ')' after expression");
            return expr;
        }

        throw new Error(`Unexpected token: ${this.peek().type} at line ${this.peek().line}`);
    }

    private match(...types: TokenType[]): boolean {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    private check(type: TokenType): boolean {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    private advance(): Token {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    private isAtEnd(): boolean {
        return this.peek().type === TokenType.EOF;
    }

    private peek(): Token {
        return this.tokens[this.current];
    }

    private previous(): Token {
        return this.tokens[this.current - 1];
    }

    private consume(type: TokenType, message: string): Token {
        if (this.check(type)) return this.advance();
        throw new Error(`${message} at line ${this.peek().line}`);
    }
}
