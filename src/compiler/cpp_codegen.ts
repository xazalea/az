import type { Program, Statement, Expression, FunctionDeclaration, IfStatement, WhileStatement, VariableDeclaration, ReturnStatement, ExpressionStatement, BinaryExpression, CallExpression, Literal, Identifier } from './types';

export class CppGenerator {
    public generate(program: Program): string {
        let code = '#include <iostream>\n#include <string>\n#include <vector>\n#include <functional>\n\n';
        code += 'using namespace std;\n\n';

        // Helper for UI primitives (mocked for C++ console)
        code += 'void box() { cout << "[BOX]" << endl; }\n';
        code += 'void text(string content) { cout << content << endl; }\n';
        code += 'void button(string label) { cout << "[BUTTON: " << label << "]" << endl; }\n\n';

        for (const stmt of program.body) {
            code += this.generateStatement(stmt);
        }
        return code;
    }

    private generateStatement(stmt: Statement): string {
        switch (stmt.type) {
            case 'FunctionDeclaration':
                return this.generateFunction(stmt as FunctionDeclaration);
            case 'VariableDeclaration':
                return this.generateVariable(stmt as VariableDeclaration);
            case 'ReturnStatement':
                return this.generateReturn(stmt as ReturnStatement);
            case 'IfStatement':
                return this.generateIf(stmt as IfStatement);
            case 'WhileStatement':
                return this.generateWhile(stmt as WhileStatement);
            case 'ExpressionStatement':
                return this.generateExpression((stmt as ExpressionStatement).expression) + ';\n';
            case 'GenerateStatement':
                return '// [AI Generated Function Placeholder]\n';
            case 'AIOptimizeStatement':
                return '// [AI Optimized Block Placeholder]\n';
            default:
                return '';
        }
    }

    private generateFunction(func: FunctionDeclaration): string {
        // Infer return type as auto for simplicity in C++14/17, or void if no return.
        // For this prototype, we'll use auto.
        const params = func.params.map(p => `auto ${p}`).join(', ');
        let code = `auto ${func.name}(${params}) {\n`;
        for (const stmt of func.body) {
            code += '    ' + this.generateStatement(stmt).replace(/\n/g, '\n    ').trimEnd() + '\n';
        }
        code += '}\n\n';
        return code;
    }

    private generateVariable(decl: VariableDeclaration): string {
        const init = decl.init ? this.generateExpression(decl.init) : '0';
        return `auto ${decl.name} = ${init};\n`;
    }

    private generateReturn(stmt: ReturnStatement): string {
        const arg = stmt.argument ? this.generateExpression(stmt.argument) : '';
        return `return ${arg};\n`;
    }

    private generateIf(stmt: IfStatement): string {
        let code = `if (${this.generateExpression(stmt.test)}) {\n`;
        for (const s of stmt.consequent) {
            code += '    ' + this.generateStatement(s).replace(/\n/g, '\n    ').trimEnd() + '\n';
        }
        code += '}';
        if (stmt.alternate) {
            code += ' else {\n';
            for (const s of stmt.alternate) {
                code += '    ' + this.generateStatement(s).replace(/\n/g, '\n    ').trimEnd() + '\n';
            }
            code += '}';
        }
        return code + '\n';
    }

    private generateWhile(stmt: WhileStatement): string {
        let code = `while (${this.generateExpression(stmt.test)}) {\n`;
        for (const s of stmt.body) {
            code += '    ' + this.generateStatement(s).replace(/\n/g, '\n    ').trimEnd() + '\n';
        }
        code += '}\n';
        return code;
    }

    private generateExpression(expr: Expression): string {
        switch (expr.type) {
            case 'BinaryExpression':
                const bin = expr as BinaryExpression;
                return `${this.generateExpression(bin.left)} ${bin.operator} ${this.generateExpression(bin.right)}`;
            case 'CallExpression':
                const call = expr as CallExpression;
                const args = call.arguments.map(a => this.generateExpression(a)).join(', ');
                return `${call.callee.name}(${args})`;
            case 'Literal':
                const lit = expr as Literal;
                return typeof lit.value === 'string' ? `"${lit.value}"` : String(lit.value);
            case 'Identifier':
                return (expr as Identifier).name;
            case 'UIPrimitive':
                const ui = expr as any; // UIPrimitive
                // Map UI to function calls
                const uiArgs = (ui.props as any).args || [];
                const argStr = uiArgs.map((a: any) => this.generateExpression(a)).join(', ');
                
                if (ui.children && ui.children.length > 0) {
                    let blockCode = `[&]() { ${ui.elementType}(${argStr});\n`;
                    for (const child of ui.children) {
                        blockCode += '        ' + this.generateExpression(child) + ';\n';
                    }
                    blockCode += '    }()';
                    return blockCode;
                }
                
                return `${ui.elementType}(${argStr})`;
            default:
                return '';
        }
    }
}
