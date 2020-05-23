import { Session } from './session';

// SessionRole is a modified version of the default role.
// A SessionRole not only has a name, but also a list of sessions.
export class SessionRole {
  public name: string;
  private sessions: Session[];

  constructor(name: string) {
    this.name = name;
    this.sessions = new Array<Session>(0);
  }

  public addSession(s: Session): void {
    this.sessions.push(s);
  }

  public deleteSessions(sessionName: string): void {
    this.sessions = this.sessions.filter((n) => n.role.name !== sessionName);
  }

  public getSessionRoles(requestTime: string): string[] {
    const names: string[] = [];
    for (const session of this.sessions) {
      if (session.startTime <= requestTime && requestTime <= session.endTime) {
        if (!names.includes(session.role.name)) {
          names.push(session.role.name);
        }
      }
    }
    return names;
  }

  public hasValidSession(name: string, hierarchyLevel: number, requestTime: string): boolean {
    if (hierarchyLevel == 1) {
      return this.name == name;
    }
    for (const s of this.sessions) {
      if (s.startTime <= requestTime && requestTime <= s.endTime) {
        if (s.role.name == name) {
          return true;
        }
        if (s.role.hasValidSession(name, hierarchyLevel - 1, requestTime)) {
          return true;
        }
      }
    }
    return false;
  }

  public hasDirectRole(name: string, requestTime: string): boolean {
    for (const session of this.sessions) {
      if (session.role.name == name) {
        if (session.startTime <= requestTime && requestTime <= session.endTime) {
          return true;
        }
      }
    }
    return false;
  }

  public toString(): string {
    let sessions = '';
    let i = 0;
    for (const session of this.sessions) {
      if (i == 0) {
        sessions += session.role.name;
      } else {
        sessions += ', ' + session.role.name;
      }
      sessions += ' (until: ' + session.endTime + ')';
      i++;
    }
    return this.name + ' < ' + sessions;
  }
}
