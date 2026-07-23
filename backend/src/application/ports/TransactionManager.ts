export interface TransactionManager<Tx = any> {
  run: <T>(operation: (tx: Tx) => Promise<T>) => Promise<T>
}
