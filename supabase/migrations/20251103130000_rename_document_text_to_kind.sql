-- Rename 'text' column to 'kind' in Document table
alter table "Document" rename column "text" to "kind";

-- Update constraint name for clarity
alter table "Document" drop constraint "Document_text_check";
alter table "Document" add constraint "Document_kind_check" check ("kind" in ('text', 'code', 'image', 'sheet'));
