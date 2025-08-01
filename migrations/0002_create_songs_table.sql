CREATE TABLE IF NOT EXISTS songs (
  id TEXT PRIMARY KEY,
  title NOT NULL,
  task_id NOT NULL,
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);
