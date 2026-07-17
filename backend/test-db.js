import { adminPool } from './src/infrastructure/database/postgre/db.js';

async function test() {
  try {
    const res = await adminPool.query('SELECT * FROM terms');
    console.log(res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    await adminPool.end();
  }
}
test();
