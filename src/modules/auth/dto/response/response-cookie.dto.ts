export class ResponseCookieDto {
  name: string;
  value: string | null;
  maxAge: number;
  domain: string | null;
  path: string | null;
  secure: boolean;
  httpOnly: boolean;
  partitioned: boolean;
  sameSite: string | null;
}
