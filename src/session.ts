import { SessionRole } from './sessionRole';

// Session represents the activation of a role inheritance for a
// specified time. A role inheritance is always bound to its temporal validity.
// As soon as a session loses its validity, the corresponding role inheritance
// becomes invalid too.
export class Session {
  role: SessionRole;
  startTime: string;
  endTime: string;

  constructor(role: SessionRole, startTime: string, endTime: string) {
    this.role = role;
    this.startTime = startTime;
    this.endTime = endTime;
  }
}
