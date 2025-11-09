import fs from 'fs';
import parse from 'csv-parse/lib/sync';
export function csvToUsersSql(csvPath) {
  const raw = fs.readFileSync(csvPath);
  const rows = parse(raw, { columns: true, skip_empty_lines: true });
  const stmts = rows.map(r => {
    const username = (r.username || '').replace(/'/g, "''");
    const password = (r.password || '').replace(/'/g, "''");
    const full_name = (r.full_name || '').replace(/'/g, "''");
    const role = (r.role || 'student');
    return `INSERT INTO users (username, password_hash, full_name, role) VALUES ('${username}','${password}','${full_name}','${role}');`;
  });
  return stmts.join('\n');
}
