---
description: Guide for creating high-quality MCP (Model Context Protocol) servers to integrate external APIs and services with LLMs.
license: Based on Anthropic's mcp-builder skill
---

# MCP Server Development Guide

## Overview
Create MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools. The quality of an MCP server is measured by how well it enables LLMs to accomplish real-world tasks.

---

## 🚀 High-Level Workflow

### Phase 1: Deep Research and Planning

#### 1.1 Understand Modern MCP Design

**API Coverage vs. Workflow Tools:**
Balance comprehensive API endpoint coverage with specialized workflow tools. Prioritize comprehensive API coverage when uncertain.

**Tool Naming and Discoverability:**
Use consistent prefixes and action-oriented naming:
- `github_create_issue`
- `github_list_repos`
- `slack_send_message`

**Context Management:**
Design tools that return focused, relevant data with pagination support.

**Actionable Error Messages:**
Error messages should guide agents toward solutions with specific suggestions.

#### 1.2 Study MCP Protocol Documentation

Start with the sitemap: `https://modelcontextprotocol.io/sitemap.xml`

Key pages to review:
- Specification overview and architecture
- Transport mechanisms (streamable HTTP, stdio)
- Tool, resource, and prompt definitions

#### 1.3 Plan Your Implementation

1. Review the service's API documentation
2. Identify key endpoints and authentication requirements
3. List endpoints to implement, starting with common operations

---

### Phase 2: Implementation

#### 2.1 Project Structure

**TypeScript:**
```
src/
├── index.ts         # Entry point
├── server.ts        # MCP server setup
├── tools/           # Tool implementations
├── api/             # API client
├── types/           # TypeScript types
└── utils/           # Helpers
```

**Python:**
```
src/
├── __init__.py
├── server.py        # MCP server setup
├── tools/           # Tool implementations
├── api/             # API client
└── utils/           # Helpers
```

#### 2.2 TypeScript Implementation

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

const server = new McpServer({
  name: 'my-service',
  version: '1.0.0'
});

// Define tool with Zod schema
server.registerTool({
  name: 'get_items',
  description: 'Retrieve items from the service with optional filtering',
  inputSchema: z.object({
    query: z.string().optional().describe('Search query'),
    limit: z.number().min(1).max(100).default(10).describe('Max results'),
    offset: z.number().min(0).default(0).describe('Pagination offset')
  }),
  outputSchema: z.object({
    items: z.array(z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional()
    })),
    total: z.number(),
    hasMore: z.boolean()
  }),
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false
  },
  async handler({ query, limit, offset }) {
    const result = await apiClient.getItems({ query, limit, offset });
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }],
      structuredContent: result
    };
  }
});

// Start server
server.start();
```

#### 2.3 Python Implementation (FastMCP)

```python
from mcp.server import Server
from pydantic import BaseModel, Field
from typing import Optional, List

server = Server("my-service")

class GetItemsInput(BaseModel):
    query: Optional[str] = Field(None, description="Search query")
    limit: int = Field(10, ge=1, le=100, description="Max results")
    offset: int = Field(0, ge=0, description="Pagination offset")

class Item(BaseModel):
    id: str
    name: str
    description: Optional[str] = None

class GetItemsOutput(BaseModel):
    items: List[Item]
    total: int
    has_more: bool

@server.tool(
    description="Retrieve items from the service with optional filtering",
    annotations={
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True
    }
)
async def get_items(input: GetItemsInput) -> GetItemsOutput:
    result = await api_client.get_items(
        query=input.query,
        limit=input.limit,
        offset=input.offset
    )
    return GetItemsOutput(
        items=result["items"],
        total=result["total"],
        has_more=result["total"] > input.offset + input.limit
    )

if __name__ == "__main__":
    server.run()
```

---

### Phase 3: Review and Test

#### 3.1 Code Quality Checklist
- [ ] No duplicated code (DRY principle)
- [ ] Consistent error handling
- [ ] Full type coverage
- [ ] Clear tool descriptions
- [ ] Pagination for list endpoints
- [ ] Proper input validation

#### 3.2 Build and Test

**TypeScript:**
```bash
npm run build
npx @modelcontextprotocol/inspector
```

**Python:**
```bash
python -m py_compile server.py
# Test with MCP Inspector
```

---

### Phase 4: Create Evaluations

Create 10 evaluation questions to test effectiveness:

```xml
<evaluation>
  <qa_pair>
    <question>Find all repositories with more than 100 stars</question>
    <answer>repo-name-1, repo-name-2</answer>
  </qa_pair>
</evaluation>
```

**Evaluation Requirements:**
- Independent: Not dependent on other questions
- Read-only: Only non-destructive operations
- Complex: Requiring multiple tool calls
- Realistic: Based on real use cases
- Verifiable: Single, clear answer
- Stable: Answer won't change over time

---

## Tool Annotations

```typescript
annotations: {
  readOnlyHint: true,      // Does not modify state
  destructiveHint: false,  // Does not delete data
  idempotentHint: true,    // Same result on repeated calls
  openWorldHint: false     // Closed set of possible results
}
```

---

## Best Practices

### Tool Design
- Use clear, descriptive names with consistent prefixes
- Provide detailed descriptions with examples
- Include input validation with helpful error messages
- Support pagination for list operations
- Return both text content and structured data

### Error Handling
- Return actionable error messages
- Include suggestions for fixing issues
- Log errors with context for debugging

### Performance
- Use async/await for I/O operations
- Implement caching where appropriate
- Batch related API calls when possible

---

## Reference Resources

- **MCP Protocol**: https://modelcontextprotocol.io
- **TypeScript SDK**: https://github.com/modelcontextprotocol/typescript-sdk
- **Python SDK**: https://github.com/modelcontextprotocol/python-sdk
- **MCP Inspector**: `npx @modelcontextprotocol/inspector`
