-- Create function to get message statistics for rate limiting
-- This function counts the number of messages created by a user after a given start time

create or replace function get_message_stats(
  user_id uuid,
  start_time timestamp
)
returns bigint
language plpgsql
security definer
as $$
declare
  message_count bigint;
begin
  -- Count messages from Message_v2 table where:
  -- 1. The chat belongs to the specified user
  -- 2. The message was created at or after the start_time
  select count(*)
  into message_count
  from "Message_v2" m
  inner join "Chat" c on m."chatId" = c."id"
  where c."userId" = get_message_stats.user_id
    and m."createdAt" >= get_message_stats.start_time;
  
  return message_count;
end;
$$;

-- Add comment to document the function
comment on function get_message_stats(uuid, timestamp) is 
  'Returns the count of messages created by a user after the specified start time. Used for rate limiting.';
