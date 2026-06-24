export abstract class Entity<T> {
  protected readonly _id: string;
  public readonly tenantId: string;
  public readonly props: T;

  constructor(props: T, tenantId: string, id?: string) {
    this._id = id ? id : crypto.randomUUID();
    this.tenantId = tenantId;
    this.props = props;
  }

  get id(): string {
    return this._id;
  }
}
