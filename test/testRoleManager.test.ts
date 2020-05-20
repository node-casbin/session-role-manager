import { newEnforcer, FileAdapter } from 'casbin';
import { getAfterCurrentTime, getAfterOneHour, getCurrentTime, getInOneHour, getOneHourAgo } from './testUtilFunctions';
import { SessionRoleManager } from '../src/roleManager';
import { testEnforce, testSessionRole, testPrintSessionRoles } from './testHelperFunctions';

test('testSessionRole', async () => {
  const rm = new SessionRoleManager(3);
  rm.addLink('alpha', 'bravo', getCurrentTime(), getInOneHour());
  rm.addLink('alpha', 'charlie', getCurrentTime(), getInOneHour());
  rm.addLink('bravo', 'delta', getCurrentTime(), getInOneHour());
  rm.addLink('bravo', 'echo', getCurrentTime(), getInOneHour());
  rm.addLink('charlie', 'echo', getCurrentTime(), getInOneHour());
  rm.addLink('charlie', 'foxtrott', getCurrentTime(), getInOneHour());

  testSessionRole(rm, 'alpha', 'bravo', getCurrentTime(), true);
  testSessionRole(rm, 'alpha', 'charlie', getCurrentTime(), true);
  testSessionRole(rm, 'bravo', 'delta', getCurrentTime(), true);
  testSessionRole(rm, 'bravo', 'echo', getCurrentTime(), true);
  testSessionRole(rm, 'charlie', 'echo', getCurrentTime(), true);
  testSessionRole(rm, 'charlie', 'foxtrott', getCurrentTime(), true);

  testSessionRole(rm, 'alpha', 'bravo', getOneHourAgo(), false);
  testSessionRole(rm, 'alpha', 'charlie', getOneHourAgo(), false);
  testSessionRole(rm, 'bravo', 'delta', getOneHourAgo(), false);
  testSessionRole(rm, 'bravo', 'echo', getOneHourAgo(), false);
  testSessionRole(rm, 'charlie', 'echo', getOneHourAgo(), false);
  testSessionRole(rm, 'charlie', 'foxtrott', getOneHourAgo(), false);

  testSessionRole(rm, 'alpha', 'bravo', getAfterOneHour(), false);
  testSessionRole(rm, 'alpha', 'charlie', getAfterOneHour(), false);
  testSessionRole(rm, 'bravo', 'delta', getAfterOneHour(), false);
  testSessionRole(rm, 'bravo', 'echo', getAfterOneHour(), false);
  testSessionRole(rm, 'charlie', 'echo', getAfterOneHour(), false);
  testSessionRole(rm, 'charlie', 'foxtrott', getAfterOneHour(), false);
});

test('testClear', async () => {
  const rm = new SessionRoleManager(3);
  rm.addLink('alpha', 'bravo', getCurrentTime(), getInOneHour());
  rm.addLink('alpha', 'charlie', getCurrentTime(), getInOneHour());
  rm.addLink('bravo', 'delta', getCurrentTime(), getInOneHour());
  rm.addLink('bravo', 'echo', getCurrentTime(), getInOneHour());
  rm.addLink('charlie', 'echo', getCurrentTime(), getInOneHour());
  rm.addLink('charlie', 'foxtrott', getCurrentTime(), getInOneHour());

  rm.clear();

  // All data is cleared.
  // No role inheritance now.

  testSessionRole(rm, 'alpha', 'bravo', getCurrentTime(), false);
  testSessionRole(rm, 'alpha', 'charlie', getCurrentTime(), false);
  testSessionRole(rm, 'bravo', 'delta', getCurrentTime(), false);
  testSessionRole(rm, 'bravo', 'echo', getCurrentTime(), false);
  testSessionRole(rm, 'charlie', 'echo', getCurrentTime(), false);
  testSessionRole(rm, 'charlie', 'foxtrott', getCurrentTime(), false);
});

test('testAddLink', async () => {
  const rm = new SessionRoleManager(3);
  rm.addLink('alpha', 'bravo');
  testSessionRole(rm, 'alpha', 'bravo', getCurrentTime(), false);

  rm.addLink('alpha', 'bravo', getCurrentTime());
  testSessionRole(rm, 'alpha', 'bravo', getCurrentTime(), false);
});

test('testHasLink', async () => {
  const rm = new SessionRoleManager(3);

  const alpha = 'alpha';
  const bravo = 'bravo';

  await expect(await rm.hasLink(alpha, bravo)).toEqual(false);
  await expect(await rm.hasLink(alpha, alpha, getCurrentTime())).toEqual(true);
  await expect(await rm.hasLink(alpha, bravo, getCurrentTime())).toEqual(false);

  rm.addLink(alpha, bravo, getCurrentTime(), getInOneHour());
  await expect(await rm.hasLink(alpha, bravo, getCurrentTime())).toEqual(true);
});

test('testDeleteLink', async () => {
  const rm = new SessionRoleManager(3);

  const alpha = 'alpha';
  const bravo = 'bravo';
  const charlie = 'charlie';

  rm.addLink(alpha, bravo, getOneHourAgo(), getInOneHour());
  rm.addLink(alpha, charlie, getOneHourAgo(), getInOneHour());

  rm.deleteLink(alpha, bravo);

  await expect(await rm.hasLink(alpha, bravo, getCurrentTime())).toEqual(false);

  rm.deleteLink(alpha, 'delta');
  rm.deleteLink(bravo, charlie);

  await expect(await rm.hasLink(alpha, charlie, getCurrentTime())).toEqual(true);
});

test('testHierarchieLevel', async () => {
  const rm = new SessionRoleManager(2);

  rm.addLink('alpha', 'bravo', getOneHourAgo(), getInOneHour());
  rm.addLink('bravo', 'charlie', getOneHourAgo(), getInOneHour());

  await expect(await rm.hasLink('alpha', 'charlie', getCurrentTime())).toEqual(false);
});

test('testOutdatedSessions', async () => {
  let rm = new SessionRoleManager(3);

  rm.addLink('alpha', 'bravo', getOneHourAgo(), getCurrentTime());
  rm.addLink('bravo', 'charlie', getOneHourAgo(), getInOneHour());

  await expect(await rm.hasLink('alpha', 'bravo', getInOneHour())).toEqual(false);
  await expect(await rm.hasLink('alpha', 'charlie', getOneHourAgo())).toEqual(true);
});

test('testGetRoles', async () => {
  const rm = new SessionRoleManager(3);

  await expect(await rm.getRoles('alpha')).toEqual(null);
  await expect(await rm.getRoles('bravo', getCurrentTime())).toEqual(null);

  rm.addLink('alpha', 'bravo', getOneHourAgo(), getInOneHour());

  testPrintSessionRoles(rm, 'alpha', getOneHourAgo(), ['bravo']);
  testPrintSessionRoles(rm, 'alpha', getCurrentTime(), ['bravo']);
  testPrintSessionRoles(rm, 'alpha', getAfterOneHour(), []);

  rm.addLink('alpha', 'charlie', getOneHourAgo(), getCurrentTime());

  testPrintSessionRoles(rm, 'alpha', getOneHourAgo(), ['bravo', 'charlie']);
  testPrintSessionRoles(rm, 'alpha', getAfterCurrentTime(), ['bravo']);
  testPrintSessionRoles(rm, 'alpha', getAfterOneHour(), []);

  rm.addLink('alpha', 'charlie', getOneHourAgo(), getInOneHour());

  testPrintSessionRoles(rm, 'alpha', getOneHourAgo(), ['bravo', 'charlie']);
  testPrintSessionRoles(rm, 'alpha', getCurrentTime(), ['bravo', 'charlie']);
  testPrintSessionRoles(rm, 'alpha', getAfterOneHour(), []);
});

test('testGetUsers', async () => {
  const rm = new SessionRoleManager(3);

  rm.addLink('bravo', 'alpha', getOneHourAgo(), getInOneHour());
  rm.addLink('charlie', 'alpha', getOneHourAgo(), getInOneHour());
  rm.addLink('delta', 'alpha', getOneHourAgo(), getInOneHour());

  let myRes = await rm.getUsers('alpha');
  await expect(myRes).toEqual(null);

  myRes = await rm.getUsers('alpha', getCurrentTime());
  await expect(myRes).toEqual(['bravo', 'charlie', 'delta']);

  myRes = await rm.getUsers('alpha', getOneHourAgo());
  await expect(myRes).toEqual(['bravo', 'charlie', 'delta']);

  myRes = await rm.getUsers('alpha', getAfterOneHour());
  await expect(myRes).toEqual([]);

  myRes = await rm.getUsers('bravo', getCurrentTime());
  await expect(myRes).toEqual([]);
});

test('testEnforcer', async () => {
  // NewEnforcer(modelPath, policyPath) automatically uses the default
  // role manager when loading policy. So if we want to use a custom
  // role manager, and this role manager relies on Casbin policy,
  // we should manually set the role manager before loading policy.
  const e = await newEnforcer('examples/rbac_model_with_sessions.conf');

  // Manually set an adapter.
  const a = new FileAdapter('examples/rbac_policy_with_sessions.csv');
  e.setAdapter(a);

  // Use our role manager.
  const rm = new SessionRoleManager(10);
  e.setRoleManager(rm);

  // If our role manager relies on Casbin policy (like reading "g"
  // policy rules), then we have to set the role manager before loading
  // policy.
  //
  // Otherwise, we can set the role manager at any time, because role
  // manager has nothing to do with the adapter.
  e.loadPolicy();

  // Current role inheritance tree:
  //          delta          echo          foxtrott
  //             \            / \           /
  //      (0-20)  \   (5-15) /   \ (10-20) / (10-12)
  //               \        /     \       /
  //                 bravo         charlie
  //                   \             /
  //             (0-10) \           / (5-15)
  //                     \         /
  //                        alpha

  // Note: we use small integers as time range just for example, in real
  // environment, it will be Unix time range like (1508503308708903372-1508506908708903907)

  testEnforce(e, 'alpha', 'data1', 'read', '00', true);
  testEnforce(e, 'alpha', 'data1', 'read', '05', true);
  testEnforce(e, 'alpha', 'data1', 'read', '10', true);
  testEnforce(e, 'alpha', 'data1', 'read', '15', false);
  testEnforce(e, 'alpha', 'data1', 'read', '20', false);

  testEnforce(e, 'alpha', 'data2', 'read', '00', false);
  testEnforce(e, 'alpha', 'data2', 'read', '05', true);
  testEnforce(e, 'alpha', 'data2', 'read', '10', true);
  testEnforce(e, 'alpha', 'data2', 'read', '15', true);
  testEnforce(e, 'alpha', 'data2', 'read', '20', false);

  testEnforce(e, 'alpha', 'data3', 'read', '00', false);
  testEnforce(e, 'alpha', 'data3', 'read', '05', false);
  testEnforce(e, 'alpha', 'data3', 'read', '10', true);
  testEnforce(e, 'alpha', 'data3', 'read', '15', false);
  testEnforce(e, 'alpha', 'data3', 'read', '20', false);
});
