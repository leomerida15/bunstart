# Bun

Bun is an all-in-one JavaScript runtime and toolkit designed for speed, combining a fast JavaScript runtime, bundler, test runner, and package manager into a single executable. Written in Zig with C++ bindings for JavaScriptCore, Bun provides a drop-in replacement for Node.js with dramatically faster startup times and lower memory usage. It natively supports TypeScript and JSX out of the box without additional configuration.

The runtime is powered by WebKit's JavaScriptCore engine and includes comprehensive APIs for building web servers, handling WebSockets, file I/O, SQLite databases, child processes, FFI, and more. Bun ships as a single binary that replaces the need for thousands of node_modules in development, offering built-in tools that are significantly faster than existing options while maintaining compatibility with existing Node.js projects.

## Core APIs

### HTTP Server with Bun.serve

Fast HTTP/HTTPS server with WebSocket support, static file serving, and hot reloading capabilities.

```typescript
import { serve } from "bun";

const server = serve({
  port: 3000,
  fetch(req, server) {
    const url = new URL(req.url);

    // WebSocket upgrade
    if (url.pathname === "/chat") {
      const upgraded = server.upgrade(req);
      if (upgraded) return undefined;
    }

    // JSON response
    if (url.pathname === "/api/users") {
      return Response.json([
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" }
      ]);
    }

    // Static file
    return new Response(Bun.file("./index.html"));
  },
  websocket: {
    open(ws) {
      ws.subscribe("chat-room");
      console.log("Client connected");
    },
    message(ws, message) {
      server.publish("chat-room", `User: ${message}`);
    },
    close(ws) {
      console.log("Client disconnected");
    }
  },
  error(error) {
    return new Response("Internal Error", { status: 500 });
  }
});

console.log(`Listening on http://localhost:${server.port}`);
```

### File I/O with Bun.file and Bun.write

Optimized file operations with streaming support and automatic MIME type detection.

```typescript
import { file, write } from "bun";

// Read file as text
const text = await file("./data.txt").text();

// Read as JSON
const config = await file("./config.json").json();

// Read as ArrayBuffer
const buffer = await file("./image.png").arrayBuffer();

// Stream large files
const largeFile = file("./large-video.mp4");
const stream = largeFile.stream();

// Write string to file
await write("./output.txt", "Hello World!");

// Write JSON
await write("./data.json", JSON.stringify({ key: "value" }));

// Copy file efficiently
await write("./backup.txt", file("./original.txt"));

// Write with options
await write("./logs.txt", "New log entry\n", {
  createPath: true,  // Create parent directories
});

// Get file metadata
const stats = file("./data.txt");
console.log({
  size: stats.size,
  type: stats.type,  // MIME type
  lastModified: stats.lastModified
});
```

### Child Processes with Bun.spawn

Spawn child processes with efficient streaming I/O and TypeScript support.

```typescript
import { spawn, spawnSync } from "bun";

// Asynchronous process with streaming
const proc = spawn({
  cmd: ["git", "log", "--oneline"],
  stdout: "pipe",
  stderr: "pipe",
  env: { ...process.env, GIT_DIR: ".git" }
});

const output = await new Response(proc.stdout).text();
const exitCode = await proc.exited;
console.log({ output, exitCode });

// Synchronous process
const { stdout, stderr, exitCode: code } = spawnSync({
  cmd: ["bun", "test"],
  cwd: "./tests",
  stdin: "inherit"
});

console.log(stdout.toString());

// Pipe processes together
const grep = spawn({
  cmd: ["grep", "ERROR"],
  stdin: proc.stdout,
  stdout: "pipe"
});

const errors = await new Response(grep.stdout).text();
```

### JavaScript Bundler with Bun.build

Fast JavaScript/TypeScript bundler with tree-shaking, code splitting, and plugin support.

```typescript
const result = await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  target: "browser",
  format: "esm",
  minify: true,
  sourcemap: "external",
  splitting: true,
  external: ["react", "react-dom"],
  naming: {
    entry: "[dir]/[name].[ext]",
    chunk: "[name]-[hash].[ext]",
    asset: "[name]-[hash].[ext]"
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    API_URL: JSON.stringify("https://api.example.com")
  },
  plugins: [
    {
      name: "custom-loader",
      setup(build) {
        build.onLoad({ filter: /\.custom$/ }, async (args) => {
          const text = await Bun.file(args.path).text();
          return {
            contents: `export default ${JSON.stringify(text)}`,
            loader: "js"
          };
        });
      }
    }
  ]
});

if (result.success) {
  console.log(`Built ${result.outputs.length} files`);
  for (const output of result.outputs) {
    console.log(`${output.path}: ${output.size} bytes`);
  }
} else {
  console.error("Build failed:");
  for (const log of result.logs) {
    console.error(log.message);
  }
}
```

### SQLite Database with bun:sqlite

High-performance embedded SQLite database with prepared statements and transactions.

```typescript
import { Database } from "bun:sqlite";

// Open database (or create if doesn't exist)
const db = new Database("myapp.db");

// Create table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    age INTEGER
  )
`);

// Insert data
const insert = db.query("INSERT INTO users (name, email, age) VALUES (?, ?, ?)");
insert.run("Alice", "alice@example.com", 30);
insert.run("Bob", "bob@example.com", 25);

// Query single row
const getUser = db.query("SELECT * FROM users WHERE email = ?");
const user = getUser.get("alice@example.com");
console.log(user); // { id: 1, name: 'Alice', email: 'alice@example.com', age: 30 }

// Query all rows
const allUsers = db.query("SELECT * FROM users WHERE age > ?");
const adults = allUsers.all(18);
console.log(adults); // Array of user objects

// Use transactions
const insertMany = db.transaction((users) => {
  for (const user of users) {
    insert.run(user.name, user.email, user.age);
  }
});

insertMany([
  { name: "Charlie", email: "charlie@example.com", age: 35 },
  { name: "Diana", email: "diana@example.com", age: 28 }
]);

// Map results to class instances
class User {
  name!: string;
  email!: string;
  get domain() {
    return this.email.split("@")[1];
  }
}

const query = db.query("SELECT * FROM users");
query.as(User);
const userInstances = query.all();
console.log(userInstances[0].domain); // "example.com"

db.close();
```

### SQL Database with bun:sql

Unified Promise-based API for PostgreSQL, MySQL, and SQLite with tagged template literals.

```typescript
import { sql, SQL } from "bun";

// PostgreSQL (reads from DATABASE_URL or POSTGRES_URL env var)
const users = await sql`
  SELECT * FROM users
  WHERE active = ${true}
  LIMIT ${10}
`;

// With MySQL
const mysql = new SQL("mysql://user:pass@localhost:3306/mydb");
const mysqlResults = await mysql`
  SELECT * FROM products
  WHERE price < ${100}
`;

// With PostgreSQL explicitly
const postgres = new SQL("postgres://user:pass@localhost:5432/mydb");
const pgResults = await postgres`
  SELECT * FROM orders
  WHERE created_at > ${new Date('2024-01-01')}
`;

// Insert with automatic prepared statements
await sql`
  INSERT INTO users (name, email, active)
  VALUES (${name}, ${email}, ${true})
`;

// Transactions
await sql.begin(async tx => {
  await tx`INSERT INTO accounts (user_id, balance) VALUES (${userId}, ${100})`;
  await tx`UPDATE users SET account_created = true WHERE id = ${userId}`;
  // Automatically commits on success, rolls back on error
});

// Named parameters
const result = await sql`
  SELECT * FROM users
  WHERE name = $name AND age > $minAge
`({ name: "Alice", minAge: 18 });

// Get rows as arrays
const rows = await sql`SELECT id, name FROM users`.values();
console.log(rows); // [[1, 'Alice'], [2, 'Bob']]

// Connection pooling (automatic)
const pool = new SQL({
  adapter: "postgres",
  hostname: "localhost",
  port: 5432,
  database: "myapp",
  username: "dbuser",
  password: "secretpass",
  max: 20 // max connections in pool
});
```

### File Pattern Matching with Bun.Glob

Fast glob pattern matching for finding files with async iteration support.

```typescript
import { Glob } from "bun";

// Create glob matcher
const glob = new Glob("**/*.{ts,tsx}");

// Scan directory synchronously
for (const file of glob.scanSync(".")) {
  console.log(file); // Relative paths: "src/index.ts", "src/App.tsx", etc.
}

// Scan directory asynchronously
for await (const file of glob.scan(".")) {
  console.log(file);
}

// With options
const jsGlob = new Glob("**/*.js");
for (const file of jsGlob.scanSync({
  cwd: "./src",           // Start from this directory
  followSymlinks: false,  // Don't follow symlinks
  onlyFiles: true,        // Only return files, not directories
  absolute: true          // Return absolute paths
})) {
  const stats = Bun.file(file);
  console.log(`${file}: ${stats.size} bytes`);
}

// Match against specific paths
const testGlob = new Glob("*.test.ts");
console.log(testGlob.match("app.test.ts"));    // true
console.log(testGlob.match("src/app.test.ts")); // false (no **)
```

### Cross-Platform Shell with Bun.$

Embedded cross-platform shell for running commands with template literal syntax.

```typescript
import { $ } from "bun";

// Basic command execution
const output = await $`ls -la`.text();
console.log(output);

// Capture output
const { stdout, stderr, exitCode } = await $`git status`;
console.log(stdout.toString());

// Command interpolation with automatic escaping
const fileName = "my file.txt";
await $`cat ${fileName}`; // Safely handles spaces

// Pipe commands
const errorLogs = await $`cat server.log | grep ERROR | tail -n 10`.text();

// Set environment and options
$.env({ NODE_ENV: "production" });
$.cwd("/path/to/project");

// Error handling
try {
  await $`false`; // Command that exits with non-zero
} catch (error) {
  console.error("Command failed:", error.exitCode);
}

// Quiet mode (don't throw on errors)
$.nothrow();
const result = await $`some-command-that-might-fail`;
if (result.exitCode !== 0) {
  console.log("Command failed but didn't throw");
}

// Conditional execution
if (await $`test -f config.json`.quiet()) {
  const config = await $`cat config.json`.json();
  console.log(config);
}
```

### Foreign Function Interface with bun:ffi

Call native libraries and compile C code dynamically with FFI support.

```typescript
import { dlopen, FFIType, ptr, CString, cc } from "bun:ffi";

// Open a shared library
const lib = dlopen("libsqlite3.so", {
  sqlite3_libversion: {
    returns: FFIType.cstring,
    args: []
  },
  sqlite3_open: {
    returns: FFIType.int,
    args: [FFIType.cstring, FFIType.ptr]
  }
});

const version = lib.symbols.sqlite3_libversion();
console.log("SQLite version:", version);

// Compile and load C code at runtime
const { symbols } = cc({
  source: `
    int add(int a, int b) {
      return a + b;
    }

    double multiply(double x, double y) {
      return x * y;
    }
  `,
  symbols: {
    add: {
      returns: "int",
      args: ["int", "int"]
    },
    multiply: {
      returns: "double",
      args: ["double", "double"]
    }
  }
});

console.log(symbols.add(5, 3));           // 8
console.log(symbols.multiply(2.5, 4.0));  // 10.0

// Working with pointers
const buffer = new Uint8Array(1024);
const bufferPtr = ptr(buffer);
console.log("Buffer pointer:", bufferPtr);
```

### Testing with bun:test

Fast test runner with Jest-compatible API, snapshots, mocks, and code coverage.

```typescript
import { test, expect, describe, beforeAll, afterEach, mock } from "bun:test";

describe("User API", () => {
  let server: Server;

  beforeAll(() => {
    server = Bun.serve({
      port: 0,
      fetch(req) {
        return Response.json({ users: [] });
      }
    });
  });

  afterEach(() => {
    Bun.gc(true); // Force garbage collection
  });

  test("fetches users", async () => {
    const response = await fetch(`${server.url}/users`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("users");
    expect(data.users).toBeArrayOfSize(0);
  });

  test("snapshot testing", () => {
    const user = { id: 1, name: "Alice", email: "alice@example.com" };
    expect(user).toMatchSnapshot();
  });

  test("mocking functions", () => {
    const mockFn = mock((x: number) => x * 2);

    const result = mockFn(5);

    expect(result).toBe(10);
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith(5);
  });

  test("async operations", async () => {
    const promise = Promise.resolve(42);
    await expect(promise).resolves.toBe(42);
  });
});
```

### WebSocket Client

Built-in WebSocket client for real-time bidirectional communication.

```typescript
// WebSocket client
const ws = new WebSocket("ws://localhost:3000/chat");

ws.addEventListener("open", () => {
  console.log("Connected to server");
  ws.send(JSON.stringify({ type: "join", user: "Alice" }));
});

ws.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);
  console.log("Received:", data);
});

ws.addEventListener("error", (error) => {
  console.error("WebSocket error:", error);
});

ws.addEventListener("close", (event) => {
  console.log("Disconnected:", event.code, event.reason);
});

// Send periodic heartbeats
setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "ping" }));
  }
}, 30000);
```

### TCP/UDP Sockets

Low-level socket APIs for custom network protocols.

```typescript
import { connect, listen } from "bun";

// TCP server
const server = listen({
  hostname: "localhost",
  port: 8080,
  socket: {
    data(socket, data) {
      // Echo server
      socket.write(data);
    },
    open(socket) {
      console.log("Client connected:", socket.remoteAddress);
    },
    close(socket) {
      console.log("Client disconnected");
    },
    error(socket, error) {
      console.error("Socket error:", error);
    }
  }
});

// TCP client
const socket = await connect({
  hostname: "example.com",
  port: 80,
  socket: {
    data(socket, data) {
      console.log("Received:", Buffer.from(data).toString());
    },
    open(socket) {
      socket.write("GET / HTTP/1.1\r\nHost: example.com\r\n\r\n");
    }
  }
});
```

### Password Hashing

Secure password hashing with bcrypt and argon2.

```typescript
import { password } from "bun";

// Hash a password (uses bcrypt by default)
const hash = await password.hash("super-secret-password");
console.log(hash); // $2b$10$...

// Verify password
const isValid = await password.verify("super-secret-password", hash);
console.log(isValid); // true

// Use argon2
const argonHash = await password.hash("my-password", {
  algorithm: "argon2id",
  memoryCost: 65536,    // 64 MiB
  timeCost: 3           // iterations
});

const argonValid = await password.verify("my-password", argonHash);
console.log(argonValid); // true
```

### Redis Client

High-performance Redis/Valkey client with automatic reconnection and connection pooling.

```typescript
import { RedisClient } from "bun";

// Connect to Redis (defaults to REDIS_URL or VALKEY_URL env var)
const redis = new RedisClient();

// Or with explicit connection
const redisCustom = new RedisClient("redis://localhost:6379", {
  connectionTimeout: 10000,
  autoReconnect: true,
  maxRetries: 10,
  enableAutoPipelining: true
});

// Basic key-value operations
await redis.set("user:1", "Alice");
const name = await redis.get("user:1");
console.log(name); // "Alice"

// Set with expiration (in seconds)
await redis.set("session:abc", "token123", "EX", 3600);

// Set with expiration (in milliseconds)
await redis.set("cache:key", "value", "PX", 60000);

// Conditional set (only if key doesn't exist)
const created = await redis.set("lock:resource", "locked", "NX");
if (created === "OK") {
  console.log("Lock acquired");
}

// Get binary data
const buffer = await redis.getBuffer("image:1");

// Delete keys
await redis.del("user:1");

// Check if key exists
const exists = await redis.exists("user:1");

// Increment/Decrement
await redis.incr("counter");
await redis.incrby("counter", 5);
await redis.decr("counter");

// Hash operations
await redis.hset("user:100", "name", "Bob");
await redis.hset("user:100", "age", "30");
const userName = await redis.hget("user:100", "name");
const userFields = await redis.hgetall("user:100");

// List operations
await redis.lpush("queue", "job1");
await redis.rpush("queue", "job2");
const job = await redis.lpop("queue");

// Set operations
await redis.sadd("tags", "javascript", "typescript", "bun");
const tags = await redis.smembers("tags");
const isTag = await redis.sismember("tags", "javascript");

// Pub/Sub
await redis.subscribe("channel1", (message, channel) => {
  console.log(`Received on ${channel}:`, message);
});

await redis.publish("channel1", "Hello subscribers!");

// Connection lifecycle
redis.onconnect = () => console.log("Connected to Redis");
redis.onclose = (error) => console.log("Disconnected:", error);

// Manual connection control
await redis.connect();
redis.close();
```

### S3 Client

Native S3-compatible storage client for AWS S3, MinIO, DigitalOcean Spaces, and more.

```typescript
import { S3Client } from "bun";

// Create S3 client with credentials
const s3 = new S3Client({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  bucket: "my-bucket",
  endpoint: "https://s3.us-east-1.amazonaws.com",
  region: "us-east-1"
});

// Write string to S3
await s3.write("hello.txt", "Hello World!");

// Write JSON with content type
await s3.write(
  "data.json",
  JSON.stringify({ hello: "world" }),
  { type: "application/json" }
);

// Write from file
const file = Bun.file("./local-image.jpg");
await s3.write("images/photo.jpg", file, {
  type: "image/jpeg",
  acl: "public-read"
});

// Write from fetch response
const response = await fetch("https://example.com/data.csv");
await s3.write("downloads/data.csv", response);

// Get S3File reference
const s3File = s3.file("hello.txt");

// Read file content
const text = await s3File.text();
const json = await s3File.json();
const buffer = await s3File.arrayBuffer();

// Get file metadata
console.log({
  size: s3File.size,
  type: s3File.type,
  lastModified: s3File.lastModified
});

// Stream large files
const stream = s3File.stream();
for await (const chunk of stream) {
  console.log("Received chunk:", chunk.length);
}

// Delete file
await s3.delete("hello.txt");

// List objects
const objects = await s3.list({ prefix: "images/" });
for (const obj of objects) {
  console.log(obj.key, obj.size, obj.lastModified);
}

// Static methods (one-off operations without credentials reuse)
await S3Client.write("file.txt", "content", {
  accessKeyId: "key",
  secretAccessKey: "secret",
  bucket: "my-bucket",
  endpoint: "https://s3.amazonaws.com"
});

const staticFile = S3Client.file("file.txt", {
  accessKeyId: "key",
  secretAccessKey: "secret",
  bucket: "my-bucket"
});

// Copy files
await s3.copy("source.txt", "destination.txt");

// Generate presigned URLs (for temporary access)
const presignedUrl = await s3.presign("private-file.pdf", {
  expiresIn: 3600 // seconds
});
```

## Main Use Cases and Integration Patterns

Bun excels as a complete development toolkit for modern JavaScript applications. For web applications, developers can use `Bun.serve()` to create high-performance HTTP servers with built-in WebSocket support, static file serving, and hot reloading—all without external dependencies. The integrated `Bun.build()` bundler replaces webpack/esbuild for production builds, offering faster compilation with tree-shaking and code splitting. Database applications benefit from native support for SQLite (`bun:sqlite`) and SQL databases (`bun:sql`) for PostgreSQL and MySQL, providing unified APIs with connection pooling and transactions. The native `RedisClient` enables high-performance caching and pub/sub messaging with automatic reconnection, while `S3Client` provides seamless object storage integration with AWS S3, MinIO, and S3-compatible services. The built-in test runner (`bun test`) provides a Jest-compatible API with native TypeScript support and faster execution times, making it ideal for TDD workflows. For system integration, the cross-platform shell (`Bun.$`) enables seamless command execution with template literals, while the FFI API (`bun:ffi`) allows calling native libraries and compiling C code at runtime.

Integration patterns follow Node.js conventions while adding Bun-specific optimizations. Existing Node.js applications can gradually adopt Bun by replacing `node` with `bun` in scripts while maintaining compatibility with npm packages. For new projects, initialize with `bun init` and use `bun install` for package management, which creates a binary lockfile for faster installs. Deploy applications using single-file executables with `bun build --compile`, bundling the entire application and runtime into one binary. For microservices, combine `Bun.serve()` with `Bun.$` shell commands for system integration, `spawn()` for child processes, and `bun:ffi` for native library calls. Database-driven applications can leverage the unified `sql` API for PostgreSQL/MySQL with automatic prepared statements and connection pooling, use `bun:sqlite` for embedded database functionality, or integrate `RedisClient` for caching and real-time features. Cloud-native applications can store and retrieve files directly with `S3Client`, eliminating dependencies on AWS SDK packages. Framework integrations work seamlessly—use Bun with React (via `bun create react`), Next.js, Remix, SvelteKit, or any Node.js-compatible framework while gaining performance benefits from Bun's faster runtime and bundler.
