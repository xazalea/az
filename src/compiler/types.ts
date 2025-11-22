export const TokenType = {
    // Keywords
    FUNCTION: 'FUNCTION',
    RETURN: 'RETURN',
    IF: 'IF',
    ELSE: 'ELSE',
    WHILE: 'WHILE',
    VAR: 'VAR',
    BOX: 'BOX', // UI Primitive
    TEXT: 'TEXT', // UI Primitive
    BUTTON: 'BUTTON', // UI Primitive

    // Identifiers & Literals
    IDENTIFIER: 'IDENTIFIER',
    NUMBER: 'NUMBER',
    STRING: 'STRING',

    // Operators
    ASSIGN: 'ASSIGN',
    PLUS: 'PLUS',
    MINUS: 'MINUS',
    MULTIPLY: 'MULTIPLY',
    DIVIDE: 'DIVIDE',
    EQUALS: 'EQUALS',
    NOT_EQUALS: 'NOT_EQUALS',
    LESS_THAN: 'LESS_THAN',
    GREATER_THAN: 'GREATER_THAN',

    // Delimiters
    LPAREN: 'LPAREN',
    RPAREN: 'RPAREN',
    COMMA: 'COMMA',
    COLON: 'COLON', // Used for blocks: if x: ...

    // Indentation / Structure
    NEWLINE: 'NEWLINE',
    INDENT: 'INDENT',
    DEDENT: 'DEDENT',

    // Special
    EOF: 'EOF',
    AI_ENHANCE: 'AI_ENHANCE', // Special token for AI enhancement
    GENERATE: 'GENERATE',
    DESCRIPTION: 'DESCRIPTION',
    AI_OPTIMIZE: 'AI_OPTIMIZE',
    AI: 'AI',
} as const;

export type TokenType = typeof TokenType[keyof typeof TokenType];

export interface Token {
    type: TokenType;
    value: string;
    line: number;
    column: number;
}

// AST Nodes
export interface ASTNode {
    type: string;
}

export interface Program extends ASTNode {
    type: 'Program';
    body: Statement[];
}

export type Statement =
    | FunctionDeclaration
    | ReturnStatement
    | IfStatement
    | WhileStatement
    | VariableDeclaration
    | ExpressionStatement
    | GenerateStatement
    | AIOptimizeStatement
    | AIStatement;

export interface AIStatement extends ASTNode {
    type: 'AIStatement';
    instruction?: string;
    body?: Statement[];
}

export interface GenerateStatement extends ASTNode {
    type: 'GenerateStatement';
    name: string;
    params: string[];
    description: string;
}

export interface AIOptimizeStatement extends ASTNode {
    type: 'AIOptimizeStatement';
    body: Statement[];
}

export interface FunctionDeclaration extends ASTNode {
    type: 'FunctionDeclaration';
    name: string;
    params: string[];
    body: Statement[];
}

export interface ReturnStatement extends ASTNode {
    type: 'ReturnStatement';
    argument: Expression | null;
}

export interface IfStatement extends ASTNode {
    type: 'IfStatement';
    test: Expression;
    consequent: Statement[];
    alternate: Statement[] | null;
}

export interface WhileStatement extends ASTNode {
    type: 'WhileStatement';
    test: Expression;
    body: Statement[];
}

export interface VariableDeclaration extends ASTNode {
    type: 'VariableDeclaration';
    name: string;
    init: Expression | null;
}

export interface ExpressionStatement extends ASTNode {
    type: 'ExpressionStatement';
    expression: Expression;
}

export type Expression =
    | BinaryExpression
    | Identifier
    | Literal
    | CallExpression
    | UIPrimitive;

export interface BinaryExpression extends ASTNode {
    type: 'BinaryExpression';
    operator: string;
    left: Expression;
    right: Expression;
}

export interface Identifier extends ASTNode {
    type: 'Identifier';
    name: string;
}

export interface Literal extends ASTNode {
    type: 'Literal';
    value: string | number;
    raw: string;
}

export interface CallExpression extends ASTNode {
    type: 'CallExpression';
    callee: Identifier;
    arguments: Expression[];
}

export interface UIPrimitive extends ASTNode {
    type: 'UIPrimitive';
    elementType: 'box' | 'text' | 'button';
    props: Record<string, Expression>;
    children: Expression[]; // UI elements can nest
}
