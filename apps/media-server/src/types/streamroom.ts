import {
  Consumer,
  Producer,
  Router,
  Transport,
  Worker
} from "mediasoup/node/lib/types";

export type StreamPeer = {
  sendTransport: Transport | null;
  recvTransport: Transport | null;
  producers: Producer[];
  consumers: Consumer[];
};

export type StreamState = Record<string, StreamPeer>;

export type StreamRoom = Record<
  string,
  {
    worker: Worker;
    router: Router;
    state: StreamState;
  }
>;
