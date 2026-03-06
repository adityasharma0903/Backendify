-- ============================================
-- Backendify Auto-Generated SQL Schema
-- Database: MYSQL
-- Generated: 2026-03-06T16:45:43.867Z
-- ============================================

-- Drop existing tables (commented for safety)
-- DROP TABLE IF EXISTS todos;

-- Table: todos
CREATE TABLE todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    completed VARCHAR(255),
    priority VARCHAR(255),
    dueDate VARCHAR(255),
    isActive BOOLEAN DEFAULT TRUE,
    isDeleted BOOLEAN DEFAULT FALSE,
    version INT DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_todos_isDeleted ON todos(isDeleted);

-- ============================================
-- Schema created successfully!
-- ============================================
