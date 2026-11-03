import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { IN_MEMORY_DATABASE_PATH } from '../config/constants.js';
import { EnquiryStatus, type Enquiry, type NewEnquiry } from '../domain/Enquiry.js';
import type { EnquiryPageQuery, EnquiryRepository, StatusCounts } from '../domain/EnquiryRepository.js';

const CREATE_TABLE = `
  CREATE TABLE IF NOT EXISTS enquiries (
    id TEXT PRIMARY KEY,
    product_id INTEGER NOT NULL,
    product_title TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    sent_at TEXT,
    error_message TEXT
  )`;

// Supports the admin list, newest first. It sorts by created_at on every page request.
const CREATE_CREATED_AT_INDEX =
  'CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries (created_at DESC, id DESC)';

const INSERT = `
  INSERT INTO enquiries (id, product_id, product_title, name, email, phone, message, status, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

const MARK_SENT = 'UPDATE enquiries SET status = ?, sent_at = ?, error_message = NULL WHERE id = ?';
const MARK_FAILED = 'UPDATE enquiries SET status = ?, error_message = ? WHERE id = ?';
const SELECT_UNSENT = 'SELECT * FROM enquiries WHERE status IN (?, ?) ORDER BY created_at ASC';
// id is the tie-break, so enquiries created in the same instant keep a stable order between pages.
// The status filter is a bound parameter: "? IS NULL" means no filter.
const SELECT_PAGE = `
  SELECT * FROM enquiries
  WHERE (? IS NULL OR status = ?)
  ORDER BY created_at DESC, id DESC
  LIMIT ? OFFSET ?`;
const COUNT_BY_STATUS = 'SELECT status, COUNT(*) AS total FROM enquiries GROUP BY status';

type EnquiryRow = {
  id: string;
  product_id: number;
  product_title: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  created_at: string;
  sent_at: string | null;
  error_message: string | null;
};

const toEnquiry = (row: EnquiryRow): Enquiry => ({
  id: row.id,
  productId: row.product_id,
  productTitle: row.product_title,
  name: row.name,
  email: row.email,
  phone: row.phone,
  message: row.message,
  status: row.status as EnquiryStatus,
  createdAt: row.created_at,
  sentAt: row.sent_at,
  errorMessage: row.error_message,
});

// Uses Node's built-in SQLite: no native build step. Statements are parameterised (no SQL injection).
// The node:sqlite API is synchronous; the async methods only match the port.
export class SqliteEnquiryRepository implements EnquiryRepository {
  private readonly database: DatabaseSync;

  constructor(databasePath: string) {
    if (databasePath !== IN_MEMORY_DATABASE_PATH) mkdirSync(dirname(databasePath), { recursive: true });
    this.database = new DatabaseSync(databasePath);
    this.database.exec(CREATE_TABLE);
    this.database.exec(CREATE_CREATED_AT_INDEX);
  }

  async save(enquiry: NewEnquiry): Promise<void> {
    this.database
      .prepare(INSERT)
      .run(
        enquiry.id,
        enquiry.productId,
        enquiry.productTitle,
        enquiry.name,
        enquiry.email,
        enquiry.phone,
        enquiry.message,
        EnquiryStatus.PENDING,
        enquiry.createdAt,
      );
  }

  async markSent(id: string, sentAt: string): Promise<void> {
    this.database.prepare(MARK_SENT).run(EnquiryStatus.SENT, sentAt, id);
  }

  async markFailed(id: string, errorMessage: string): Promise<void> {
    this.database.prepare(MARK_FAILED).run(EnquiryStatus.FAILED, errorMessage, id);
  }

  async findUnsent(): Promise<Enquiry[]> {
    const rows = this.database
      .prepare(SELECT_UNSENT)
      .all(EnquiryStatus.PENDING, EnquiryStatus.FAILED) as EnquiryRow[];
    return rows.map(toEnquiry);
  }

  async findPage({ status, limit, offset }: EnquiryPageQuery): Promise<Enquiry[]> {
    const filter = status ?? null;
    const rows = this.database.prepare(SELECT_PAGE).all(filter, filter, limit, offset) as EnquiryRow[];
    return rows.map(toEnquiry);
  }

  async countByStatus(): Promise<StatusCounts> {
    const counts: StatusCounts = { [EnquiryStatus.PENDING]: 0, [EnquiryStatus.SENT]: 0, [EnquiryStatus.FAILED]: 0 };
    const rows = this.database.prepare(COUNT_BY_STATUS).all() as { status: EnquiryStatus; total: number }[];
    rows.forEach((row) => {
      counts[row.status] = row.total;
    });
    return counts;
  }

  async close(): Promise<void> {
    this.database.close();
  }
}
