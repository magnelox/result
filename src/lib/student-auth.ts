import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const STUDENT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'ssu_student_session_secret_key_2026'
);
const STUDENT_COOKIE_NAME = 'ssu_student_session';

export interface StudentJwtPayload {
  studentId: string;
  regNumber: string;
  name: string;
  programmeId: string;
  programmeName: string;
}

export async function createStudentToken(payload: StudentJwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('4h')
    .sign(STUDENT_SECRET);
}

export async function verifyStudentToken(token: string): Promise<StudentJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, STUDENT_SECRET);
    return payload as unknown as StudentJwtPayload;
  } catch (error) {
    return null;
  }
}

export async function getStudentSession(): Promise<StudentJwtPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(STUDENT_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyStudentToken(token);
}

export async function setStudentSessionCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(STUDENT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 4 * 60 * 60, // 4 hours
  });
}

export async function clearStudentSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete(STUDENT_COOKIE_NAME);
}
