/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
export interface ClientPaths {
  "/klines": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["klines"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}

export interface operations {
  klines: {
    parameters: {
      query?: {
        symbol: string;
        interval: string;
        startTime?: number;
        endTime?: number;
        limit?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["KlinesRequest"];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["Error"];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["Error"];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["Error"];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["Error"];
        };
      };
      /** @description Internal Server Error */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["Error"];
        };
      };
    };
  };
}

export interface components {
  schemas: {
    Error: {
      data?: (Record<string, never> | Record<string, never>[]) | null;
      error: {
        status?: number;
        name?: string;
        message?: string;
        details?: Record<string, never>;
      };
    };
    KlinesRequest: [
      number,
      string,
      string,
      string,
      string,
      string,
      number,
      string,
      number,
      string,
      string,
      string,
    ][];
  };
}
