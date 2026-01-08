---
description: Develop backend APIs, services, and MCP servers using Node.js/TypeScript or Python. Includes database integration, authentication, and testing patterns.
---

# Backend Development Skill

## Overview
Build robust, scalable backend services and APIs. This skill covers server development, database integration, authentication, MCP server creation, and testing strategies.

## Technology Stack
- **Runtime**: Node.js (TypeScript) or Python
- **Framework**: Express, Fastify, NestJS (Node) or FastAPI, Flask (Python)
- **Database**: PostgreSQL, MongoDB, SQLite
- **ORM**: Prisma, Drizzle (Node) or SQLAlchemy (Python)
- **Auth**: JWT, OAuth 2.0, Session-based
- **Testing**: Jest, Vitest (Node) or pytest (Python)

---

## Development Workflow

### Phase 1: Project Setup

**Node.js/TypeScript:**
```bash
npm init -y
npm install express typescript @types/node @types/express
npm install -D tsx nodemon
npx tsc --init
```

**Python:**
```bash
python -m venv venv
pip install fastapi uvicorn pydantic
pip install -D pytest pytest-asyncio
```

### Phase 2: Project Structure

**Node.js/TypeScript:**
```
src/
├── index.ts          # Entry point
├── routes/           # API route handlers
├── controllers/      # Business logic
├── services/         # External service integrations
├── middleware/       # Auth, validation, error handling
├── models/           # Data models/types
├── utils/            # Helper functions
└── config/           # Configuration
```

**Python:**
```
app/
├── main.py           # Entry point
├── routers/          # API route handlers
├── services/         # Business logic
├── models/           # Pydantic models
├── middleware/       # Auth, validation
├── utils/            # Helper functions
└── config.py         # Configuration
```

### Phase 3: API Development

**RESTful API Design:**
```typescript
// Express route handler
import { Router } from 'express';

const router = Router();

router.get('/items', async (req, res) => {
  const items = await itemService.findAll();
  res.json({ data: items });
});

router.post('/items', validateItem, async (req, res) => {
  const item = await itemService.create(req.body);
  res.status(201).json({ data: item });
});

export default router;
```

**Error Handling:**
```typescript
// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    error: err.message,
    code: err.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
```

---

## MCP Server Development

### Overview
Create MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools.

### High-Level Workflow

#### Phase 1: Research and Planning
1. **Understand the API**: Review service documentation, identify key endpoints
2. **Tool Selection**: Prioritize comprehensive API coverage
3. **Naming Convention**: Use consistent prefixes (e.g., `github_create_issue`)

#### Phase 2: Implementation

**TypeScript MCP Server:**
```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

const server = new McpServer({
  name: 'my-mcp-server',
  version: '1.0.0'
});

server.registerTool({
  name: 'get_data',
  description: 'Retrieve data from the service',
  inputSchema: z.object({
    id: z.string().describe('The item ID to retrieve'),
    includeDetails: z.boolean().optional().describe('Include full details')
  }),
  outputSchema: z.object({
    id: z.string(),
    name: z.string(),
    data: z.any()
  }),
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true
  },
  async handler({ id, includeDetails }) {
    const result = await apiClient.getData(id, { includeDetails });
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  }
});
```

**Python MCP Server (FastMCP):**
```python
from mcp.server import Server
from pydantic import BaseModel

server = Server("my-mcp-server")

class GetDataInput(BaseModel):
    id: str
    include_details: bool = False

@server.tool(description="Retrieve data from the service")
async def get_data(input: GetDataInput) -> dict:
    result = await api_client.get_data(input.id, input.include_details)
    return {"data": result}
```

#### Phase 3: Testing
```bash
# TypeScript
npm run build
npx @modelcontextprotocol/inspector

# Python
python -m py_compile server.py
```

---

## Database Integration

### Prisma (Node.js)
```typescript
// prisma/schema.prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
}

// Usage
const user = await prisma.user.create({
  data: { email: 'user@example.com', name: 'John' }
});
```

### SQLAlchemy (Python)
```python
from sqlalchemy import Column, String, DateTime
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(String, primary_key=True)
    email = Column(String, unique=True)
    name = Column(String)
```

---

## Best Practices

### API Design
- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Return appropriate status codes
- Implement pagination for list endpoints
- Version your APIs (e.g., `/api/v1/`)
- Use consistent response formats

### Security
- Validate all input data
- Use parameterized queries (prevent SQL injection)
- Implement rate limiting
- Store secrets in environment variables
- Use HTTPS in production

### Error Handling
- Provide actionable error messages
- Log errors with context
- Don't expose internal details in production
- Use consistent error formats

### Performance
- Implement caching where appropriate
- Use connection pooling for databases
- Optimize database queries
- Implement request timeouts

---

## Quick Commands

```bash
# Node.js Development
npm run dev           # Start dev server with hot reload
npm run build         # Compile TypeScript
npm test              # Run tests

# Python Development
uvicorn app.main:app --reload  # Start dev server
pytest                          # Run tests
python -m mypy .                # Type checking
```

## Reference Resources
- [Express.js](https://expressjs.com)
- [FastAPI](https://fastapi.tiangolo.com)
- [MCP Protocol](https://modelcontextprotocol.io)
- [Prisma](https://www.prisma.io/docs)
- [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Python SDK](https://github.com/modelcontextprotocol/python-sdk)
