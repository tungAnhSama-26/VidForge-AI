export interface Query {
  tenantId: string;
}

export interface QueryHandler<Q extends Query, R> {
  execute(query: Q): Promise<R>;
}
