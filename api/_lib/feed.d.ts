export declare function feedHandler(
  req: { url?: string },
  res: {
    statusCode: number;
    setHeader(name: string, value: string): void;
    end(body: string): void;
  },
): Promise<void>;
