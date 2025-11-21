import type { ASTNode, Statement, Expression, Program } from './types';

export function astToSource(node: ASTNode): string {
    if (!node) return '';

    switch (node.type) {
        case 'Program':
            return (node as Program).body.map(astToSource).join('\n');

        case 'FunctionDeclaration':
            const fn = node as any;
            return `fn ${fn.name}(${fn.params.join(', ')}) {\n${fn.body.map((s: any) => '  ' + astToSource(s)).join('\n')}\n}`;

        case 'ReturnStatement':
            const ret = node as any;
            return `return ${ret.argument ? astToSource(ret.argument) : ''};`;

        case 'IfStatement':
            const ifStmt = node as any;
            let res = `if (${astToSource(ifStmt.test)}) {\n${ifStmt.consequent.map((s: any) => '  ' + astToSource(s)).join('\n')}\n}`;
            if (ifStmt.alternate) {
                res += ` else {\n${ifStmt.alternate.map((s: any) => '  ' + astToSource(s)).join('\n')}\n}`;
            }
            return res;

        case 'WhileStatement':
            const whileStmt = node as any;
            return `while (${astToSource(whileStmt.test)}) {\n${whileStmt.body.map((s: any) => '  ' + astToSource(s)).join('\n')}\n}`;

        case 'VariableDeclaration':
            const varDecl = node as any;
            return `var ${varDecl.name} = ${varDecl.init ? astToSource(varDecl.init) : 'null'};`;

        case 'ExpressionStatement':
            return `${astToSource((node as any).expression)};`;

        case 'BinaryExpression':
            const bin = node as any;
            return `${astToSource(bin.left)} ${bin.operator} ${astToSource(bin.right)}`;

        case 'CallExpression':
            const call = node as any;
            return `${call.callee.name}(${call.arguments.map((a: any) => astToSource(a)).join(', ')})`;

        case 'UIPrimitive':
            const ui = node as any;
            // Reconstruct UI call
            const args = (ui.props as any).args || [];
            let uiStr = `${ui.elementType}(${args.map((a: any) => astToSource(a)).join(', ')})`;
            if (ui.children && ui.children.length > 0) {
                uiStr += ` {\n${ui.children.map((c: any) => '  ' + astToSource(c)).join('\n')}\n}`;
            }
            return uiStr;

        case 'Literal':
            const lit = node as any;
            return typeof lit.value === 'string' ? `"${lit.value}"` : String(lit.value);

        case 'Identifier':
            return (node as any).name;

        case 'GenerateStatement':
            const gen = node as any;
            return `generate function ${gen.name}(${gen.params.join(', ')}): description "${gen.description}"`;

        case 'AIOptimizeStatement':
            const opt = node as any;
            return `ai.optimize: {\n${opt.body.map((s: any) => '  ' + astToSource(s)).join('\n')}\n}`;

        default:
            return '';
    }
}
