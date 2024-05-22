import {
  DtlsParameters,
  IceCandidate,
  IceParameters,
  RtpCapabilities,
  RtpParameters
} from "mediasoup/node/lib/types";

export enum OutgoingEventType {
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

export enum IncomingEventTypes {
  GET_RTP_CAPABILITIES_RESPONSE = "getRtpCapabilitiesResponse",
  CREATE_PRODUCER_RESPONSE = "createProducerResponse",
  PRODUCER_READY = "producerReady",
  PRODUCE_RESPONSE = "produceResponse",
  CREATE_CONSUMER_RESPONSE = "createConsumerResponse",
  CONSUMER_READY = "consumerReady",
  CONSUME_RESPONSE = "consumeResponse"
}

export type RabbitMQIncomingMessage =
  | GetRtpCapabilitiesResponse
  | CreateProducerResponse
  | ProducerReady
  | CreateConsumerResponse
  | ConsumerReady;

export interface BaseMessage {
  type: string;
}

export interface GetRtpCapabilitiesResponse extends BaseMessage {
  type: IncomingEventTypes.GET_RTP_CAPABILITIES_RESPONSE;
  clientId: string;
  rtpCapabilities: RtpCapabilities;
}

export interface CreateProducerResponse extends BaseMessage {
  type: IncomingEventTypes.CREATE_PRODUCER_RESPONSE;
  clientId: string;
  transportParams: {
    id: string; // transport id
    iceParameters: IceParameters;
    iceCandidates: IceCandidate[];
    dtlsParameters: DtlsParameters;
  };
}

export interface ProducerReady extends BaseMessage {
  type: IncomingEventTypes.PRODUCER_READY;
  clientId: string;
}

export interface CreateConsumerResponse extends BaseMessage {
  type: IncomingEventTypes.CREATE_CONSUMER_RESPONSE;
  clientId: string;
  transportParams: {
    id: string;
    iceParameters: IceParameters;
    iceCandidates: IceCandidate[];
    dtlsParameters: DtlsParameters;
  };
}

export interface ConsumerReady extends BaseMessage {
  type: IncomingEventTypes.CONSUMER_READY;
  clientId: string;
  consumerParams: {
    id: string;
    producerId: string;
    kind: string;
    rtpParameters: RtpParameters;
  };
}

export interface RtpCapabilitiesResponse extends BaseMessage {
  type: OutgoingEventType.GET_ROUTER_RTP_CAPABILITIES;
  streamId: string;
  clientId: string;
}

export interface CreateStreamMessage extends BaseMessage {
  type: OutgoingEventType.CREATE_STREAM;
  clientId: string;
  streamId: string;
}

export interface CreateProducerMessage extends BaseMessage {
  type: OutgoingEventType.CREATE_PRODUCER;
  streamId: string;
  clientId: string;
  rtpCapabilities: RtpCapabilities;
}

export interface ConnectProducerTransportMessage extends BaseMessage {
  type: OutgoingEventType.CONNECT_PRODUCER_TRANSPORT;
  dtlsParameters: DtlsParameters;
  clientId: string;
  streamId: string;
  rtpParameters: RtpParameters;
}

export interface ProduceMessage extends BaseMessage {
  type: OutgoingEventType.PRODUCE;
  streamId: string;
  clientId: string;
  kind: "audio" | "video";
  rtpParameters: RtpParameters;
}

export interface CreateConsumerMessage extends BaseMessage {
  type: OutgoingEventType.CREATE_CONSUMER;
  rtpCapabilities: RtpCapabilities;
  clientId: string;
  streamId: string;
}

export interface ConnectConsumerTransportMessage extends BaseMessage {
  type: OutgoingEventType.CONNECT_CONSUMER_TRANSPORT;
  dtlsParameters: DtlsParameters;
  clientId: string;
  streamId: string;
  rtpCapabilities: RtpCapabilities;
}

export interface ConsumeMessage extends BaseMessage {
  type: OutgoingEventType.CONSUME;
  streamId: string;
  clientId: string;
  rtpCapabilities: RtpCapabilities;
}

export interface EndStreamMessage extends BaseMessage {
  type: OutgoingEventType.END_STREAM;
  streamId: string;
}

export interface LeaveStreamMessage extends BaseMessage {
  type: OutgoingEventType.LEAVE_STREAM;
  clientId: string;
  streamId: string;
}

export type RabbitMQOutgoingMessage =
  | CreateStreamMessage
  | CreateProducerMessage
  | ConnectProducerTransportMessage
  | CreateConsumerMessage
  | ConnectConsumerTransportMessage
  | EndStreamMessage
  | LeaveStreamMessage;
