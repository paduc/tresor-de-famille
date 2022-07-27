import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';

 
export const sessionStore = new session.MemoryStore();

export const pgSession = connectPgSimple(session)
