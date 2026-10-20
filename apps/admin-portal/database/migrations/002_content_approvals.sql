CREATE TABLE content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending', 'changes_requested', 'rejected', 'published')),
  created_by UUID NOT NULL REFERENCES users(id),
  submitted_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  reviewer_id UUID REFERENCES users(id),
  review_comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX content_items_status_submitted_idx ON content_items(status, submitted_at DESC);
CREATE INDEX content_items_author_updated_idx ON content_items(created_by, updated_at DESC);

CREATE TABLE content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  revision INTEGER NOT NULL CHECK (revision > 0),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  submitted_by UUID NOT NULL REFERENCES users(id),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  decision TEXT NOT NULL DEFAULT 'pending'
    CHECK (decision IN ('pending', 'approved', 'rejected', 'changes_requested')),
  reviewer_id UUID REFERENCES users(id),
  comments TEXT,
  reviewed_at TIMESTAMPTZ,
  UNIQUE (content_item_id, revision)
);
