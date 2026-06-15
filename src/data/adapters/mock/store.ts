import type { Aluno, Avaliacao, Turma, Usuario } from "@/domain/types";
import { generateData } from "@/data/seed/generate";

export interface MockDb {
  turmas: Turma[];
  alunos: Aluno[];
  avaliacoes: Avaliacao[];
  user: Usuario | null;
}

const DB_KEY = "fm:db";
const USER_KEY = "fm:user";

function load(): MockDb {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(DB_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Omit<MockDb, "user">;
        return { ...parsed, user: loadUser() };
      }
    } catch {
      /* fall through to fresh seed */
    }
  }
  const seed = generateData();
  const dbData: MockDb = { ...seed, user: loadUser() };
  return dbData;
}

function loadUser(): Usuario | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as Usuario) : null;
  } catch {
    return null;
  }
}

let db: MockDb = load();
persist(db);

export function persist(next: MockDb = db): void {
  db = next;
  if (typeof window === "undefined") return;
  const { turmas, alunos, avaliacoes } = next;
  window.localStorage.setItem(
    DB_KEY,
    JSON.stringify({ turmas, alunos, avaliacoes }),
  );
}

export function persistUser(user: Usuario | null): void {
  db.user = user;
  if (typeof window === "undefined") return;
  if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  else window.localStorage.removeItem(USER_KEY);
}

export function getDb(): MockDb {
  return db;
}

/** Reset to a fresh seeded dataset (handy for demos). */
export function resetDb(): void {
  const seed = generateData();
  db = { ...seed, user: db.user };
  persist(db);
}

/** Simulated network latency so loading states are visible. */
export function delay<T>(value: T, ms = 320): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
