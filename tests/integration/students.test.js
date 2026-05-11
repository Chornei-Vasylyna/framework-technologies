import fs from "node:fs/promises";
import path from "node:path";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { UPLOADS_DIR } from "#constants/paths.js";
import { buildMultipartPayload } from "../helpers/multipart.js";
import {
  buildTestApp,
  closeTestApp,
  extractCookie,
  initializeTestDatabase,
  resetDatabase,
  resetRedis,
} from "../helpers/testApp.js";

vi.mock("#utils/studentDetails.js", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getCoursesReferenceData: vi
      .fn()
      .mockResolvedValue([{ id: 1, name: "Course 1", credits: 5 }]),
  };
});

import { buildApp } from "../../app.js";

describe("student endpoints", () => {
  let app;

  const login = async () => {
    await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({
        email: "student@example.com",
        password: "secret123",
      }),
    });

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({
        email: "student@example.com",
        password: "secret123",
      }),
    });

    return extractCookie(res);
  };

  beforeAll(async () => {
    app = await buildTestApp(buildApp);
    await initializeTestDatabase(app);
  });

  beforeEach(async () => {
    await resetDatabase(app);
    await resetRedis(app);
    await fs.rm(UPLOADS_DIR, { recursive: true, force: true });
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  it("lists students", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/students" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([]);
  });

  it("rejects protected write without session", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/students",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({ name: "A", grades: [5], course: 1 }),
    });

    expect(res.statusCode).toBe(401);
  });

  it("creates, updates, and deletes student", async () => {
    const cookie = await login();

    const createRes = await app.inject({
      method: "POST",
      url: "/api/v1/students",
      headers: { "content-type": "application/json", cookie },
      payload: JSON.stringify({
        name: "Student A",
        grades: [4, 5],
        course: 2,
        email: "a@example.com",
      }),
    });

    expect(createRes.statusCode).toBe(201);
    const created = createRes.json().student;

    const updateRes = await app.inject({
      method: "PATCH",
      url: `/api/v1/students/${created.id}`,
      headers: { "content-type": "application/json", cookie },
      payload: JSON.stringify({ name: "Student B" }),
    });

    expect(updateRes.statusCode).toBe(200);

    const deleteRes = await app.inject({
      method: "DELETE",
      url: `/api/v1/students/${created.id}`,
      headers: { cookie },
    });

    expect(deleteRes.statusCode).toBe(200);
  });

  it("filters by course", async () => {
    const cookie = await login();

    await app.inject({
      method: "POST",
      url: "/api/v1/students",
      headers: { "content-type": "application/json", cookie },
      payload: JSON.stringify({
        name: "Student A",
        grades: [3, 4],
        course: 1,
      }),
    });

    const res = await app.inject({
      method: "GET",
      url: "/api/v1/students?course=1",
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().length).toBe(1);
  });

  it("returns student details with course info", async () => {
    const cookie = await login();

    const createRes = await app.inject({
      method: "POST",
      url: "/api/v1/students",
      headers: { "content-type": "application/json", cookie },
      payload: JSON.stringify({
        name: "Student A",
        grades: [4, 5],
        course: 1,
      }),
    });

    const id = createRes.json().student.id;

    const res = await app.inject({
      method: "GET",
      url: `/api/v1/students/${id}/details`,
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().courseDetails).toEqual({
      id: 1,
      name: "Course 1",
      credits: 5,
    });
  });

  it("exports students as CSV", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/students/export",
    });
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("text/csv");
  });

  it("streams students as NDJSON", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/students/stream",
    });
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("application/x-ndjson");
  });

  it("imports students from CSV", async () => {
    const cookie = await login();

    const { boundary, payload } = buildMultipartPayload({
      files: [
        {
          fieldName: "file",
          filename: "students.csv",
          contentType: "text/csv",
          content:
            'name,email,course,grades\nJohn,john@example.com,1,"[1,2,3]"\n',
        },
      ],
    });

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/students/import",
      headers: {
        "content-type": `multipart/form-data; boundary=${boundary}`,
        cookie,
      },
      payload,
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().imported.length).toBe(1);
  });

  it("rejects import without file", async () => {
    const cookie = await login();

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/students/import",
      headers: { cookie },
    });

    expect(res.statusCode).toBe(400);
  });

  it("uploads student image", async () => {
    const cookie = await login();

    const createRes = await app.inject({
      method: "POST",
      url: "/api/v1/students",
      headers: { "content-type": "application/json", cookie },
      payload: JSON.stringify({
        name: "Student A",
        grades: [4, 5],
        course: 1,
      }),
    });

    const id = createRes.json().student.id;

    const pngHeader = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
    const { boundary, payload } = buildMultipartPayload({
      files: [
        {
          fieldName: "file",
          filename: "image.png",
          contentType: "image/png",
          content: Buffer.concat([pngHeader, Buffer.from("test")]),
        },
      ],
    });

    const res = await app.inject({
      method: "POST",
      url: `/api/v1/students/${id}/image`,
      headers: {
        "content-type": `multipart/form-data; boundary=${boundary}`,
        cookie,
      },
      payload,
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().student.image).toContain("/uploads/");
    const uploadPath = path.join(UPLOADS_DIR, String(id), "image.png");
    const exists = await fs
      .stat(uploadPath)
      .then(() => true)
      .catch(() => false);
    expect(exists).toBe(true);
  });

  it("returns paginated list for v2", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v2/students" });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty("data");
    expect(body).toHaveProperty("total");
  });
});
