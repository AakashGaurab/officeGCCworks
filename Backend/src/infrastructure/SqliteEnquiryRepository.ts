import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { IN_MEMORY_DATABASE_PATH } from '../config/constants.js';
import { EnquiryStatus, type Enquiry, type NewEnquiry } from '../domain/Enquiry.js';
import type { EnquiryRepository } from '../domain/EnquiryRepository.js';

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

const INSERT = `
  INSERT INTO enquiries (id, product_id, product_title, name, email, phone, message, status, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

const MARK_SENT = 'UPDATE enquiries SET status = ?, sent_at = ?, error_message = NULL WHERE id = ?';
const MARK_FAILED = 'UPDATE enquiries SET status = ?, error_message = ? WHERE id = ?';
const SELECT_UNSENT = 'SELECT * FROM enquiries WHERE status IN (?, ?) ORDER BY created_at ASC';

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

  async close(): Promise<void> {
    this.database.close();
  }
}
