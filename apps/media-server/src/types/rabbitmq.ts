import {
  DtlsParameters,
  RtpCapabilities,
  RtpParameters
} from "mediasoup/node/lib/types";

export enum MediaServerEventType {
  GET_ROUTER_RTP_CAPABILITIES = "getRouterRtpCapabilities",
  CREATE_STREAM = "createStream",
  CREATE_PRODUCER = "createProducer",
  CONNECT_PRODUCER_TRANSPORT = "connectProducerTransport",
  PRODUCE = "produce",
  CREATE_CONSUMER = "createConsumer",
  CONNECT_CONSUMER_TRANSPORT = "connectConsumerTransport",
  CONSUME = "consume",
  END_STREAM = "endStream",
  LEAVE_STREAM = "leaveStream"
}

export type RabbitMQMessage =
  | RtpCapabilitiesMessage
  | CreateStreamMessage
  | CreateProducerMessage
  | ConnectProducerTransportMessage
  | ProduceMessage
  | CreateConsumerMessage
  | ConnectConsumerTransportMessage
  | ConsumeMessage
  | EndStreamMessage
  | LeaveStreamMessage;

export interface BaseMessage {
  type: MediaServerEventType;
}

export interface RtpCapabilitiesMessage extends BaseMessage {
  type: MediaServerEventType.GET_ROUTER_RTP_CAPABILITIES;
  streamId: string;
  clientId: string;
}

export interface CreateStreamMessage extends BaseMessage {
  type: MediaServerEventType.CREATE_STREAM;
  clientId: string;
  streamId: string;
}

export interface CreateProducerMessage extends BaseMessage {
  type: MediaServerEventType.CREATE_PRODUCER;
  streamId: string;
  clientId: string;
  rtpCapabilities: RtpCapabilities;
}

export interface ConnectProducerTransportMessage extends BaseMessage {
  type: MediaServerEventType.CONNECT_PRODUCER_TRANSPORT;
  dtlsParameters: DtlsParameters;
  clientId: string;
  streamId: string;
  rtpParameters: RtpParameters;
}

export interface ProduceMessage extends BaseMessage {
  type: MediaServerEventType.PRODUCE;
  streamId: string;
  clientId: string;
  kind: "audio" | "video";
  rtpParameters: RtpParameters;
}

export interface CreateConsumerMessage extends BaseMessage {
  type: MediaServerEventType.CREATE_CONSUMER;
  rtpCapabilities: RtpCapabilities;
  clientId: string;
  streamId: string;
}

export interface ConnectConsumerTransportMessage extends BaseMessage {
  type: MediaServerEventType.CONNECT_CONSUMER_TRANSPORT;
  dtlsParameters: DtlsParameters;
  clientId: string;
  streamId: string;
  rtpCapabilities: RtpCapabilities;
}

export interface ConsumeMessage extends BaseMessage {
  type: MediaServerEventType.CONSUME;
  streamId: string;
  clientId: string;
  rtpCapabilities: RtpCapabilities;
}

export interface EndStreamMessage extends BaseMessage {
  type: MediaServerEventType.END_STREAM;
  streamId: string;
}

export interface LeaveStreamMessage extends BaseMessage {
  type: MediaServerEventType.LEAVE_STREAM;
  clientId: string;
  streamId: string;
}
