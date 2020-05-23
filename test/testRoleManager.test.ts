import { newEnforcer, FileAdapter } from 'casbin';
import { getAfterCurrentTime, getAfterOneHour, getCurrentTime, getInOneHour, getOneHourAgo } from './testUtilFunctions';
import { SessionRoleManager } from '../src';
import { testEnforce, testSessionRole, testPrintSessionRoles } from './testHelperFunctions';

test('testSessionRole', async () => {
  const rm = new SessionRoleManager(3);
  await rm.addLink('alpha', 'bravo', getCurrentTime(), getInOneHour());
  await rm.addLink('alpha', 'charlie', getCurrentTime(), getInOneHour());
  await rm.addLink('bravo', 'delta', getCurrentTime(), getInOneHour());
  await rm.addLink('bravo', 'echo', getCurrentTime(), getInOneHour());
  await rm.addLink('charlie', 'echo', getCurrentTime(), getInOneHour());
  await rm.addLink('charlie', 'foxtrott', getCurrentTime(), getInOneHour());

  await testSessionRole(rm, 'alpha', 'bravo', getCurrentTime(), true);
  await testSessionRole(rm, 'alpha', 'charlie', getCurrentTime(), true);
  await testSessionRole(rm, 'bravo', 'delta', getCurrentTime(), true);
  await testSessionRole(rm, 'bravo', 'echo', getCurrentTime(), true);
  await testSessionRole(rm, 'charlie', 'echo', getCurrentTime(), true);
  await testSessionRole(rm, 'charlie', 'foxtrott', getCurrentTime(), true);

  await testSessionRole(rm, 'alpha', 'bravo', getOneHourAgo(), false);
  await testSessionRole(rm, 'alpha', 'charlie', getOneHourAgo(), false);
  await testSessionRole(rm, 'bravo', 'delta', getOneHourAgo(), false);
  await testSessionRole(rm, 'bravo', 'echo', getOneHourAgo(), false);
  await testSessionRole(rm, 'charlie', 'echo', getOneHourAgo(), false);
  await testSessionRole(rm, 'charlie', 'foxtrott', getOneHourAgo(), false);

  await testSessionRole(rm, 'alpha', 'bravo', getAfterOneHour(), false);
  await testSessionRole(rm, 'alpha', 'charlie', getAfterOneHour(), false);
  await testSessionRole(rm, 'bravo', 'delta', getAfterOneHour(), false);
  await testSessionRole(rm, 'bravo', 'echo', getAfterOneHour(), false);
  await testSessionRole(rm, 'charlie', 'echo', getAfterOneHour(), false);
  await testSessionRole(rm, 'charlie', 'foxtrott', getAfterOneHour(), false);
});

test('testClear', async () => {
  const rm = new SessionRoleManager(3);
  await rm.addLink('alpha', 'bravo', getCurrentTime(), getInOneHour());
  await rm.addLink('alpha', 'charlie', getCurrentTime(), getInOneHour());
  await rm.addLink('bravo', 'delta', getCurrentTime(), getInOneHour());
  await rm.addLink('bravo', 'echo', getCurrentTime(), getInOneHour());
  await rm.addLink('charlie', 'echo', getCurrentTime(), getInOneHour());
  await rm.addLink('charlie', 'foxtrott', getCurrentTime(), getInOneHour());

  await rm.clear();

  // All data is cleared.
  // No role inheritance now.

  await testSessionRole(rm, 'alpha', 'bravo', getCurrentTime(), false);
  await testSessionRole(rm, 'alpha', 'charlie', getCurrentTime(), false);
  await testSessionRole(rm, 'bravo', 'delta', getCurrentTime(), false);
  await testSessionRole(rm, 'bravo', 'echo', getCurrentTime(), false);
  await testSessionRole(rm, 'charlie', 'echo', getCurrentTime(), false);
  await testSessionRole(rm, 'charlie', 'foxtrott', getCurrentTime(), false);
});

test('testHasLink', async () => {
  const rm = new SessionRoleManager(3);

  const alpha = 'alpha';
  const bravo = 'bravo';

  await expect(rm.hasLink(alpha, bravo)).rejects.toThrowError(new Error('requestTime length should be 1'));
  await expect(await rm.hasLink(alpha, alpha, getCurrentTime())).toEqual(true);
  await expect(await rm.hasLink(alpha, bravo, getCurrentTime())).toEqual(false);

  await rm.addLink(alpha, bravo, getCurrentTime(), getInOneHour());
  await expect(await rm.hasLink(alpha, bravo, getCurrentTime())).toEqual(true);
});

test('testDeleteLink', async () => {
  const rm = new SessionRoleManager(3);

  const alpha = 'alpha';
  const bravo = 'bravo';
  const charlie = 'charlie';

  await rm.addLink(alpha, bravo, getOneHourAgo(), getInOneHour());
  await rm.addLink(alpha, charlie, getOneHourAgo(), getInOneHour());

  await rm.deleteLink(alpha, bravo);

  await expect(await rm.hasLink(alpha, bravo, getCurrentTime())).toEqual(false);

  await rm.deleteLink(bravo, charlie);

  await expect(await rm.hasLink(alpha, charlie, getCurrentTime())).toEqual(true);
});

test('testHierarchieLevel', async () => {
  const rm = new SessionRoleManager(2);

  await rm.addLink('alpha', 'bravo', getOneHourAgo(), getInOneHour());
  await rm.addLink('bravo', 'charlie', getOneHourAgo(), getInOneHour());

  await expect(await rm.hasLink('alpha', 'charlie', getCurrentTime())).toEqual(false);
});

test('testOutdatedSessions', async () => {
  let rm = new SessionRoleManager(3);

  await rm.addLink('alpha', 'bravo', getOneHourAgo(), getCurrentTime());
  await rm.addLink('bravo', 'charlie', getOneHourAgo(), getInOneHour());

  await expect(await rm.hasLink('alpha', 'bravo', getInOneHour())).toEqual(false);
  await expect(await rm.hasLink('alpha', 'charlie', getOneHourAgo())).toEqual(true);
});

test('testGetRoles', async () => {
  const rm = new SessionRoleManager(3);

  await expect(rm.getRoles('alpha')).rejects.toThrowError(new Error('requestTime length should be 1'));
  await expect(await rm.getRoles('bravo', getCurrentTime())).toEqual([]);

  await rm.addLink('alpha', 'bravo', getOneHourAgo(), getInOneHour());

  await testPrintSessionRoles(rm, 'alpha', getOneHourAgo(), ['bravo']);
  await testPrintSessionRoles(rm, 'alpha', getCurrentTime(), ['bravo']);
  await testPrintSessionRoles(rm, 'alpha', getAfterOneHour(), []);

  await rm.addLink('alpha', 'charlie', getOneHourAgo(), getCurrentTime());

  await testPrintSessionRoles(rm, 'alpha', getOneHourAgo(), ['bravo', 'charlie']);
  await testPrintSessionRoles(rm, 'alpha', getAfterCurrentTime(), ['bravo']);
  await testPrintSessionRoles(rm, 'alpha', getAfterOneHour(), []);

  await rm.addLink('alpha', 'charlie', getOneHourAgo(), getInOneHour());

  await testPrintSessionRoles(rm, 'alpha', getOneHourAgo(), ['bravo', 'charlie']);
  await testPrintSessionRoles(rm, 'alpha', getCurrentTime(), ['bravo', 'charlie']);
  await testPrintSessionRoles(rm, 'alpha', getAfterOneHour(), []);
});

test('testGetUsers', async () => {
  const rm = new SessionRoleManager(3);

  await rm.addLink('bravo', 'alpha', getOneHourAgo(), getInOneHour());
  await rm.addLink('charlie', 'alpha', getOneHourAgo(), getInOneHour());
  await rm.addLink('delta', 'alpha', getOneHourAgo(), getInOneHour());
  await expect(rm.getUsers('alpha')).rejects.toThrowError(new Error('requestTime length should be 1'));

  let myRes = await rm.getUsers('alpha', getCurrentTime());
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
  await e.loadPolicy();

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

  await testEnforce(e, 'alpha', 'data1', 'read', '00', true);
  await testEnforce(e, 'alpha', 'data1', 'read', '05', true);
  await testEnforce(e, 'alpha', 'data1', 'read', '10', true);
  await testEnforce(e, 'alpha', 'data1', 'read', '15', false);
  await testEnforce(e, 'alpha', 'data1', 'read', '20', false);

  await testEnforce(e, 'alpha', 'data2', 'read', '00', false);
  await testEnforce(e, 'alpha', 'data2', 'read', '05', true);
  await testEnforce(e, 'alpha', 'data2', 'read', '10', true);
  await testEnforce(e, 'alpha', 'data2', 'read', '15', true);
  await testEnforce(e, 'alpha', 'data2', 'read', '20', false);

  await testEnforce(e, 'alpha', 'data3', 'read', '00', false);
  await testEnforce(e, 'alpha', 'data3', 'read', '05', false);
  await testEnforce(e, 'alpha', 'data3', 'read', '10', true);
  await testEnforce(e, 'alpha', 'data3', 'read', '15', false);
  await testEnforce(e, 'alpha', 'data3', 'read', '20', false);
});
