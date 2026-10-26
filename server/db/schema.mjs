/** Drizzle's schema is the canonical typed query surface for Chawki demo SQLite. */
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'

export const cars = sqliteTable('cars', {
  id: text('id').primaryKey(), document: text('document').notNull(),
})
export const bookings = sqliteTable('bookings', {
  id: text('id').primaryKey(), carId: text('car_id').notNull(),
  startDate: text('start_date').notNull(), endDate: text('end_date').notNull(),
  status: text('status').notNull(), document: text('document').notNull(),
}, table => [index('bookings_car_dates_idx').on(table.carId,table.startDate,table.endDate)])
export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(), document: text('document').notNull(),
})
export const users = sqliteTable('users', {
  id: text('id').primaryKey(), username: text('username').notNull().unique(),
  role: text('role').notNull(), active: integer('active').notNull(), document: text('document').notNull(),
})
export const blocks = sqliteTable('blocks', {
  id: text('id').primaryKey(), carId: text('car_id').notNull(),
  startDate: text('start_date').notNull(), endDate: text('end_date').notNull(), document: text('document').notNull(),
}, table => [index('blocks_car_dates_idx').on(table.carId,table.startDate,table.endDate)])
export const activity = sqliteTable('activity', {
  id: text('id').primaryKey(), document: text('document').notNull(),
})
export const misc = sqliteTable('misc', {
  name: text('name').primaryKey(), document: text('document').notNull(),
})
export const sessions = sqliteTable('sessions', {
  tokenHash: text('token_hash').primaryKey(), userId: text('user_id').notNull(), expires: integer('expires').notNull(),
}, table => [index('sessions_expires_idx').on(table.expires)])
