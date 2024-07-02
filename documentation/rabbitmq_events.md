Dieses Dokument bezieht sich auf die Events die von API und Media Server produziert und konsumiert werden.

> Die Payloads verwenden ebenfalls Datentypen von Mediasoup. Weitere Informationen zu diesen Datentypen finden Sie in der offiziellen Mediasoup- und Mediasoup-Client-Dokumentation https://mediasoup.org/documentation/v3/.
> 

> sid beschreibt die Websocket ID des Clients
> 

# API → Media-Server Events

### connect-as-streamer

Erstellt einen neuen Stream-Raum im Speicher und weist diesem einen Mediasoup-Worker und -Router zu. Außerdem werden für den Peer serverseitig neue WebRTC Transports zum produzieren und konsumieren eingerichtet.

**Queue:** media_server_queue

**Payload**

```tsx
type Payload = {
	op: "connect-as-streamer";
	data: {
	  streamId: string;
    peerId: string;
	};
	sid: string;
}
```

### connect-as-viewer

Erstellt für den Peer serverseitig einen WebRTC Transport zum konsumieren von audio und Video

**Queue:** media_server_queue

**Payload**

```tsx
type Payload = {
	op: "connect-as-viewer";
	data: {
	  streamId: string;
    peerId: string;
	};
	sid: string;
}
```

### close-peer

Schließt serverseitig alle Transporte, Producer und Consumer des Peers

**Queue:** media_server_queue

**Payload**

```tsx
type Payload = {
	op: "close-peer";
	data: {
	  streamId: string;
    peerId: string;
	};
	sid: string;
}
```

### connect-transport

Verbindet Server- und Client Tranporte des Peers 

**Queue:** media_server_queue

**Payload**

```tsx
type Payload = {
	op: "connect-transport";
	data: {
	  streamId: string;
    dtlsParameters: DtlsParameters;
    peerId: string;
    direction: StreamSendDirection;
	};
	sid: string;
}
```

### send-track

Weist den Router an, Audio- oder Video Streams des Peers zu empfangen 

**Queue:** media_server_queue

**Payload**

```tsx
type Payload = {
	op: "send-track";
	data: {
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
	sid: string;
}
```

### get-recv-tracks

Weist den Router an dem Peer Audio und Video Streams zu senden

**Queue:** media_server_queue

**Payload**

```tsx
type Payload = {
	op: "get-recv-tracks";
	data: {
	  streamId: string;
    peerId: string;
    rtpCapabilities: RtpCapabilities;
	};
	sid: string;
}
```

### end-stream

Löscht den intern gepeicherten Stream-Raum und gibt alle Ressourcen frei.

**Queue:** media_server_queue

**Payload**

```tsx
type Payload = {
	op: "end-stream";
	data: {
	  streamId: string;
	};
	sid: string;
}
```

### resume-consumers

Informiert den Mediasoup Router angehaltene Video Streams an den Konsumer zu senden  

**Queue:** media_server_queue

**Payload**

```tsx
type Payload = {
	op: "resume-consumers";
	data: {
	  streamId: string;
	};
	sid: string;
}
```

# Media-Server → API Events

### you-connected-as-streamer

Wird nach dem Erfolg von `connect-as-streamer` gesendet

**Queue:** api_server_queue

**Payload**

```tsx
type Payload = {
	op: "you-connected-as-streamer";
	data: {
		streamId: string;
	  peerId: string;
	  routerRtpCapabilities: RtpCapabilities;
	  recvTransportOptions: TransportOptions;
	  sendTransportOptions: TransportOptions;
	};
	sid: string;
}
```

### you-connected-as-viewer

Wird nach dem Erfolg von `connect-as-viewer` gesendet

**Queue:** api_server_queue

**Payload**

```tsx
type Payload = {
	op: "you-connected-as-viewer";
	data: {
		streamId: string;
	  peerId: string;
	  routerRtpCapabilities: RtpCapabilities;
	  recvTransportOptions: TransportOptions;
	};
	sid: string;
}
```

### media-server-error

Informs API that a error occured

**Queue:** api_server_queue

**Payload**

```tsx
type Payload = {
	op: "media-server-error";
	data: {
		name: string
		msg: string
	};
	sid: string;
}
```

### close-consumer

Informs that a consumer was close

**Queue:** api_server_queue

**Payload**

```tsx
type Payload = {
	op: "close-consumer";
	data: {
	  producerId: string;
    streamId: string;
	};
	streamId: string;
}
```

### you-left-stream

Will be send after `close-peer` was successful

**Queue:** api_server_queue

**Payload**

```tsx
type Payload = {
	op: "close-consumer";
	data: {
    streamId: string;
	};
	sid: string;
}
```

### resume-consumers-done

Will be send after `resume-consumers` was successful

**Queue:** api_server_queue

**Payload**

```tsx
type Payload = {
	op: "close-consumer";
	data: {
		streamId: string;
    error?: string;
	};
	sid: string;
}
```

### send-track-[StreamSendDirection]-res

Will be send after `send-track` was successful

**Queue:** api_server_queue

**Payload**

```tsx
type Payload = {
	op: `send-track-${StreamSendDirection}-res`;
	data: {
    error?: string;
    id?: string;
    streamId: string;
	};
	sid: string;
}
```

### connect-transport-[StreamSendDirection]-res

Will be send after `connect-transport` was successful

**Queue:** api_server_queue

**Payload**

```tsx
type Payload = {
	op: `connect-transport-${StreamSendDirection}-res`;
	data: {
    error?: string;
    streamId: string;
	};
	sid: string;
}
```

# Datentypen

### Consumer

```tsx
interface Consumer {
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
```

### StreamDirection

```tsx
type StreamSendDirection = "recv" | "send";
```

# Quellen

https://mediasoup.org/documentation/v3/
