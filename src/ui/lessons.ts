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
        title: '1. Hello AI World',
        content: 'Welcome to Azalea, the AI-Native language. Azalea uses indentation (like Python) and allows you to speak to the AI directly in your code. Try running this code to see basic output.',
        initialCode: `fn main():
    box():
        text("Hello Azalea!")
        button("Click Me")
`,
        expectedOutput: 'Hello Azalea!'
    },
    {
        id: '2-ai-commands',
        title: '2. Natural Language Coding',
        content: 'In Azalea, you don\'t always need perfect syntax. You can use the `ai` keyword to give instructions in plain English. The compiler uses AI to interpret your intent.',
        initialCode: `fn main():
    text("Standard Code")
    
    # Just ask for what you want!
    ai "Create a red box with a greeting inside"
    
    # Or use ambiguous syntax that AI figures out
    make a button that says "Magic"
`,
    },
    {
        id: '3-ai-memory',
        title: '3. AI Memory & Context',
        content: 'The AI has memory! Use `ai_remember` to teach it facts, and `ai_ask` to query that knowledge later. This allows your program to have a persistent "brain".',
        initialCode: `fn main():
    ai_remember("The user's name is Alice")
    ai_remember("Alice likes blue buttons")
    
    var user_name = ai_ask("What is the user's name?")
    text("Hello, " + user_name)
    
    ai "Create a button for Alice based on her preference"
`,
    },
    {
        id: '4-meta-ai',
        title: '4. Meta-AI (Self-Writing Code)',
        content: 'Azalea can write its own functions at runtime! Use `generate function` to create new capabilities on the fly.',
        initialCode: `fn main():
    text("Generating code...")
    
    # This function doesn't exist yet, AI will create it!
    generate function calculate_fibonacci(n): description "Return the nth fibonacci number recursively"
    
    var result = calculate_fibonacci(10)
    text("Fibonacci(10) = " + result)
`,
    },
    {
        id: '5-error-handling',
        title: '5. AI Self-Healing',
        content: 'If your code crashes, the AI Debugger kicks in automatically to explain the error and suggest a fix. Try running this broken code!',
        initialCode: `fn main():
    var x = 10
    # 'y' is not defined, this will crash!
    if x > y:
        text("This won't work")
`,
    },
    {
        id: '6-ai-operators',
        title: '6. AI Operators & Logic',
        content: 'You can use `ai` blocks as logical operators to perform complex tasks like data extraction or summarization effortlessly.',
        initialCode: `fn main():
    var raw_data = "John lives in London and works at Microsoft."
    
    # AI Operator extracting structured data
    ai "Extract the city and company from raw_data and show them in text"
`,
    }
];
