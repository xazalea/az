import type { ASTNode, Program } from './types';

export function astToSource(node: ASTNode, indent: number = 0): string {
    if (!node) return '';
    const spaces = '    '.repeat(indent);

    switch (node.type) {
        case 'Program':
            return (node as Program).body.map(s => astToSource(s, indent)).join('\n');

        case 'FunctionDeclaration':
            const fn = node as any;
            return `${spaces}fn ${fn.name}(${fn.params.join(', ')}):\n${fn.body.map((s: any) => astToSource(s, indent + 1)).join('\n')}`;

        case 'ReturnStatement':
            const ret = node as any;
            return `${spaces}return ${ret.argument ? astToSource(ret.argument, 0) : ''}`;

        case 'IfStatement':
            const ifStmt = node as any;
            let res = `${spaces}if ${astToSource(ifStmt.test, 0)}:\n${ifStmt.consequent.map((s: any) => astToSource(s, indent + 1)).join('\n')}`;
            if (ifStmt.alternate) {
                res += `\n${spaces}else:\n${ifStmt.alternate.map((s: any) => astToSource(s, indent + 1)).join('\n')}`;
            }
            return res;

        case 'WhileStatement':
            const whileStmt = node as any;
            return `${spaces}while ${astToSource(whileStmt.test, 0)}:\n${whileStmt.body.map((s: any) => astToSource(s, indent + 1)).join('\n')}`;

        case 'VariableDeclaration':
            const varDecl = node as any;
            return `${spaces}var ${varDecl.name} = ${varDecl.init ? astToSource(varDecl.init, 0) : 'null'}`;

        case 'ExpressionStatement':
            return `${spaces}${astToSource((node as any).expression, 0)}`;

        case 'BinaryExpression':
            const bin = node as any;
            return `${astToSource(bin.left, 0)} ${bin.operator} ${astToSource(bin.right, 0)}`;

        case 'CallExpression':
            const call = node as any;
            return `${call.callee.name}(${call.arguments.map((a: any) => astToSource(a, 0)).join(', ')})`;

        case 'UIPrimitive':
            const ui = node as any;
            const args = (ui.props as any).args || [];
            let uiStr = `${ui.elementType}(${args.map((a: any) => astToSource(a, 0)).join(', ')})`;
            if (ui.children && ui.children.length > 0) {
                uiStr += `:\n${ui.children.map((c: any) => {
                    return spaces + '    ' + astToSource(c, 0);
                }).join('\n')}`;
            }
            return uiStr;

        case 'Literal':
            const lit = node as any;
            return typeof lit.value === 'string' ? `"${lit.value}"` : String(lit.value);

        case 'Identifier':
            return (node as any).name;

        case 'GenerateStatement':
            const gen = node as any;
            return `${spaces}generate function ${gen.name}(${gen.params.join(', ')}): description "${gen.description}"`;

        case 'AIOptimizeStatement':
            const opt = node as any;
            return `${spaces}ai.optimize:\n${opt.body.map((s: any) => astToSource(s, indent + 1)).join('\n')}`;

        case 'AIStatement':
            const ai = node as any;
            let aiStr = `${spaces}ai`;
            if (ai.instruction) aiStr += ` "${ai.instruction}"`;
            if (ai.body) {
                aiStr += `:\n${ai.body.map((s: any) => astToSource(s, indent + 1)).join('\n')}`;
            }
            return aiStr;

        default:
            return '';
    }
}
