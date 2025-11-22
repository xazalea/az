import type { Program, Statement, Expression, BinaryExpression, Literal, Identifier, CallExpression, VariableDeclaration, FunctionDeclaration, IfStatement, WhileStatement, ReturnStatement, ExpressionStatement, UIPrimitive } from './types';


export class CodeGenerator {
    public generate(program: Program): string {
        const functions = program.body
            .filter(stmt => stmt.type === 'FunctionDeclaration')
            .map(stmt => this.generateFunction(stmt as FunctionDeclaration))
            .join('\n');

        // Standard imports for UI
        const imports = `
  (import "env" "log" (func $log (param i32)))
  (import "env" "createBox" (func $createBox (result i32)))
  (import "env" "createText" (func $createText (param i32 i32) (result i32)))
  (import "env" "createButton" (func $createButton (param i32 i32) (result i32)))
  (import "env" "appendChild" (func $appendChild (param i32 i32)))
  (memory $memory 1)
  (export "memory" (memory $memory))
`;

        return `(module${imports}\n${functions}\n)`;
    }

    private generateFunction(func: FunctionDeclaration): string {
        const params = func.params.map((_, i) => `(param $p${i} i32)`).join(' ');
        const body = func.body.map(stmt => this.generateStatement(stmt)).join('\n');

        // Auto-export main function
        const exportStr = func.name === 'main' ? `(export "main" (func $${func.name}))` : '';

        return `  (func $${func.name} ${params} (result i32)\n    (local $scratch i32)\n${body}\n    (i32.const 0)\n  )\n  ${exportStr}`;
    }

    private generateStatement(stmt: Statement): string {
        switch (stmt.type) {
            case 'ReturnStatement':
                return this.generateReturn(stmt as ReturnStatement);
            case 'ExpressionStatement':
                return `    ${this.generateExpression((stmt as ExpressionStatement).expression)}\n    drop`;
            case 'VariableDeclaration':
                // WASM locals must be declared at function start. 
                // For simplicity in this prototype, we'll assume locals are pre-declared or use a stack machine approach purely.
                // But WAT requires locals declaration.
                // TODO: Better local handling. For now, just evaluating init.
                return this.generateExpression((stmt as VariableDeclaration).init!);
            case 'IfStatement':
                return this.generateIf(stmt as IfStatement);
            case 'WhileStatement':
                return this.generateWhile(stmt as WhileStatement);
            default:
                return '';
        }
    }

    private generateReturn(stmt: ReturnStatement): string {
        if (stmt.argument) {
            return `    ${this.generateExpression(stmt.argument)}\n    return`;
        }
        return '    return';
    }

    private generateIf(stmt: IfStatement): string {
        const test = this.generateExpression(stmt.test);
        const consequent = stmt.consequent.map(s => this.generateStatement(s)).join('\n');
        const alternate = stmt.alternate ? stmt.alternate.map(s => this.generateStatement(s)).join('\n') : '';

        return `    ${test}\n    (if\n      (then\n${consequent}\n      )\n      (else\n${alternate}\n      )\n    )`;
    }

    private generateWhile(stmt: WhileStatement): string {
        const test = this.generateExpression(stmt.test);
        const body = stmt.body.map(s => this.generateStatement(s)).join('\n');

        return `    (block $break\n      (loop $continue\n        ${test}\n        i32.eqz\n        br_if $break\n${body}\n        br $continue\n      )\n    )`;
    }

    private generateExpression(expr: Expression): string {
        switch (expr.type) {
            case 'Literal':
                const lit = expr as Literal;
                if (typeof lit.value === 'number') {
                    return `(i32.const ${lit.value})`;
                }
                // String handling is complex in WASM. For now, returning pointer 0.
                return `(i32.const 0)`;
            case 'BinaryExpression':
                return this.generateBinary(expr as BinaryExpression);
            case 'Identifier':
                // TODO: Resolve local variable index
                return `(local.get 0)`; // Placeholder
            case 'CallExpression':
                return this.generateCall(expr as CallExpression);
            case 'UIPrimitive':
                return this.generateUI(expr as UIPrimitive);
            default:
                return '';
        }
    }

    private generateBinary(expr: BinaryExpression): string {
        const left = this.generateExpression(expr.left);
        const right = this.generateExpression(expr.right);
        let op = '';
        switch (expr.operator) {
            case '+': op = 'i32.add'; break;
            case '-': op = 'i32.sub'; break;
            case '*': op = 'i32.mul'; break;
            case '/': op = 'i32.div_s'; break;
            case '==': op = 'i32.eq'; break;
            case '!=': op = 'i32.ne'; break;
            case '<': op = 'i32.lt_s'; break;
            case '>': op = 'i32.gt_s'; break;
        }
        return `${left}\n${right}\n${op}`;
    }

    private generateCall(expr: CallExpression): string {
        const args = expr.arguments.map(a => this.generateExpression(a)).join('\n');
        return `${args}\ncall $${expr.callee.name}`;
    }

    private generateUI(expr: UIPrimitive): string {
        // UI generation logic
        // 1. Call create function
        // 2. For each child, generate child, then append to parent
        let createFn = '';
        switch (expr.elementType) {
            case 'box': createFn = 'call $createBox'; break;
            case 'text': createFn = 'i32.const 0\ni32.const 0\ncall $createText'; break; // TODO: Pass string ptr
            case 'button': createFn = 'i32.const 0\ni32.const 0\ncall $createButton'; break;
        }

        // We need to store the result of createFn to append children.
        // But WASM stack machine makes this tricky without locals.
        // For this prototype, we'll just return the created element ID.
        return createFn;
    }
}
