export function verifyAdminPassword(request: Request): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;

  const headerPassword = request.headers.get("x-admin-password");
  return headerPassword === adminPassword;
}

export function unauthorizedResponse() {
  return Response.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
}
