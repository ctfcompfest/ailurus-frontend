import { ExtendOnServerMode, ServerMode, guardServerMode } from "./common";

export type Team<TServerMode extends ServerMode> = ExtendOnServerMode<
  {
    id: number;
    name: string;
  },
  TServerMode,
  "private",
  {
    server: {
      id: number;
      host: string;
    };
  }
>;
