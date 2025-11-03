import type { Database } from "./types";

export type Tables = Database["public"]["Tables"];

export type User = Tables["User"]["Row"];
export type Chat = Tables["Chat"]["Row"];
export type ChatInsert = Tables["Chat"]["Insert"];
export type ChatUpdate = Tables["Chat"]["Update"];
export type DBMessage = Tables["Message_v2"]["Row"];
export type DBMessageInsert = Tables["Message_v2"]["Insert"];
export type DBMessageUpdate = Tables["Message_v2"]["Update"];
export type Vote = Tables["Vote_v2"]["Row"];
export type VoteInsert = Tables["Vote_v2"]["Insert"];
export type Document = Tables["Document"]["Row"];
export type DocumentInsert = Tables["Document"]["Insert"];
export type DocumentUpdate = Tables["Document"]["Update"];
export type Suggestion = Tables["Suggestion"]["Row"];
export type SuggestionInsert = Tables["Suggestion"]["Insert"];
export type Stream = Tables["Stream"]["Row"];
export type StreamInsert = Tables["Stream"]["Insert"];

export type Functions = Database["public"]["Functions"];
export type MatchDocumentsArgs = Functions["match_documents"]["Args"];
export type MatchDocumentsRow = Functions["match_documents"]["Returns"][number];
export type PaginateChatsArgs = Functions["paginate_chats"]["Args"];
export type PaginateChatsRow = Functions["paginate_chats"]["Returns"][number];
export type GetMessageStatsArgs = Functions["get_message_stats"]["Args"];
