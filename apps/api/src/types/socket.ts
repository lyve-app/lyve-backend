import { User } from "@prisma/client";

export type SocketUser = Pick<
  User,
  "id" | "username" | "dispname" | "avatar_url"
>;

export type SocketCallback<T> = (response?: SocketResponse<T>) => void;

export interface SocketResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    name: string;
    code: number;
    msg: string;
  }[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// type WithTimeoutAck<
//   isSender extends boolean,
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   args extends any[]
// > = isSender extends true ? [Error, ...args] : args;

export interface ServerToClientEvents {
  "you-connected-as-streamer": (data: unknown) => void;
  user_joined: (data: { user: SocketUser }) => void;
  user_leaved: (data: { user: SocketUser }) => void;
  viewer_count: (data: { viewerCount: number }) => void;
  stream_ended: (data: { ended_at: string; duration: number }) => void;
  new_msg: (data: {
    id: string;
    msg: string;
    sender: SocketUser;
    created_at: string;
  }) => void;
  resv_reward: (data: {
    msg: string;
    reward: {
      id: string;
      type: string;
      image: string;
      points: number; // the promotion points one receives for receiving the reward
    };
    sender: SocketUser;
    receiver: SocketUser;
  }) => void;
}

export interface ClientToServerEvents {
  connect_as_streamer: () => void;
  join_stream: (data: { streamId: string }) => void;
  leave_stream: () => void;
  create_stream: (
    data: { streamId: string },
    callback: SocketCallback<{ streamId: string }>
  ) => void;
  start_stream: (
    data: { streamId: string },
    callback: SocketCallback<null>
  ) => void;
  end_stream: (callback: SocketCallback<null>) => void;
  send_msg: (data: { msg: string }) => void;
  send_reward: (data: {
    msg: string;
    reward: {
      type: string;
    };
  }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  user: SocketUser;
  streamId?: string; // if player is in a stream this id will be defined
}
