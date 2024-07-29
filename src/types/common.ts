export type ServerMode = "share" | "private";

export interface ComponentWithChildren {
  children: React.ReactNode;
  className?: string;
}

export type BaseResponse<T, TExtra = {}> = {
  data: T;
  status: "success" | "error" | "failed";
  message: string | undefined;
} & TExtra;

export type ConfigType = Record<string, string>;

export type ExtendOnServerMode<
  TBase,
  TServerMode extends ServerMode,
  On extends ServerMode,
  TExtension extends {}
> = TBase & (TServerMode extends On ? TExtension : {});

export function guardServerMode<TFinal>(
  data: unknown,
  value: ServerMode,
  expected: ServerMode
): data is TFinal {
  return value == expected;
}
