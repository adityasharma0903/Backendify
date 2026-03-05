import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { buildIRFromDetections } from '../core/ir/buildIR.js';
import { connectFrontendBackend } from '../lib/modes/connect.js';

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
}

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function withTempProject(name) {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), `backendify-${name}-`));

  const cleanup = () => {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  };

  return { tempRoot, cleanup };
}

function createBaseProjectStructure(projectPath, appContent) {
  writeFile(path.join(projectPath, 'package.json'), JSON.stringify({
    name: 'fixture-app',
    private: true
  }, null, 2));

  writeFile(path.join(projectPath, 'src', 'App.jsx'), appContent);

  writeFile(
    path.join(projectPath, 'backend', 'server.js'),
    `import express from 'express';\nconst app = express();\nconst PORT = process.env.PORT || 5000;\napp.listen(PORT);\n`
  );

  writeFile(
    path.join(projectPath, 'backend', 'routes', 'todos.routes.js'),
    `import express from 'express';\nconst router = express.Router();\nrouter.get('/');\nrouter.post('/');\nrouter.put('/:id');\nrouter.patch('/:id');\nrouter.delete('/:id');\nexport default router;\n`
  );
}

async function testBuildIRFiltersHealthProbe() {
  const ir = buildIRFromDetections([
    { method: 'GET', route: '/api/health', fields: [] },
    { method: 'POST', route: '/api/todos', fields: ['title', 'completed'] }
  ], []);

  const resourceNames = ir.resources.map((resource) => resource.name);

  assert(!resourceNames.includes('health'), 'health probe should not become a resource');
  assert(resourceNames.includes('todo'), 'todo resource should be present');
}

async function testConnectRewritesTemplateApiBaseAndPartialMethod() {
  const { tempRoot, cleanup } = withTempProject('connect-url-method');

  try {
    createBaseProjectStructure(
      tempRoot,
      `import React from 'react';\n\nconst API_BASE = 'http://localhost:5000';\n\nexport default function App() {\n  const fetchTodos = async () => {\n    const response = await fetch(\`${'${API_BASE}'}/api/todos\`);\n    const payload = await response.json();\n    return payload;\n  };\n\n  const markCompleted = async (id) => {\n    await fetch(\`${'${API_BASE}'}/api/todos/${'${id}'}\`, {\n      method: 'PUT',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({ completed: true })\n    });\n  };\n\n  return <button onClick={() => { fetchTodos(); markCompleted('1'); }}>Run</button>;\n}\n`
    );

    await connectFrontendBackend(tempRoot);

    const appAfter = readFile(path.join(tempRoot, 'src', 'App.jsx'));

    assert(appAfter.includes('${process.env.REACT_APP_API_URL}/api/todos'), 'API_BASE template URLs should be rewritten to env URL');
    assert(!appAfter.includes('${API_BASE}/api/todos'), 'old API_BASE URL usage should be removed after rewrite');
    assert(/method\s*:\s*'PATCH'/.test(appAfter), 'partial completed update should be converted to PATCH');
  } finally {
    cleanup();
  }
}

async function testConnectResponseParsingIsIdempotent() {
  const { tempRoot, cleanup } = withTempProject('connect-idempotent');

  try {
    createBaseProjectStructure(
      tempRoot,
      `import React from 'react';\n\nexport default function App() {\n  const run = async () => {\n    const response = await fetch('/api/todos');\n    const payload = await response.json();\n    return payload;\n  };\n\n  return <button onClick={run}>Run</button>;\n}\n`
    );

    await connectFrontendBackend(tempRoot);
    await connectFrontendBackend(tempRoot);

    const appAfter = readFile(path.join(tempRoot, 'src', 'App.jsx'));

    const payloadResponseMatches = appAfter.match(/const\s+payloadResponse\s*=\s*await\s+response\.json\(\);/g) || [];

    assert.equal(payloadResponseMatches.length, 1, 'response parsing rewrite should be applied once even after repeated connect runs');
    assert(!appAfter.includes('payloadResponseResponse'), 'duplicate nested response variable names should not appear');
  } finally {
    cleanup();
  }
}

async function run() {
  const tests = [
    testBuildIRFiltersHealthProbe,
    testConnectRewritesTemplateApiBaseAndPartialMethod,
    testConnectResponseParsingIsIdempotent
  ];

  console.log('\n🧪 Running P0 regression tests...\n');

  for (const testFn of tests) {
    try {
      await testFn();
      console.log(`✅ ${testFn.name}`);
    } catch (error) {
      console.error(`❌ ${testFn.name}: ${error.message}`);
      process.exit(1);
    }
  }

  console.log('\n✅ All P0 regression tests passed.\n');
}

run();
