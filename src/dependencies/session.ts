import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';

 
export const asessionStore = new session.MemoryStore();

const sessionStore = connectPgSimple(asessionStore)

