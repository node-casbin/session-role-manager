import { RoleManager, logPrint } from 'casbin';
import { SessionRole } from './sessionRole';
import { Session } from './session';

export class SessionRoleManager implements RoleManager {
  private allRoles: Map<string, SessionRole>;
  private maxHierarchyLevel: number;

  /**
   * Constructor for creating an instance of the
   * session RoleManager implementation.
   *
   * @param maxHierarchyLevel the maximized allowed RBAC hierarchy level.
   */
  constructor(maxHierarchyLevel: number) {
    this.allRoles = new Map<string, SessionRole>();
    this.maxHierarchyLevel = maxHierarchyLevel;
  }

  private hasRole(name: string): boolean {
    return this.allRoles.has(name);
  }

  private createRole(name: string): SessionRole {
    if (!this.hasRole(name)) {
      this.allRoles.set(name, new SessionRole(name));
    }
    return this.allRoles.get(name);
  }

  // Clear clears all stored data and resets the role manager to the initial state.
  public clear(): Promise<void> {
    this.allRoles = new Map<string, SessionRole>();
    return;
  }

  // AddLink adds the inheritance link between role: name1 and role: name2.
  // aka role: name1 inherits role: name2.
  // timeRange is the time range when the role inheritance link is active.
  public addLink(name1: string, name2: string, ...timeRange: string[]): Promise<void> {
    if (timeRange.length != 2) {
      // return errors.New("error: timeRange should be 2 parameters")
      return;
    }
    const startTime = timeRange[0];
    const endTime = timeRange[1];

    const role1 = this.createRole(name1);
    const role2 = this.createRole(name2);

    const session = new Session(role2, startTime, endTime);
    role1.addSession(session);
    return;
  }

  // DeleteLink deletes the inheritance link between role: name1 and role: name2.
  // aka role: name1 does not inherit role: name2 any more.
  // unused is not used.
  public deleteLink(name1: string, name2: string, ...unused: string[]): Promise<void> {
    if (!this.hasRole(name1) || !this.hasRole(name2)) {
      // return errors.New("error: name1 or name2 does not exist")
      return;
    }

    const role1 = this.createRole(name1);
    const role2 = this.createRole(name2);

    role1.deleteSessions(role2.name);
    return;
  }

  // HasLink determines whether role: name1 inherits role: name2.
  // requestTime is the querying time for the role inheritance link.
  public async hasLink(name1: string, name2: string, ...requestTime: string[]): Promise<boolean> {
    if (requestTime.length != 1) {
      // return false, errors.New("error: requestTime should be 1 parameter")
      return false;
    }

    if (name1 == name2) {
      // return true, nil
      return true;
    }

    if (!this.hasRole(name1) || !this.hasRole(name2)) {
      // return false, nil
      return false;
    }

    const role1 = this.createRole(name1);
    // return role1.hasValidSession(name2, rm.maxHierarchyLevel, requestTime[0]), nil
    return role1.hasValidSession(name2, this.maxHierarchyLevel, requestTime[0]);
  }

  // GetRoles gets the roles that a subject inherits.
  // currentTime is the querying time for the role inheritance link.
  public async getRoles(name: string, ...currentTime: string[]): Promise<string[]> {
    if (currentTime.length != 1) {
      // return nil, errors.New("error: currentTime should be 1 parameter")
      return null;
    }
    const requestTime = currentTime[0];

    if (!this.hasRole(name)) {
      // return nil, errors.New("error: name does not exist")
      return null;
    }

    const sessionRoles = this.createRole(name).getSessionRoles(requestTime);
    return sessionRoles;
  }

  // GetUsers gets the users that inherits a subject.
  // currentTime is the querying time for the role inheritance link.
  public async getUsers(name: string, ...currentTime: string[]): Promise<string[]> {
    if (currentTime.length != 1) {
      // return nil, errors.New("error: currentTime should be 1 parameter")
      return null;
    }
    const requestTime = currentTime[0];

    const users: string[] = [];
    for (const item of Array.from(this.allRoles.values())) {
      if (item.hasDirectRole(name, requestTime)) {
        users.push(item.name);
      }
    }
    users.sort();
    return users;
  }

  // PrintRoles prints all the roles to log.
  public printRoles(): Promise<void> {
    for (const item of Array.from(this.allRoles.values())) {
      logPrint(item.toString());
    }
    return;
  }
}
