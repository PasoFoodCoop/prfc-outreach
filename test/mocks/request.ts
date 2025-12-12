import { NextRequest } from "next/server";

export function createMockRequest(cookies?: Record<string, string>): NextRequest {
  return {
    cookies: {
      get: jest.fn((name: string) => {
        const value = cookies?.[name];
        return value ? { name, value } : undefined;
      }),
    },
  } as unknown as NextRequest;
}
