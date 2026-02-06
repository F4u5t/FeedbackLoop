export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'admin' | 'member';
export type InviteStatus = 'pending' | 'accepted' | 'expired';
export type NotificationType = 'comment' | 'vote' | 'message' | 'mention';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          display_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          updated_at?: string;
        };
      };
      invites: {
        Row: {
          id: string;
          email: string;
          invited_by: string | null;
          token: string;
          status: InviteStatus;
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          invited_by?: string | null;
          token?: string;
          status?: InviteStatus;
          created_at?: string;
          expires_at?: string;
        };
        Update: {
          email?: string;
          invited_by?: string | null;
          token?: string;
          status?: InviteStatus;
          expires_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          name: string;
          slug: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          color?: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          color?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          content: Json;
          content_html: string;
          created_at: string;
          updated_at: string;
          is_deleted: boolean;
        };
        Insert: {
          id?: string;
          author_id: string;
          title: string;
          content?: Json;
          content_html?: string;
          created_at?: string;
          updated_at?: string;
          is_deleted?: boolean;
        };
        Update: {
          title?: string;
          content?: Json;
          content_html?: string;
          updated_at?: string;
          is_deleted?: boolean;
        };
      };
      post_tags: {
        Row: {
          post_id: string;
          tag_id: string;
        };
        Insert: {
          post_id: string;
          tag_id: string;
        };
        Update: {
          post_id?: string;
          tag_id?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          content: string;
          created_at: string;
          is_deleted: boolean;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id: string;
          content: string;
          created_at?: string;
          is_deleted?: boolean;
        };
        Update: {
          content?: string;
          is_deleted?: boolean;
        };
      };
      votes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          value: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          value: number;
          created_at?: string;
        };
        Update: {
          value?: number;
        };
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          recipient_id: string;
          content: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          recipient_id: string;
          content: string;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          content?: string;
          read_at?: string | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          reference_id: string | null;
          reference_type: string | null;
          message: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: NotificationType;
          reference_id?: string | null;
          reference_type?: string | null;
          message?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          read?: boolean;
        };
      };
    };
    Functions: {
      get_post_vote_count: {
        Args: { p_post_id: string };
        Returns: number;
      };
    };
  };
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Post = Database['public']['Tables']['posts']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];
export type Vote = Database['public']['Tables']['votes']['Row'];
export type Tag = Database['public']['Tables']['tags']['Row'];
export type Invite = Database['public']['Tables']['invites']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];

// Extended types for UI
export type PostWithMeta = {
  id: string;
  title: string;
  content_html: string;
  created_at: string;
  updated_at: string;
  author_id: string;
  author_username: string;
  author_display_name: string;
  author_avatar_url: string | null;
  vote_count: number;
  comment_count: number;
  tags: { name: string; slug: string; color: string }[];
  user_vote?: number | null;
};

export type ConversationPreview = {
  user: Profile;
  last_message: Message;
  unread_count: number;
};
