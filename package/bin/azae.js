#!/usr/bin/env node
const { Parser } = require('../dist/parser');
const { Lexer } = require('../dist/lexer');
const { Interpreter } = require('../dist/interpreter');
const fs = require('fs');

const args = process.argv.slice(2);

if (args.length === 0) {
    console.log("Usage: azae <file.az>");
    process.exit(1);
}

const filename = args[0];
const code = fs.readFileSync(filename, 'utf8');

const lexer = new Lexer(code);
const parser = new Parser(lexer.tokenize());
const program = parser.parse();

const interpreter = new Interpreter();
interpreter.evaluate(program).catch(e => console.error(e));

