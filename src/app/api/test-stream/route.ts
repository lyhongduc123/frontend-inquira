import { NextRequest } from "next/server";

/**
 * Test endpoint for frontend to verify SSE streaming with comprehensive markdown examples.
 * 
 * Returns a complete showcase of markdown formatting including:
 * - Headers (H1-H6)
 * - Bold, italic, strikethrough
 * - Lists (ordered, unordered, nested)
 * - Code blocks with syntax highlighting
 * - Inline code
 * - Blockquotes
 * - Links and images
 * - Tables
 * - Math equations (KaTeX)
 * - Citations with paper metadata
 */
export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Helper to send SSE events
      const sendEvent = (name: string, data: unknown) => {
        const jsonData = typeof data === "string" ? data : JSON.stringify(data);
        const message = `event: ${name}\ndata: ${jsonData}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

      try {
        // Event 1: Conversation ID
        sendEvent("conversation", { conversation_id: "test-12345" });
        await sleep(100);

        // Event 2: Mock paper sources
        const mockPapers = [
          {
            paper_id: "test-paper-1",
            title: "Attention Is All You Need",
            authors: [{ name: "Vaswani et al." }],
            publication_date: "2017-06-12",
            venue: "NeurIPS",
            url: "https://arxiv.org/abs/1706.03762",
            citation_count: 50000,
            abstract:
              "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks.",
          },
          {
            paper_id: "test-paper-2",
            title: "BERT: Pre-training of Deep Bidirectional Transformers",
            authors: [{ name: "Devlin et al." }],
            publication_date: "2018-10-11",
            venue: "NAACL",
            url: "https://arxiv.org/abs/1810.04805",
            citation_count: 40000,
            abstract: "We introduce a new language representation model called BERT.",
          },
        ];
        sendEvent("sources", mockPapers);
        await sleep(100);

        // Event 3: Thought process
        sendEvent("thought", "Analyzing research papers and generating comprehensive markdown response...");
        await sleep(100);

        // Event 4: Stream markdown content in chunks
        const markdownContent = `# Comprehensive Markdown Test

This is a **complete showcase** of markdown formatting capabilities for the frontend.

## Headers

### H3 Header
#### H4 Header
##### H5 Header
###### H6 Header

## Text Formatting

This text includes **bold text**, *italic text*, ***bold and italic***, ~~strikethrough~~, and \`inline code\`.

## Lists

### Unordered List
- First item
- Second item
  - Nested item 1
  - Nested item 2
    - Deep nested item
- Third item

### Ordered List
1. First step
2. Second step
   1. Sub-step A
   2. Sub-step B
3. Third step

## Code Blocks

Here's a Python code example:

\`\`\`python
def hello_world():
    """A simple function demonstrating code syntax highlighting"""
    print("Hello, World!")
    return True

# Using list comprehension
squares = [x**2 for x in range(10)]
\`\`\`

JavaScript example:

\`\`\`javascript
const fetchData = async (url) => {
  const response = await fetch(url);
  return response.json();
};
\`\`\`

## Blockquotes

> This is a blockquote.
> 
> It can span multiple lines and is often used for citations or important notes.
> 
> > Nested blockquotes are also supported.

## Links and Citations

You can read more about [Transformers on Wikipedia](https://en.wikipedia.org/wiki/Transformer_(machine_learning_model)).

According to recent research [1](test-paper-1), attention mechanisms have revolutionized NLP.

## Tables

| Model | Parameters | Year | Performance |
|-------|-----------|------|-------------|
| GPT-2 | 1.5B | 2019 | Good |
| GPT-3 | 175B | 2020 | Excellent |
| GPT-4 | Unknown | 2023 | Outstanding |

## Math Equations

Inline math: The equation $E = mc^2$ is Einstein's famous formula.

Block equation:

$$
\\frac{\\partial L}{\\partial w} = \\frac{1}{n} \\sum_{i=1}^{n} (h_w(x_i) - y_i) \\cdot x_i
$$

Transformer attention mechanism:

$$
\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V
$$

## Task Lists

- [x] Implement streaming endpoint
- [x] Add markdown examples
- [ ] Test on frontend
- [ ] Add more edge cases

## Horizontal Rule

---

## Special Characters

Escaping special characters: \\* \\_ \\\` \\[ \\]

## Citations and References

The transformer architecture [1](test-paper-1) introduced multi-head attention, which was later refined in BERT [2](test-paper-2). Both papers demonstrate significant improvements over previous state-of-the-art models.

### References

[1] Vaswani et al. (2017). "Attention Is All You Need." *NeurIPS*.  
[2] Devlin et al. (2018). "BERT: Pre-training of Deep Bidirectional Transformers." *NAACL*.

---

**Note**: This test covers most common markdown elements. Your frontend should handle all of these gracefully!
`;

        // Split into chunks and stream with realistic delays
        const chunkSize = 50; // characters per chunk
        for (let i = 0; i < markdownContent.length; i += chunkSize) {
          const chunk = markdownContent.slice(i, i + chunkSize);
          sendEvent("chunk", chunk);
          await sleep(50); // Simulate realistic streaming delay
        }

        // Event 5: Done
        sendEvent("done", "");

        controller.close();
      } catch (error) {
        console.error("[ERROR] Test stream error:", error);
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
