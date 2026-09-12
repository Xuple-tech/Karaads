import fs from 'node:fs';
import path from 'node:path';

const packagePaths = [
  path.join(process.cwd(), 'node_modules', 'react-native-webrtc', 'node_modules', 'event-target-shim', 'package.json'),
  path.join(process.cwd(), 'node_modules', 'event-target-shim', 'package.json'),
];

for (const packagePath of packagePaths) {
  if (!fs.existsSync(packagePath)) {
    continue;
  }

  const raw = fs.readFileSync(packagePath, 'utf8');
  const json = JSON.parse(raw);
  const exportsField = json.exports ?? {};
  let changed = false;

  if (!exportsField['.']) {
    exportsField['.'] = {
      import: './dist/event-target-shim.mjs',
      require: './dist/event-target-shim.js',
      default: './dist/event-target-shim.js',
    };
    changed = true;
  }

  if (!exportsField['./index']) {
    exportsField['./index'] = {
      import: './index.mjs',
      require: './index.js',
    };
    changed = true;
  }

  if (changed) {
    json.exports = exportsField;
    fs.writeFileSync(packagePath, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
  }
}
