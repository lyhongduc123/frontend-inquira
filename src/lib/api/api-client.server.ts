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

    const queryString = query.toString();
    const url = `${API_BASE_URL}${path}${queryString ? `?${queryString}` : ""}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    let res: Response;
    try {
      res = await fetch(url, {
        method,
        headers,
        body: body && typeof body !== "string" ? JSON.stringify(body) : body,
        cache: "no-store",
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (res.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    let data: unknown = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      console.error("[PROXY TIMEOUT]", path, err);
      return NextResponse.json(
        { error: "Request timed out while proxying to the backend" },
        { status: 504 },
      );
    }

    console.error("[PROXY ERROR]", path, err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
