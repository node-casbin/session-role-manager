import { RoleManager, logPrint } from 'casbin';
import { SessionRole } from './sessionRole';
import { Session } from './session';

class SessionRoleManager implements RoleManager {
  private allRoles: Map<String, SessionRole>;
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
      this.allRoles[name] = new SessionRole(name);
    }
    return this.allRoles[name];
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
    let startTime = timeRange[0];
    let endTime = timeRange[1];

    let role1 = this.createRole(name1);
    let role2 = this.createRole(name2);

    let session = new Session(role2, startTime, endTime);
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

    let role1 = this.createRole(name1);
    let role2 = this.createRole(name2);

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

    let role1 = this.createRole(name1);
    // return role1.hasValidSession(name2, rm.maxHierarchyLevel, requestTime[0]), nil
    return role1.hasValidSession(name2, this.maxHierarchyLevel, requestTime[0]);
  }

  // GetRoles gets the roles that a subject inherits.
  // currentTime is the querying time for the role inheritance link.
  public async getRoles(name: string, ...currentTime: string[]): Promise<string[]> {
    if (currentTime.length != 1) {
      // return nil, errors.New("error: currentTime should be 1 parameter")
      return;
    }
    let requestTime = currentTime[0];

    if (!this.hasRole(name)) {
      // return nil, errors.New("error: name does not exist")
      return;
    }

    let sessionRoles = this.createRole(name).getSessionRoles(requestTime);
    return sessionRoles;
  }

  // GetUsers gets the users that inherits a subject.
  // currentTime is the querying time for the role inheritance link.
  public async getUsers(name: string, ...currentTime: string[]): Promise<string[]> {
    if (currentTime.length != 1) {
      // return nil, errors.New("error: currentTime should be 1 parameter")
      return;
    }
    let requestTime = currentTime[0];

    let users: string[] = [];
    for (let item of this.allRoles) {
      if (item[1].hasDirectRole(name, requestTime)) {
        users.push(item[1].name);
      }
    }
    users.sort();
    return users;
  }

  // PrintRoles prints all the roles to log.
  public printRoles(): Promise<void> {
    for (let item of this.allRoles) {
      logPrint(item[1].toString());
    }
    return;
  }
}

// NewRoleManager is the constructor for creating an instance of the
// SessionRoleManager implementation.
// function NewRoleManager(maxHierarchyLevel: number): RoleManager {
// 	rm := RoleManager{}
// 	rm.allRoles = make(map[string]*SessionRole)
// 	rm.maxHierarchyLevel = maxHierarchyLevel
// 	return &rm
// }

// func (rm *RoleManager) hasRole(name: string): boolean {
// 	_, ok := rm.allRoles[name]
// 	return ok
// }

// func (rm *RoleManager) createRole(name string) *SessionRole {
// 	if !rm.hasRole(name) {
// 		rm.allRoles[name] = newSessionRole(name)
// 	}
// 	return rm.allRoles[name]
// }

// // Clear clears all stored data and resets the role manager to the initial state.
// func (rm *RoleManager) Clear() error {
// 	rm.allRoles = make(map[string]*SessionRole)
// 	return nil
// }

// // AddLink adds the inheritance link between role: name1 and role: name2.
// // aka role: name1 inherits role: name2.
// // timeRange is the time range when the role inheritance link is active.
// func (rm *RoleManager) AddLink(name1 string, name2 string, timeRange ...string) error {
// 	if len(timeRange) != 2 {
// 		return errors.New("error: timeRange should be 2 parameters")
// 	}
// 	startTime := timeRange[0]
// 	endTime := timeRange[1]

// 	role1 := rm.createRole(name1)
// 	role2 := rm.createRole(name2)

// 	session := Session{role2, startTime, endTime}
// 	role1.addSession(session)
// 	return nil
// }

// // DeleteLink deletes the inheritance link between role: name1 and role: name2.
// // aka role: name1 does not inherit role: name2 any more.
// // unused is not used.
// func (rm *RoleManager) DeleteLink(name1 string, name2 string, unused ...string) error {
// 	if !rm.hasRole(name1) || !rm.hasRole(name2) {
// 		return errors.New("error: name1 or name2 does not exist")
// 	}

// 	role1 := rm.createRole(name1)
// 	role2 := rm.createRole(name2)

// 	role1.deleteSessions(role2.name)
// 	return nil
// }

// // HasLink determines whether role: name1 inherits role: name2.
// // requestTime is the querying time for the role inheritance link.
// func (rm *RoleManager) HasLink(name1 string, name2 string, requestTime ...string) (bool, error) {
// 	if len(requestTime) != 1 {
// 		return false, errors.New("error: requestTime should be 1 parameter")
// 	}

// 	if name1 == name2 {
// 		return true, nil
// 	}

// 	if !rm.hasRole(name1) || !rm.hasRole(name2) {
// 		return false, nil
// 	}

// 	role1 := rm.createRole(name1)
// 	return role1.hasValidSession(name2, rm.maxHierarchyLevel, requestTime[0]), nil
// }

// // GetRoles gets the roles that a subject inherits.
// // currentTime is the querying time for the role inheritance link.
// func (rm *RoleManager) GetRoles(name string, currentTime ...string) ([]string, error) {
// 	if len(currentTime) != 1 {
// 		return nil, errors.New("error: currentTime should be 1 parameter")
// 	}
// 	requestTime := currentTime[0]

// 	if !rm.hasRole(name) {
// 		return nil, errors.New("error: name does not exist")
// 	}

// 	sessionRoles := rm.createRole(name).getSessionRoles(requestTime)
// 	return sessionRoles, nil
// }

// // GetUsers gets the users that inherits a subject.
// // currentTime is the querying time for the role inheritance link.
// func (rm *RoleManager) GetUsers(name string, currentTime ...string) ([]string, error) {
// 	if len(currentTime) != 1 {
// 		return nil, errors.New("error: currentTime should be 1 parameter")
// 	}
// 	requestTime := currentTime[0]

// 	users := []string{}
// 	for _, role := range rm.allRoles {
// 		if role.hasDirectRole(name, requestTime) {
// 			users = append(users, role.name)
// 		}
// 	}
// 	sort.Strings(users)
// 	return users, nil
// }

// // PrintRoles prints all the roles to log.
// func (rm *RoleManager) PrintRoles() error {
// 	for _, role := range rm.allRoles {
// 		util.LogPrint(role.toString())
// 	}
// 	return nil
// }

// SessionRole is a modified version of the default role.
// A SessionRole not only has a name, but also a list of sessions.
// type SessionRole struct {
// 	name     string
// 	sessions []Session
// }

// func newSessionRole(name string) *SessionRole {
// 	sr := SessionRole{name: name}
// 	return &sr
// }

// func (sr *SessionRole) addSession(s Session) {
// 	sr.sessions = append(sr.sessions, s)
// }

// func (sr *SessionRole) deleteSessions(sessionName string) {
// 	// Delete sessions from an array while iterating it
// 	index := 0
// 	for _, srs := range sr.sessions {
// 		if srs.role.name != sessionName {
// 			sr.sessions[index] = srs
// 			index++
// 		}
// 	}
// 	sr.sessions = sr.sessions[:index]
// }

// //
// //func (sr *SessionRole) getSessions() []Session {
// //	return sr.sessions
// //}

// func (sr *SessionRole) getSessionRoles(requestTime string) []string {
// 	names := []string{}
// 	for _, session := range sr.sessions {
// 		if session.startTime <= requestTime && requestTime <= session.endTime {
// 			if !contains(names, session.role.name) {
// 				names = append(names, session.role.name)
// 			}
// 		}
// 	}
// 	return names
// }

// func (sr *SessionRole) hasValidSession(name string, hierarchyLevel int, requestTime string) bool {
// 	if hierarchyLevel == 1 {
// 		return sr.name == name
// 	}

// 	for _, s := range sr.sessions {
// 		if s.startTime <= requestTime && requestTime <= s.endTime {
// 			if s.role.name == name {
// 				return true
// 			}
// 			if s.role.hasValidSession(name, hierarchyLevel-1, requestTime) {
// 				return true
// 			}
// 		}
// 	}
// 	return false
// }

// func (sr *SessionRole) hasDirectRole(name string, requestTime string) bool {
// 	for _, session := range sr.sessions {
// 		if session.role.name == name {
// 			if session.startTime <= requestTime && requestTime <= session.endTime {
// 				return true
// 			}
// 		}
// 	}
// 	return false
// }

// func (sr *SessionRole) toString() string {
// 	sessions := ""
// 	for i, session := range sr.sessions {
// 		if i == 0 {
// 			sessions += session.role.name
// 		} else {
// 			sessions += ", " + session.role.name
// 		}
// 		sessions += " (until: " + session.endTime + ")"
// 	}
// 	return sr.name + " < " + sessions
// }

// Session represents the activation of a role inheritance for a
// specified time. A role inheritance is always bound to its temporal validity.
// As soon as a session loses its validity, the corresponding role inheritance
// becomes invalid too.
// type Session struct {
// 	role      *SessionRole
// 	startTime string
// 	endTime   string
// }
