import { Enforcer, RoleManager } from 'casbin';

export async function testEnforce(e: Enforcer, sub: string, obj: string, act: string, time: string, res: boolean): Promise<void> {
  await expect(await e.enforce(sub, obj, act, time)).toEqual(res);
}

export async function testSessionRole(rm: RoleManager, name1: string, name2: string, requestTime: string, res: boolean): Promise<void> {
  await expect(await rm.hasLink(name1, name2, requestTime)).toEqual(res);
}

export async function testPrintSessionRoles(rm: RoleManager, name1: string, requestTime: string, res: string[]): Promise<void> {
  const myRes = await rm.getRoles(name1, requestTime);
  await expect(myRes).toEqual(res);
}
