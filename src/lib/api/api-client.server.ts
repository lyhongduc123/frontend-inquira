import { API_BASE_URL } from "@/core";
import { NextRequest, NextResponse } from "next/server";

export async function handleProxy(
  request: NextRequest,
  path: string,
  options?: {
    query?: URLSearchParams;
    body?: Body;
    method?: string;
  },
) {
  try {
    const cookies = request.headers.get("cookie");
    const authHeader = request.headers.get("authorization");
    const contentType = request.headers.get("content-type");

    const headers: HeadersInit = {
      ...(cookies && { Cookie: cookies }),
      ...(authHeader && { Authorization: authHeader }),
      ...(contentType && { "Content-Type": contentType }),
    };

    const method = options?.method || request.method;

    const body =
      options?.body ??
      (method !== "GET" && method !== "HEAD"
        ? await request.text()
        : undefined);

    const query = options?.query ?? request.nextUrl.searchParams;

    const url = `${API_BASE_URL}${path}?${query}`;

    const res = await fetch(url, {
      method,
      headers,
      body: body && typeof body !== "string" ? JSON.stringify(body) : body,
      credentials: "include",
    });

    let data: unknown = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[PROXY ERROR]", path, err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
