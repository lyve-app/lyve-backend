import {
  AppData,
  ConsumerType,
  DtlsParameters,
  MediaKind,
  RtpCapabilities,
  RtpParameters,
  WebRtcTransport
} from "mediasoup/node/lib/types";

export interface Consumer {
  peerId: string;
  consumerParameters: {
    producerId: string;
    id: string;
    kind: MediaKind;
    rtpParameters: RtpParameters;
    type: ConsumerType;
    producerPaused: boolean;
  };
}

export type StreamSendDirection = "recv" | "send";

export type TransportOptions = Pick<
  WebRtcTransport,
  "id" | "iceParameters" | "iceCandidates" | "dtlsParameters"
>;

export interface HandlerDataMap {
  "connect-as-streamer": {
    streamId: string;
    peerId: string;
  };
  "connect-as-viewer": {
    streamId: string;
    peerId: string;
  };
  "close-peer": {
    streamId: string;
    peerId: string;
  };
  "connect-transport": {
    streamId: string;
    dtlsParameters: DtlsParameters;
    peerId: string;
    direction: StreamSendDirection;
  };
  "send-track": {
    streamId: string;
    peerId: string;
    transportId: string;
    direction: StreamSendDirection;
    paused: boolean;
    kind: MediaKind;
    rtpParameters: RtpParameters;
    rtpCapabilities: RtpCapabilities;
    appData: AppData;
  };
  "get-recv-tracks": {
    streamId: string;
    peerId: string;
    rtpCapabilities: RtpCapabilities;
  };
  "end-stream": {
    streamId: string;
  };
}

export type SendTrackDoneOperationName =
  `send-track-${StreamSendDirection}-res`;
export type ConnectTransportDoneOperationName =
  `connect-transport-${StreamSendDirection}-res`;

export type OutgoingMessageDataMap = {
  "you-connected-as-streamer": {
    streamId: string;
    peerId: string;
    routerRtpCapabilities: RtpCapabilities;
    recvTransportOptions: TransportOptions;
    sendTransportOptions: TransportOptions;
  };
  "you-connected-as-viewer": {
    streamId: string;
    peerId: string;
    routerRtpCapabilities: RtpCapabilities;
    recvTransportOptions: TransportOptions;
  };
  "media-server-error": {
    name: string;
    msg: string;
  };
  "get-recv-tracks-res": {
    consumerParametersArr: Consumer[];
    streamId: string;
  };
  "close-consumer": {
    producerId: string;
    streamId: string;
  };
  "you-left-stream": {
    streamId: string;
  };
} & {
  [Key in SendTrackDoneOperationName]: {
    error?: string;
    id?: string;
    streamId: string;
  };
} & {
  [Key in ConnectTransportDoneOperationName]: {
    error?: string;
    streamId: string;
  };
};

export type OutgoingMessage<Key extends keyof OutgoingMessageDataMap> = {
  op: Key;
  data: OutgoingMessageDataMap[Key];
} & ({ sid: string } | { streamId: string }); // sid is the socket.io socket.id
export interface IncomingChannelMessageData<Key extends keyof HandlerMap> {
  op: Key;
  data: HandlerDataMap[Key];
  sid: string;
}

export type HandlerMap = {
  [Key in keyof HandlerDataMap]: (
    data: HandlerDataMap[Key],
    sid: string,
    send: <Key extends keyof OutgoingMessageDataMap>(
      obj: OutgoingMessage<Key>
    ) => void,
    errBack: (name?: string, msg?: string) => void
  ) => void;
};
