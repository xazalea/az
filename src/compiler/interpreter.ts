import type { Program, Statement, Expression, BinaryExpression, Literal, Identifier, CallExpression, VariableDeclaration, FunctionDeclaration, IfStatement, WhileStatement, ReturnStatement, ExpressionStatement, UIPrimitive, AIStatement, ImportStatement, MacroDefinition, AgentDefinition, RAGStatement, InspectStatement } from './types';
import { AIEnchancer } from '../ai';

export class Interpreter {
  private globals: Record<string, any> = {};
  private functions: Record<string, FunctionDeclaration> = {};
  private macros: Record<string, MacroDefinition> = {};
  private agents: Record<string, AgentDefinition> = {};
  private output: string[] = [];
  private container: HTMLElement | null = null;
  private ai: AIEnchancer;
  // AI Memory in the Language (Task 12)
  private aiContext: string[] = []; 

  constructor(containerId?: string) {
    this.ai = new AIEnchancer();
    if (containerId) {
      this.container = document.getElementById(containerId);
    }
    // Define built-in functions (AI as Standard Library Calls - Task 9)
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
    
    // Standard Library AI Calls
    this.globals['ai_ask'] = async (question: string) => {
       // AI Standard Library Call
       this.output.push(`[AI Asking]: ${question}`);
       const answer = await this.ai.process(question, ""); 
       return answer;
    };

    this.globals['ai_remember'] = (fact: string) => {
        this.aiContext.push(fact);
        this.output.push(`[AI Memory]: Remembered "${fact}"`);
    };
  }

  public getOutput(): string[] {
    return this.output;
  }

  public clearOutput() {
    this.output = [];
    if (this.container) this.container.innerHTML = '';
    this.aiContext = []; // Reset memory on run? Or persist? Usually reset for script.
  }

  public async evaluate(program: Program) {
    this.clearOutput();

    // 1. Register functions and macros
    for (const stmt of program.body) {
      if (stmt.type === 'FunctionDeclaration') {
        const func = stmt as FunctionDeclaration;
        this.functions[func.name] = func;
      } else if (stmt.type === 'MacroDefinition') {
        const macro = stmt as MacroDefinition;
        this.macros[macro.name] = macro;
      } else if (stmt.type === 'AgentDefinition') {
        const agent = stmt as AgentDefinition;
        this.agents[agent.name] = agent;
        // Auto-start agent? Or wait for call? Let's auto-start for the prototype "agent loop" feel
        // Actually, usually agents are invoked. Let's wait for explicit invoke or just run primitives.
        // But user might expect `agent X: ...` to run.
        // Let's execute it immediately for now as a demo of "autonomous loop"
        await this.runAgent(agent);
      }
    }

    // 2. Run main if exists, or run top-level statements (Scripting mode)
    try {
        if (this.functions['main']) {
          return this.callFunction('main', []);
        } else {
          // Scripting mode: execute top-level statements
          for (const stmt of program.body) {
            if (stmt.type !== 'FunctionDeclaration' && stmt.type !== 'MacroDefinition' && stmt.type !== 'AgentDefinition') {
              await this.executeStatement(stmt, this.globals);
            }
          }
        }
    } catch (e: any) {
        // AI-Based Error Handling (Task 11)
        const errorMsg = e.message || String(e);
        this.output.push(`Runtime Error: ${errorMsg}`);
        this.output.push(`[AI Debugger] Analyzing error...`);
        
        // Ask AI to explain/fix
        const fix = await this.ai.process(`Fix this error: ${errorMsg}`, "");
        this.output.push(`[AI Suggestion]:\n${fix}`);
    }
  }

  private async runAgent(agent: AgentDefinition) {
      this.globals['print'](`[Agent ${agent.name}] Starting autonomous loop...`);
      // Simple loop simulation
      const steps = 3; 
      const history: string[] = [];
      for (let i = 0; i < steps; i++) {
          const thought = await this.ai.runAgentStep(agent.name, history);
          this.globals['print'](`[Agent ${agent.name}]: ${thought}`);
          history.push(thought);
          
          // Execute body statements as "actions" context
          for (const stmt of agent.body) {
              // We might evaluate them to define the agent's capabilities
              // For now, just treat body as setup or one-off actions
              await this.executeStatement(stmt, this.globals);
          }
      }
  }

  private async callFunction(name: string, args: any[]): Promise<any> {
    const func = this.functions[name];
    if (!func) {
      const macro = this.macros[name];
      if (macro) {
          // Execute macro body with arguments
          // Macros in this interpreter are treated as inline functions for now.
          // A real macro system would expand AST, but here we execute the body.
          const scope = { ...this.globals };
          macro.params.forEach((param, index) => {
              scope[param] = args[index];
          });
          try {
              for (const stmt of macro.body) {
                  await this.executeStatement(stmt, scope);
              }
              return; // Macros don't return values in this simple impl, but they could
          } catch (e: any) {
               if (e.type === 'RETURN') return e.value;
               throw e;
          }
      }

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

        // Meta-AI: Runtime Feature Generation
        // @ts-ignore: Dynamic import inside method
        const { Parser } = await import('./parser');
        // @ts-ignore: Dynamic import inside method
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

        // @ts-ignore: Dynamic import inside method
        const { astToSource } = await import('./ast_utils');
        const originalSource = optStmt.body.map((s: any) => astToSource(s)).join('\n');

        const optimizedCode = await this.ai.optimizeBlock(originalSource);
        this.globals['print'](`[AI] Optimized Code:\n${optimizedCode}`);

        // @ts-ignore: Dynamic import inside method
        const { Lexer: LexerOpt } = await import('./lexer');
        // @ts-ignore: Dynamic import inside method
        const { Parser: ParserOpt } = await import('./parser');

        const lexerOpt = new LexerOpt(optimizedCode);
        const parserOpt = new ParserOpt(lexerOpt.tokenize());
        const programOpt = parserOpt.parse();

        for (const s of programOpt.body) {
          await this.executeStatement(s, scope);
        }
        break;

      case 'AIStatement':
        const aiStmt = stmt as AIStatement;
        const instruction = aiStmt.instruction || "Improve this code";
        this.globals['print'](`[AI] Instruction: "${instruction}"`);

        let contextCode = "";
        if (aiStmt.body) {
            // @ts-ignore: Dynamic import inside method
            const { astToSource } = await import('./ast_utils');
            contextCode = aiStmt.body.map((s: any) => astToSource(s)).join('\n');
        }
        
        // Inject AI Memory Context
        const memoryContext = this.aiContext.length > 0 ? `\n[Memory]: ${this.aiContext.join('; ')}` : "";
        
        const result = await this.ai.process(instruction + memoryContext, contextCode);
        this.globals['print'](`[AI] Result:\n${result}`);

        if (result && result.trim().length > 0) {
             // Meta-AI: Interpreting result as code to execute
             // @ts-ignore: Dynamic import inside method
             const { Lexer } = await import('./lexer');
             // @ts-ignore: Dynamic import inside method
             const { Parser } = await import('./parser');
             const lexer = new Lexer(result);
             const parser = new Parser(lexer.tokenize());
             const program = parser.parse();

             for (const s of program.body) {
                 await this.executeStatement(s, scope);
             }
        }
        break;

      // New AI Native Statements
      case 'ImportStatement':
          const impStmt = stmt as ImportStatement;
          if (impStmt.isAI) {
              this.globals['print'](`[AI] Auto-Generating Module '${impStmt.moduleName}'...`);
              const modCode = await this.ai.generateModule(impStmt.moduleName);
              this.globals['print'](`[AI] Module Generated. Loading...`);
              
              // Load generated module
              // @ts-ignore
              const { Lexer } = await import('./lexer');
              // @ts-ignore
              const { Parser } = await import('./parser');
              const l = new Lexer(modCode);
              const p = new Parser(l.tokenize());
              const prog = p.parse();
              // Evaluate imports into global scope (namespace merging)
              await this.evaluate(prog);
          }
          break;

      case 'RAGStatement':
          const ragStmt = stmt as RAGStatement;
          this.globals['print'](`[RAG] Searching for: "${ragStmt.query}"...`);
          const answer = await this.ai.ragSearch(ragStmt.query, this.aiContext);
          this.globals['print'](`[RAG] Answer: ${answer}`);
          break;

      case 'InspectStatement':
          const inspectStmt = stmt as InspectStatement;
          const targetVal = await this.evaluateExpression(inspectStmt.target, scope);
          this.globals['print'](`[Data Inspector] Analyzing...`);
          const analysis = await this.ai.inspectVariable(targetVal);
          this.globals['print'](`[Data Inspector]: ${analysis}`);
          break;
          
      case 'MacroDefinition':
      case 'AgentDefinition':
          // Handled in first pass (evaluate function registration), but if they appear in blocks:
          // TODO: Block-scoped definitions
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
