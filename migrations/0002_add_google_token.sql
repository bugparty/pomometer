-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_operations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "operation_type" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "operations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_operations" ("created_at", "id", "operation_type", "payload", "processed", "timestamp", "user_id") SELECT coalesce("created_at", CURRENT_TIMESTAMP) AS "created_at", "id", "operation_type", "payload", coalesce("processed", true) AS "processed", "timestamp", "user_id" FROM "operations";
DROP TABLE "operations";
ALTER TABLE "new_operations" RENAME TO "operations";
CREATE TABLE "new_sub_todos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "todo_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "focus" BOOLEAN NOT NULL DEFAULT false,
    "created_date" DATETIME NOT NULL,
    "updated_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "start_time" DATETIME,
    "end_time" DATETIME,
    "description" TEXT,
    CONSTRAINT "sub_todos_todo_id_fkey" FOREIGN KEY ("todo_id") REFERENCES "todos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_sub_todos" ("completed", "created_date", "deleted", "description", "end_time", "focus", "id", "start_time", "text", "todo_id", "updated_date") SELECT coalesce("completed", false) AS "completed", "created_date", coalesce("deleted", false) AS "deleted", "description", "end_time", coalesce("focus", false) AS "focus", "id", "start_time", "text", "todo_id", coalesce("updated_date", CURRENT_TIMESTAMP) AS "updated_date" FROM "sub_todos";
DROP TABLE "sub_todos";
ALTER TABLE "new_sub_todos" RENAME TO "sub_todos";
CREATE TABLE "new_todos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "focus" BOOLEAN NOT NULL DEFAULT false,
    "created_date" DATETIME NOT NULL,
    "updated_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "todos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_todos" ("completed", "created_date", "deleted", "focus", "id", "text", "updated_date", "user_id") SELECT coalesce("completed", false) AS "completed", "created_date", coalesce("deleted", false) AS "deleted", coalesce("focus", false) AS "focus", "id", "text", coalesce("updated_date", CURRENT_TIMESTAMP) AS "updated_date", "user_id" FROM "todos";
DROP TABLE "todos";
ALTER TABLE "new_todos" RENAME TO "todos";
CREATE TABLE "new_user_settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "pomodoro_duration" INTEGER NOT NULL DEFAULT 1500,
    "short_break_duration" INTEGER NOT NULL DEFAULT 300,
    "long_break_duration" INTEGER NOT NULL DEFAULT 1500,
    "ticking_sound_enabled" BOOLEAN NOT NULL DEFAULT true,
    "rest_ticking_sound_enabled" BOOLEAN NOT NULL DEFAULT false,
    "language" TEXT NOT NULL DEFAULT 'en-US',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_user_settings" ("created_at", "id", "language", "long_break_duration", "pomodoro_duration", "rest_ticking_sound_enabled", "short_break_duration", "ticking_sound_enabled", "updated_at", "user_id") SELECT coalesce("created_at", CURRENT_TIMESTAMP) AS "created_at", "id", coalesce("language", 'en-US') AS "language", coalesce("long_break_duration", 1500) AS "long_break_duration", coalesce("pomodoro_duration", 1500) AS "pomodoro_duration", coalesce("rest_ticking_sound_enabled", false) AS "rest_ticking_sound_enabled", coalesce("short_break_duration", 300) AS "short_break_duration", coalesce("ticking_sound_enabled", true) AS "ticking_sound_enabled", coalesce("updated_at", CURRENT_TIMESTAMP) AS "updated_at", "user_id" FROM "user_settings";
DROP TABLE "user_settings";
ALTER TABLE "new_user_settings" RENAME TO "user_settings";
CREATE UNIQUE INDEX "user_settings_user_id_key" ON "user_settings"("user_id");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "picture" TEXT,
    "google_access_token" TEXT,
    "google_refresh_token" TEXT,
    "google_token_expiry" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_users" ("created_at", "email", "id", "name", "picture", "updated_at") SELECT coalesce("created_at", CURRENT_TIMESTAMP) AS "created_at", "email", "id", "name", "picture", coalesce("updated_at", CURRENT_TIMESTAMP) AS "updated_at" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
