export interface ProvisionMachine {
    id: number;
    name: string;
    host: string;
    port: number;
    detail: Map<string, any>;
}
  