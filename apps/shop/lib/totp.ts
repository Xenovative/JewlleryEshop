import { TOTP, Secret } from "otpauth";

export function buildTotp(
  secretBase32: string,
  opts: { label?: string; account?: string } = {}
) {
  const label = opts.label ?? (opts.account ? `Back Office (${opts.account})` : "Back Office");
  return new TOTP({
    issuer: "Lumière",
    label,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secretBase32),
  });
}

export function generateSecretBase32(): string {
  // 20 bytes = 160 bits, RFC-recommended TOTP secret length
  return new Secret({ size: 20 }).base32;
}

export function verifyTotp(secretBase32: string, code: string): boolean {
  const totp = buildTotp(secretBase32);
  // Allow ±1 step (30s) clock skew
  const delta = totp.validate({ token: code.trim(), window: 1 });
  return delta !== null;
}
