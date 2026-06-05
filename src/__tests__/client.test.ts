import { describe, expect, it, vi } from "vitest";
import { ApiClient, ApiError } from "../api/client";
import type { ApiErrorBody, AskResponse, ShareResponse } from "../api/types";

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
    statusText: init.statusText,
  });
}

function makeClient(fetchImpl: typeof fetch) {
  return new ApiClient({ baseUrl: "http://test.local", fetch: fetchImpl });
}

describe("ApiClient.ask", () => {
  it("returns the parsed AskResponse on a 200", async () => {
    const payload: AskResponse = {
      question: "How much do I contribute?",
      answer: "Based on 1 article...",
      sources: [{ title: "KA-1", url: "https://example/ka-1", score: 0.91 }],
      top_source: { title: "KA-1", url: "https://example/ka-1", score: 0.91 },
    };
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(payload));
    const client = makeClient(fetchMock as unknown as typeof fetch);

    const result = await client.ask({ question: "How much do I contribute?" });

    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://test.local/ask");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({
      question: "How much do I contribute?",
    });
  });

  it("wraps empty_knowledge_base 409 in ApiError", async () => {
    const body: ApiErrorBody = {
      error: "empty_knowledge_base",
      message: "Knowledge base is empty. Run ingestion first.",
      details: {},
    };
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(body, { status: 409 }));
    const client = makeClient(fetchMock as unknown as typeof fetch);

    await expect(client.ask({ question: "x?" })).rejects.toMatchObject({
      name: "ApiError",
      status: 409,
      code: "empty_knowledge_base",
      message: body.message,
    });
  });

  it("wraps invalid_question 422 in ApiError", async () => {
    const body: ApiErrorBody = {
      error: "invalid_question",
      message: "Question must be at least 2 characters.",
      details: { length: 1 },
    };
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(body, { status: 422 }));
    const client = makeClient(fetchMock as unknown as typeof fetch);

    const error = await client.ask({ question: "x" }).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(422);
    expect(error.code).toBe("invalid_question");
    expect(error.details).toEqual({ length: 1 });
  });

  it("falls back to non_json_response when the body is not JSON", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("<html>oops</html>", {
        status: 502,
        statusText: "Bad Gateway",
      }),
    );
    const client = makeClient(fetchMock as unknown as typeof fetch);

    const error = await client.ask({ question: "anything?" }).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(502);
    expect(error.code).toBe("non_json_response");
  });
});

describe("ApiClient.ingest", () => {
  it("wraps ingestion_failed 502 in ApiError", async () => {
    const body: ApiErrorBody = {
      error: "ingestion_failed",
      message: "Ingestion produced no usable articles.",
      details: { requested_urls: 1 },
    };
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(body, { status: 502 }));
    const client = makeClient(fetchMock as unknown as typeof fetch);

    const error = await client.ingest({ urls: ["https://bad"] }).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe("ingestion_failed");
    expect(error.details).toEqual({ requested_urls: 1 });
  });
});

describe("ApiClient.share", () => {
  it("POSTs to /share and returns the parsed ShareResponse", async () => {
    const payload: ShareResponse = {
      recipient: "friend@example.com",
      article_url: "https://e/ka-1",
      delivered_via: "console",
    };
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(payload));
    const client = makeClient(fetchMock as unknown as typeof fetch);

    const result = await client.share({
      recipient: "friend@example.com",
      question: "What is annual allowance?",
      article_title: "Annual Allowance",
      article_url: "https://e/ka-1",
      note: "Have a read.",
    });

    expect(result).toEqual(payload);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://test.local/share");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string).recipient).toBe("friend@example.com");
  });

  it("wraps invalid_email 400 in ApiError", async () => {
    const body: ApiErrorBody = {
      error: "invalid_email",
      message: "Recipient email address is not valid.",
      details: { recipient: "nope" },
    };
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(body, { status: 400 }));
    const client = makeClient(fetchMock as unknown as typeof fetch);

    const error = await client
      .share({
        recipient: "nope",
        question: "x?",
        article_title: "t",
        article_url: "u",
      })
      .catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe("invalid_email");
  });
});

describe("ApiClient.health", () => {
  it("issues a GET and returns the parsed body", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ status: "ok", indexed_chunks: 43 }));
    const client = makeClient(fetchMock as unknown as typeof fetch);

    const result = await client.health();

    expect(result).toEqual({ status: "ok", indexed_chunks: 43 });
    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("GET");
    expect(init.body).toBeUndefined();
  });
});
