import http from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USERS_FILE = path.join(__dirname, "data", "users.json");
const PORT = Number(process.env.PORT) || 8787;
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const TOKEN_SECRET = process.env.AUTH_SECRET || "limras-local-auth-secret";

function json(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  });
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

async function readUsers() {
  try {
    const raw = await fs.readFile(USERS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

async function writeUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, saltedHash) {
  const [salt, hash] = String(saltedHash).split(":");
  if (!salt || !hash) return false;
  const next = crypto.pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(next, "hex"));
}

function signToken(payload) {
  const fullPayload = { ...payload, exp: Date.now() + TOKEN_TTL_MS };
  const data = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const sig = crypto.createHmac("sha256", TOKEN_SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

function verifyToken(token) {
  if (!token) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = crypto.createHmac("sha256", TOKEN_SECRET).update(data).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (!payload?.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function getTokenFromRequest(req) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");
  return type === "Bearer" ? token : null;
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return json(res, 204, {});

  try {
    if (req.url === "/api/health" && req.method === "GET") {
      return json(res, 200, { ok: true, service: "limras-auth" });
    }

    if (req.url === "/api/auth/register" && req.method === "POST") {
      const { name = "", email = "", password = "" } = await parseBody(req);
      const cleanName = name.trim();
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanName || !cleanEmail || password.length < 6) {
        return json(res, 400, {
          error: "Name, email, and password (min 6 chars) are required.",
        });
      }

      const users = await readUsers();
      if (users.some((u) => u.email === cleanEmail)) {
        return json(res, 409, { error: "Email already registered." });
      }

      const id = crypto.randomUUID();
      const user = {
        id,
        name: cleanName,
        email: cleanEmail,
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString(),
      };
      users.push(user);
      await writeUsers(users);

      const token = signToken({ id: user.id, email: user.email, name: user.name });
      return json(res, 201, {
        token,
        user: { id: user.id, name: user.name, email: user.email },
      });
    }

    if (req.url === "/api/auth/login" && req.method === "POST") {
      const { email = "", password = "" } = await parseBody(req);
      const cleanEmail = email.trim().toLowerCase();
      const users = await readUsers();
      const user = users.find((u) => u.email === cleanEmail);
      if (!user || !verifyPassword(password, user.passwordHash)) {
        return json(res, 401, { error: "Invalid email or password." });
      }

      const token = signToken({ id: user.id, email: user.email, name: user.name });
      return json(res, 200, {
        token,
        user: { id: user.id, name: user.name, email: user.email },
      });
    }

    if (req.url === "/api/auth/me" && req.method === "GET") {
      const token = getTokenFromRequest(req);
      const payload = verifyToken(token);
      if (!payload) return json(res, 401, { error: "Unauthorized." });
      return json(res, 200, { user: { id: payload.id, name: payload.name, email: payload.email } });
    }

    return json(res, 404, { error: "Not found." });
  } catch (err) {
    return json(res, 500, { error: err.message || "Server error." });
  }
});

server.listen(PORT, () => {
  console.log(`Limras backend running on http://localhost:${PORT}`);
});
