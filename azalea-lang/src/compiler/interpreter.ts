import { Program, Statement, Expression, BinaryExpression, Literal, Identifier, CallExpression, VariableDeclaration, FunctionDeclaration, IfStatement, WhileStatement, ReturnStatement, ExpressionStatement, UIPrimitive } from './types';
import { AIEnchancer } from '../ai';

export class Interpreter {
  private globals: Record<string, any> = {};
  private functions: Record<string, FunctionDeclaration> = {};
  private output: string[] = [];
  private container: HTMLElement | null = null;
  private ai: AIEnchancer;

  constructor(containerId?: string) {
    this.ai = new AIEnchancer();
    if (containerId) {
      this.container = document.getElementById(containerId);
    }
    // Define built-in functions
    this.globals['print'] = (arg: any) => {
      this.output.push(String(arg));
      console.log('Interpreter:', arg);
    };
    this.globals['box'] = () => {
      if (this.container) {
        const div = document.createElement('div');
        div.className = 'az-box p-4 border rounded bg-white shadow mb-2';
        this.container.appendChild(div);
      }
    };
    this.globals['text'] = (content: string) => {
      if (this.container) {
        const span = document.createElement('div');
        span.textContent = content;
        this.container.appendChild(span);
      }
    };
  }

  public getOutput(): string[] {
    return this.output;
  }

  public clearOutput() {
    this.output = [];
    if (this.container) this.container.innerHTML = '';
  }

  public async evaluate(program: Program) {
    this.clearOutput();

    // 1. Register functions
    for (const stmt of program.body) {
      if (stmt.type === 'FunctionDeclaration') {
        const func = stmt as FunctionDeclaration;
        this.functions[func.name] = func;
      }
    }

    // 2. Run main if exists, or run top-level statements (Scripting mode)
    if (this.functions['main']) {
      return this.callFunction('main', []);
    } else {
      // Scripting mode: execute top-level statements
      for (const stmt of program.body) {
        if (stmt.type !== 'FunctionDeclaration') {
          await this.executeStatement(stmt, this.globals);
        }
      }
    }
  }

  private async callFunction(name: string, args: any[]): Promise<any> {
    const func = this.functions[name];
    if (!func) {
      // Check built-ins/globals
      if (typeof this.globals[name] === 'function') {
        return this.globals[name](...args);
      }
      throw new Error(`Function ${name} not found`);
    }

    const scope = { ...this.globals };
    func.params.forEach((param, index) => {
      scope[param] = args[index];
    });

    try {
      for (const stmt of func.body) {
        await this.executeStatement(stmt, scope);
      }
    } catch (e: any) {
      if (e.type === 'RETURN') return e.value;
      throw e;
    }
  }

  private async executeStatement(stmt: Statement, scope: Record<string, any>) {
    switch (stmt.type) {
      case 'VariableDeclaration':
        const varDecl = stmt as VariableDeclaration;
        scope[varDecl.name] = varDecl.init ? await this.evaluateExpression(varDecl.init, scope) : null;
        break;
      case 'ExpressionStatement':
        await this.evaluateExpression((stmt as ExpressionStatement).expression, scope);
        break;
      case 'ReturnStatement':
        const retStmt = stmt as ReturnStatement;
        const value = retStmt.argument ? await this.evaluateExpression(retStmt.argument, scope) : null;
        throw { type: 'RETURN', value };
      case 'IfStatement':
        const ifStmt = stmt as IfStatement;
        if (await this.evaluateExpression(ifStmt.test, scope)) {
          await this.executeBlock(ifStmt.consequent, scope);
        } else if (ifStmt.alternate) {
          await this.executeBlock(ifStmt.alternate, scope);
        }
        break;
      case 'WhileStatement':
        const whileStmt = stmt as WhileStatement;
        while (await this.evaluateExpression(whileStmt.test, scope)) {
          await this.executeBlock(whileStmt.body, scope);
        }
        break;
      case 'GenerateStatement':
        const genStmt = stmt as any;
        this.globals['print'](`[AI] Generating function '${genStmt.name}'...`);

        const generatedCode = await this.ai.generateFunction(genStmt.name, genStmt.params, genStmt.description);
        this.globals['print'](`[AI] Generated:\n${generatedCode}`);

        const { Parser } = await import('./parser');
        const { Lexer } = await import('./lexer');

        const lexer = new Lexer(generatedCode);
        const parser = new Parser(lexer.tokenize());
        const program = parser.parse();

        for (const s of program.body) {
          if (s.type === 'FunctionDeclaration') {
            const func = s as FunctionDeclaration;
            this.functions[func.name] = func;
            this.globals['print'](`[AI] Function '${func.name}' registered.`);
          }
        }
        break;

      case 'AIOptimizeStatement':
        const optStmt = stmt as any;
        this.globals['print'](`[AI] Optimizing block...`);

        const { astToSource } = await import('./ast_utils');
        const originalSource = optStmt.body.map((s: any) => astToSource(s)).join('\n');

        const optimizedCode = await this.ai.optimizeBlock(originalSource);
        this.globals['print'](`[AI] Optimized Code:\n${optimizedCode}`);

        const { Lexer: LexerOpt } = await import('./lexer');
        const { Parser: ParserOpt } = await import('./parser');

        const lexerOpt = new LexerOpt(optimizedCode);
        const parserOpt = new ParserOpt(lexerOpt.tokenize());
        const programOpt = parserOpt.parse();

        for (const s of programOpt.body) {
          await this.executeStatement(s, scope);
        }
        break;
    }
  }

  private async executeBlock(stmts: Statement[], parentScope: Record<string, any>) {
    for (const stmt of stmts) {
      await this.executeStatement(stmt, parentScope);
    }
  }

  private async evaluateExpression(expr: Expression, scope: Record<string, any>): Promise<any> {
    switch (expr.type) {
      case 'Literal':
        return (expr as Literal).value;
      case 'Identifier':
        const id = expr as Identifier;
        if (id.name in scope) return scope[id.name];
        throw new Error(`Variable ${id.name} not defined`);
      case 'BinaryExpression':
        const bin = expr as BinaryExpression;
        const left = await this.evaluateExpression(bin.left, scope);
        const right = await this.evaluateExpression(bin.right, scope);
        switch (bin.operator) {
          case '+': return left + right;
          case '-': return left - right;
          case '*': return left * right;
          case '/': return left / right;
          case '<': return left < right;
          case '>': return left > right;
          case '==': return left === right;
          case '!=': return left !== right;
        }
        break;
      case 'CallExpression':
        const call = expr as CallExpression;
        const args = await Promise.all(call.arguments.map(arg => this.evaluateExpression(arg, scope)));
        return this.callFunction(call.callee.name, args);
      case 'UIPrimitive':
        const ui = expr as UIPrimitive;
        if (ui.elementType === 'box') return this.globals['box']();
        if (ui.elementType === 'text') {
          const args = (ui.props as any).args as Expression[];
          if (args && args.length > 0) {
            const content = await this.evaluateExpression(args[0], scope);
            this.globals['text'](content);
          }
        }
        if (ui.elementType === 'button') {
          const args = (ui.props as any).args as Expression[];
          const label = args && args.length > 0 ? await this.evaluateExpression(args[0], scope) : "Button";
          if (this.container) {
            const btn = document.createElement('button');
            btn.textContent = label;
            btn.className = 'az-btn px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 m-1';
            this.container.appendChild(btn);
          }
        }
        break;
    }
  }
}
