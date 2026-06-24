export interface Command {
  tenantId: string;
}

export interface CommandHandler<C extends Command, R = void> {
  execute(command: C): Promise<R>;
}
