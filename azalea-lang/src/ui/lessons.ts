export interface Lesson {
    id: string;
    title: string;
    content: string;
    initialCode: string;
    expectedOutput?: string;
}

export const LESSONS: Lesson[] = [
    {
        id: '1-basics',
        title: '1. Hello Azalea',
        content: 'Welcome to Azalea! Let\'s start by printing some text to the screen. Use the `text` function.',
        initialCode: 'fn main() {\n  text("Hello World");\n}',
        expectedOutput: 'Hello World'
    },
    {
        id: '2-variables',
        title: '2. Variables',
        content: 'Variables store data. Use `var` to declare them.',
        initialCode: 'fn main() {\n  var name = "Azalea";\n  text(name);\n}',
    },
    {
        id: '3-ui',
        title: '3. UI Primitives',
        content: 'Azalea has built-in UI elements. Try `box` and `button`.',
        initialCode: 'fn main() {\n  box();\n  text("Inside a box");\n  button("Click Me");\n}',
    },
    {
        id: '4-ai',
        title: '4. AI Enhancement',
        content: 'Add `# azalea: ai-enhanced` at the top to let AI improve your code!',
        initialCode: '# azalea: ai-enhanced\nfn main() {\n  // Write messy code here, AI will fix it\n  var x=1;var y=2;text(x+y);\n}',
    }
];
