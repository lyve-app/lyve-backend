import {
  DtlsParameters,
  RtpCapabilities,
  RtpParameters
} from "mediasoup/node/lib/types";

export enum MediaServerEventType {
  CREATE_STREAM = "createStream",
  CREATE_PRODUCER = "createProducer",
  CONNECT_PRODUCER_TRANSPORT = "connectProducerTransport",
  CREATE_CONSUMER = "createConsumer",
  CONNECT_CONSUMER_TRANSPORT = "connectConsumerTransport",
  END_STREAM = "endStream",
  LEAVE_STREAM = "leaveStream"
}

export type RabbitMQMessage =
  | CreateStreamMessage
  | CreateProducerMessage
  | ConnectProducerTransportMessage
  | CreateConsumerMessage
  | ConnectConsumerTransportMessage
  | EndStreamMessage
  | LeaveStreamMessage;

export interface BaseMessage {
  type: MediaServerEventType;
}

export interface CreateStreamMessage extends BaseMessage {
  type: MediaServerEventType.CREATE_STREAM;
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

export interface EndStreamMessage extends BaseMessage {
  type: MediaServerEventType.END_STREAM;
  streamId: string;
}

export interface LeaveStreamMessage extends BaseMessage {
  type: MediaServerEventType.LEAVE_STREAM;
  clientId: string;
  streamId: string;
}
