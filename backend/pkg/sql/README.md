# SQL Files Usage Guide

## Overview

This folder contains SQL files used to define database tables, indexes, triggers, and alterations for our project. The SQL files follow a naming convention where tables end with an underscore (_) to avoid conflicts with Postgres internal naming conventions. All necessary database objects are defined within these SQL files, ensuring that running all the `.sql` files will set up the database schema correctly for a new project.

## Folder Structure

The `sql` folder contains all the SQL files organized by their respective model packages. For example:

```
sql/
├── user.sql
├── community.sql
└── ...
```

## Usage

1. **Setup**: Ensure that Postgres is installed and running on your system.

2. **Database Initialization**: To initialize the database schema for a new project, follow these steps:

    - Navigate to the `sql` folder in your project directory.
    - Run all the `.sql` files in the folder using your preferred SQL execution tool (e.g., `psql`, `pgAdmin`, etc.).
    - Ensure that the database user has appropriate privileges to execute the SQL commands.

3. **Verification**: After running the SQL files, verify that the database schema is set up correctly by checking for the presence of tables, indexes, triggers, etc., as defined in the SQL files.

## Naming Convention

- Tables: All table should have their schema written directly, we use shogun as schema that means all tables are named as `shogun.<table_name>` for example our `user` table is named as `shogun.user`
- Other Objects: Indexes, triggers, alterations, etc., are also defined within the SQL files using appropriate naming conventions.

## Example

```sql
-- user.sql

-- Table Definition
CREATE TABLE shogun.user (
    id
);

-- Index Definition
CREATE INDEX idx_user_username ON shogun.user (id);

-- Trigger Definition
CREATE TRIGGER tr_user_audit
BEFORE INSERT OR UPDATE ON shogun.user
FOR EACH ROW
EXECUTE FUNCTION audit_function();
```

## Contributing

If you need to make changes or add new database objects, please ensure that they are properly documented within the corresponding SQL file. Follow the existing naming conventions and structure to maintain consistency across the project.
