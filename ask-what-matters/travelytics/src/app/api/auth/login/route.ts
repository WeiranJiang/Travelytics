import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import usersJson from "@/lib/users.json";

interface UserRecord {
  username: string;
  password: string;
  full_name: string;
  initial: string;
  city: string;
  role: "admin" | "user";
}

const USERS = usersJson as UserRecord[];

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const user = USERS.find(
    (u) => u.username.toLowerCase() === String(username).trim().toLowerCase()
  );

  if (!user || user.password !== password) {
    return NextResponse.json({ ok: false, error: "Invalid username or password." }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _pw, ...publicUser } = user;

  const res = NextResponse.json({ ok: true, user: publicUser });
  res.cookies.set("awm_session", JSON.stringify(publicUser), {
    httpOnly: false, // readable by client JS so Header can show user name
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
    sameSite: "lax",
  });
  return res;
}
