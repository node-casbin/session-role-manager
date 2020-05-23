# session-role-manager

[![NPM version][npm-image]][npm-url]
[![NPM download][download-image]][download-url]
[![Release](https://img.shields.io/github/release/node-casbin/session-role-manager.svg)](https://github.com/node-casbin/session-role-manager/releases)

[npm-image]: https://img.shields.io/npm/v/session-role-manager.svg?style=flat-square
[npm-url]: https://npmjs.org/package/session-role-manager
[download-image]: https://img.shields.io/npm/dm/session-role-manager.svg?style=flat-square
[download-url]: https://npmjs.org/package/session-role-manager

Session Role Manager is the Session-based role manager for node-casbin. With this library, node-casbin can load session-based role hierarchy (user-role mapping) from Casbin policy or save role hierarchy to it. The session is only active in the specified time range.

## Installation

```shell script
# Yarn
yarn add session-role-manager
# NPM
npm install session-role-manager --save
```

## Example

```typescript
import { newEnforcer } from 'casbin';
import { SessionRoleManager } from 'session-role-manager';

async function app() {
  const e = await newEnforcer('examples/rbac_model_with_sessions.conf', 'examples/rbac_policy_with_sessions.csv');

  // Use our role manager.
  const rm = new SessionRoleManager(10);
  e.setRoleManager(rm);
  await e.buildRoleLinks();
}

app();
```
