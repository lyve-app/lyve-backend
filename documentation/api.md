# API

## Types

```ts
type TypedResponse = {
  success: boolean;
  data: Record<string, unknown> | Record<string, unknown>[] | null;
  error: {
    name: string;
    code: number;
    msg: string;
  }[];
};
```

## REST Schnittstelle

### User

#### `/api/user/create`

Creates a User

**Method**: POST

Auth required : yes

**Header**:

```json
Authorization: Bearer <access-token>
```

**Payload**

```json
{
  "id": "id"
  "username": "username",
  "email": "email"
}
```

**Response**
Success:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "id",
      "username": "username",
      "dispname": "display name"
      "email": "email"
    }
  },
  "error": []
}
```

Error:

```json
{
  "success": false,
  "data": null,
  "error": [
    {
      "name": "Bad_Request",
      "code": 400,
      "msg": "id, username and email must be defined"
    }
  ]
}
// or
{
  "success": false,
  "data": null,
  "error": [
    {
      "name": "Conflict",
      "code": 409,
      "msg": ""
    }
  ]
}
```

#### `/api/user/:id`

Gets the user with the specified id

**Method**: GET

Auth required : yes

**Header**:

```json
Authorization: Bearer <access-token>
```

**Payload**

```json
{}
```

**Response**
Success:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "id",
      "username": "username",
      "dispname": "dispname",
      "email": "email",
      "bio": "",
      "avatar_url": "", // or null
      "created_at": "date"
      "updatedAt": "date",
      "followingCount": 0,
      "followerCount": 0,
      "numStreams": 0,
      "num10minStreams": 0
      "minStreamed": 0
      "level":  1
      "promotionPoints":0
      "coins": 0
      "userToAchievement": [
        "achievement": {
          "id": "achievement id",
          "type": "",
          "name": "",
          "level": 0,
          "bannerUrl": "",
          "condition": 10,
          "progress": 5,
          "promotionPoints": 10
        }
      ],
      "streams": [
        {
          "id": "stream id",
          "serverId": "server id",
          "active": false,
          "previewImgUrl": "",
          "viewerCount": 0,
          "genre": "",
          "created_at": "YYYY-MM-DD hh:mm:ss",
          "ended_at": "datetime",
          "duration": 0 // in seconds
        },
        ...
      ]
    }
  },
  "error": []
}
```

Error:

```json
{
  "success": false,
  "data": null,
  "error": [
    {
      "name": "Not Found",
      "code": 404,
      "msg": "reason"
    }
  ]
}
```

#### `/api/user/follow`

Lets a user follow another user

**Method**: POST

Auth required : yes

**Header**:

```json
Authorization: Bearer <access-token>
```

**Payload**

```json
{
  "ownId": "ownId",
  "otherId": "otherId"
}
```

**Response**
Success:

```json
{
  "success": true,
  "data": {
    "follow": {
      "followedById": "followedById",
      "followingId": "followingId",
      "created_at": "date"
    }
  },
  "error": []
}
```

Error:

```json
{
  "success": false,
  "data": null,
  "error": [
    {
      "name": "Conflict",
      "code": 409,
      "msg": "already followed"
    }
  ]
}
```

#### `/api/user/unfollow`

Lets a user unfollow another user

**Method**: POST

Auth required : yes

**Header**:

```json
Authorization: Bearer <access-token>
```

**Payload**

```json
{
  "ownId": "ownId",
  "otherId": "otherId"
}
```

**Response**
Success:

```json
{
  "success": true,
  "data": {
    "follow": {
      "followedById": "followedById",
      "followingId": "followingId",
      "created_at": "date"
    }
  },
  "error": []
}
```

Error:

```json
{
  "success": false,
  "data": null,
  "error": [
    {
      "name": "Internal Server Error",
      "code": 500,
      "msg": "An error occurred while unfollowing"
    }
  ]
}
```

#### `/api/user/:id/following`

Gets all the users the specified user is following

**Method**: GET

Auth required : yes

**Header**:

```json
Authorization: Bearer <access-token>
```

**Payload**

```json
{}
```

**Response**
Success:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "id",
      "username": "username",
      "followingCount": 1000
      "following": [
        {
          "user": {
            "id": "user1 id",
            "username": "",
            "dispname": "dispname"
            "avatar_url": "",
          },
          "created_at": ""
        },
        {
          "user": {
            "id": "user2 id",
            "username": "",
            "dispname": "dispname"
            "avatar_url": "",
          },
          "created_at": ""
        },
        ...
      ]
    }
  },
  "error": []
}
```

Error:

```json
// user not found
{
  "success": false,
  "data": null,
  "error": [
    {
      "name": "Not Found",
      "code": 404,
      "msg": "User Not Found!"
    }
  ]
}
```

#### `/api/user/:id/followedBy`

Gets all the followers (users) of the specified user

**Method**: GET

Auth required : yes

**Header**:

```json
Authorization: Bearer <access-token>
```

**Payload**

```json
{}
```

**Response**
Success:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "id",
      "username": "username",
      "followerCount": 10000
      "followedBy": [
        {
          "user": {
            "id": "user1 id",
            "username": "",
            "dispname": "dispname"
            "avatar_url": "",
          },
          "subscribed": false,
          "created_at": ""
        },
        {
          "user": {
            "id": "user2 id",
            "username": "",
            "dispname": "dispname"
            "avatar_url": "",
          },
          "subscribed": true,
          "created_at": ""
        },
        ...
      ]
    }
  },
  "error": []
}
```

Error:

```json
// user not found
{
  "success": false,
  "data": null,
  "error": [
    {
      "name": "Not Found",
      "code": 404,
      "msg": "User Not Found!"
    }
  ]
}
```

#### `/api/users/:id/feed`

Gets all the active streams from the users that the users follows

**Method**: GET

Auth required : yes

**Header**:

```json
Authorization: Bearer <access-token>
```

**Payload**

```json
{}
```

**Response**
Success:

```json
{
  "success": true,
  "data": {
    "feed": [
      {
        "id": "stream id",
        "serverId": "server id",
        "active": true,
        "streamerId": "streamer id",
        "previewImgUrl": "",
        "viewerCount": 0,
        "genre": "",
        "created_at": "YYYY-MM-DD hh:mm:ss"
        "duration": 0,
        "ended_at": "YYYY-MM-DD hh:mm:ss"
        "streamer": {
          "id": "streamer id",
          "username": "streamer username",
          "avatar_url": "..."
          "dispname": "dispname"
          "promotionPoints": 0,
          "level": 0
        },
      },
      ....
    ]
  },
  "error": []
}
```

Error:

```json
// user not found
{
  "success": false,
  "data": null,
  "error": [
    {
      "name": "Not Found",
      "code": 404,
      "msg": "User Not Found!"
    }
  ]
}
```

#### `/api/user/:id/statistics/most-streamed-genre`

Calculates the most streamed genres of the users and returns it

**Method**: GET

Auth required : yes

**Header**:

```json
Authorization: Bearer <access-token>
```

**Payload**

```json
{}
```

**Response**
Success:

```json
{
  "success": true,
  "data": {
    "user": {
      "numStreams": 100,
      "genres": [
        {
          "name": "genre name",
          "percent": 50
        }
      ]
    }
  },
  "error": []
}
```

Error:

```json
// user not found
{
  "success": false,
  "data": null,
  "error": [
    {
      "name": "Not Found",
      "code": 404,
      "msg": "User Not Found!"
    }
  ]
}
```

#### `/api/user/:id/notifications`

Fetches the 30 latest notifications

**Method**: GET

Auth required : yes

**Header**:

```json
Authorization: Bearer <access-token>
```

**Payload**

```json
{}
```

**Response**
Success:

```json
{
  "success": true,
  "data": {
    "notifications": {
      "id": "id",
      "type": "username",
      "dispname": "dispname",
      "streamId": "stream id", // can be null
      "userWhoFiredEvent": "id user who fired the event", // can be null
      "recipientId": "id from receiver of the notification",
      "created_at": "date",
      "updated_at": "date"
    }
  },
  "error": []
}
```

Error:

```json
// User Not Found
{
  "success": false,
  "data": null,
  "error": [
    {
      "name": "Not Found",
      "code": 404,
      "msg": "User Not Found!"
    }
  ]
}
```

#### `/api/user/:id/update`

Update a user

**Method**: POST

Auth required : yes

**Header**:

```json
Authorization: Bearer <access-token>
```

**Payload**

```json
{
    "dispname": "dispname";  // or undefined
    "avatar_url": "url";  // or undefined
    "bio": "bio" // or undefined
}
```

**Response**
Success:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "id",
      "username": "username",
      "dispname": "dispname",
      "email": "email",
      "bio": "",
      "avatar_url": "", // or null
      "created_at": "date",
      "updatedAt": "date",
      "followingCount": 0,
      "followerCount": 0,
      "numStreams": 0,
      "num10minStreams": 0,
      "minStreamed": 0,
      "level": 1,
      "promotionPoints": 0,
      "coins": 0
    }
  },
  "error": []
}
```

Error:

```json
// Forbidden
{
  "success": false,
  "data": null,
  "error": [
    {
      "name": "Forbidden",
      "code": 403,
      "msg": "Forbidden"
    }
  ]
}

// User Not Found
{
  "success": false,
  "data": null,
  "error": [
    {
      "name": "Not Found",
      "code": 404,
      "msg": "User Not Found!"
    }
  ]
}
```

### Stream

#### `/api/stream/create`

Creates a stream

**Method**: POST

Auth required : yes

**Header**:

```json
Authorization: Bearer <access-token>
```

**Payload**

```json
{
  "streamerId": "",
  "previewImgUrl": "",
  "genre": "Chatting,Beauty,Fashion"
}
```

**Response**
Success:

```json
{
  "success": true,
  "data": {
      "id": "stream id",
      "serverId": "server id",
      "streamerId": "streamer id",
      "active": true,
      "previewImgUrl": "",
      "viewerCount": 0,
      "genre": "Chatting,Beauty,Fashion",
      "created_at": "YYYY-MM-DD hh:mm:ss"
      "ended_at": "YYYY-MM-DD hh:mm:ss",
      "duration": 1000, // in sec
    "streamer": {
      "id": "streamer id",
      "username": "streamer username",
      "dispname": "dispname",
      "promotionPoints": 0,
      "level": 0,
      "avatar_url": "",
      "followerCount": 0,
    }
  },
  "error": []
}
```

Error:

```json
// Conflict
{
  "success": false,
  "data": null,
  "error": [
    {
      "name": "Conflict",
      "code": 409,
      "msg": "streamer already has an active stream"
    }
  ]
}

// Bad Request
{
  "success": false,
  "data": null,
  "error": [
    {
      "name": "Bad Request",
      "code": 400,
      "msg": "streamerId, image and genre must be defined"
    }
  ]
}
```

#### `/api/stream/:id/`

Gets infos the specified stream

**Method**: GET

Auth required : yes

**Header**:

```json
Authorization: Bearer <access-token>
```

**Payload**

```json
{}
```

**Response**
Success:

```json
{
  "success": true,
  "data": {
    "stream": {
      "id": "stream id",
      "serverId": "server id",
      "streamerId": "streamer id",
      "active": true,
      "previewImgUrl": "",
      "viewerCount": 0,
      "genre": "Chatting,Beauty,Fashion",
      "created_at": "YYYY-MM-DD hh:mm:ss"
      "ended_at": "YYYY-MM-DD hh:mm:ss",
      "duration": 1000, // in sec
      "streamer": {
        "id": "streamer id",
        "username": "streamer username",
        "dispname": "dispname",
        "avatar_url": "",
        "followerCount": 0,
        "followed": false,
        "promotionPoints": 0,
        "level": 0
      },
    }
  },
  "error": []
}
```

Error:

```json
{
  "success": false,
  "data": null,
  "error": [
    {
      "name": "Not_Found",
      "code": 404,
      "msg": "Stream not found"
    }
  ]
}
```

#### `/api/stream/:id/start`

Starts the specified stream

**Method**: GET

Auth required : yes

**Header**:

```json
Authorization: Bearer <access-token>
```

**Payload**

```json
{}
```

**Response**
Success:

```json
{
  "success": true,
  "data": {
    "stream": {
      "id": "stream id",
      "serverId": "server id",
      "streamerId": "streamer id",
      "active": true,
      "previewImgUrl": "",
      "viewerCount": 0,
      "genre": "Chatting,Beauty,Fashion",
      "created_at": "YYYY-MM-DD hh:mm:ss"
      "ended_at": "YYYY-MM-DD hh:mm:ss",
      "duration": 1000, // in sec
      "streamer": {
        "id": "streamer id",
        "username": "streamer username",
        "dispname": "dispname",
        "avatar_url": "",
        "followerCount": 0,
        "promotionPoints": 0,
        "level": 0
      },
    }
  },
  "error": []
}
```

Error:

```json
{
  "success": false,
  "data": null,
  "error": [
    {
      "name": "Internal Server Error",
      "code": 500,
      "msg": "Stream couldnt be started, there was an internal sever error"
    }
  ]
}
```

#### `/api/stream/recommended`

Returns all the recommended streams with a high promotion score

**Method**: GET

Auth required : yes

**Header**:

```json
Authorization: Bearer <access-token>
```

**Payload**

```json
{}
```

**Response**
Success:

```json
{
  "success": true,
   "data": {
      streams: [
        {
          "id": "stream id",
          "serverId": "server id",
          "streamerId": "streamer id",
          "active": true,
          "previewImgUrl": "",
          "viewerCount": 0,
          "genre": "Chatting,Beauty,Fashion",
          "created_at": "YYYY-MM-DD hh:mm:ss"
          "ended_at": "YYYY-MM-DD hh:mm:ss",
          "duration": 1000, // in sec
          "streamer": {
            "id": "streamer id",
            "username": "streamer username",
            "dispname": "dispname",
            "promotionPoints": 0,
            "level": 0,
            "avatar_url": "",
            "followerCount": 0,
          },
      },
      ...
    ]
  },
  "error": []
}
```

Error:

```json
{}
```

#### `/api/stream/:id/delete`

Deletes a stream

**Method**: POST

Auth required : yes

**Header**:

```json
Authorization: Bearer <access-token>
```

**Payload**

```json
{}
```

**Response**
Success:

```json
{
  "success": true,
  "data": {
    "stream": {
          "id": "stream id",
          "serverId": "server id",
          "streamerId": "streamer id",
          "active": true,
          "previewImgUrl": "",
          "viewerCount": 0,
          "genre": "Chatting,Beauty,Fashion",
          "created_at": "YYYY-MM-DD hh:mm:ss"
          "ended_at": "YYYY-MM-DD hh:mm:ss",
          "duration": 1000, // in sec
          "streamer": {
            "id": "streamer id",
            "username": "streamer username",
            "dispname": "dispname",
            "promotionPoints": 0,
            "level": 0,
            "avatar_url": "",
            "followerCount": 0,
          },

  },
  "error": []
}
```

Error:

```json
// Forbidden
{
  "success": false,
  "data": null,
  "error": [
    {
      "name": "Forbidden",
      "code": 403,
      "msg": "Your not the host of the stream"
    }
  ]
}

// Bad Request
{
  "success": false,
  "data": null,
  "error": [
    {
      "name": "Not Found",
      "code": 404,
      "msg": "Stream not found"
    }
  ]
}

// Forbidden
{
  "success": false,
  "data": null,
  "error": [
    {
      "name": "Forbidden",
      "code": 403,
      "msg": "You cant delete this stream"
    }
  ]
}

// Internal Server Error
{
  "success": false,
  "data": null,
  "error": [
    {
      "name": "Internal Server Error",
      "code": 500,
      "msg": "There was an internal server error"
    }
  ]
}
```

## Websocket Schnittstelle

### Types

```ts
type SocketCallback<T> = (response?: SocketResponse<T>) => void;

interface SocketResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    name: string;
    code: number;
    msg: string;
  }[];
}
```

> The payloads also use Mediasoup datatypes. Further information on these data types can be found in the official Mediasoup and Mediasoup client documentation https://mediasoup.org/documentation/v3/.

#### Client to Server

##### `"connect-transport"`

Will send a signal over the API to the media-server to connects the client-side WebRTC transport with the server-side WebRTC transport

**Payload**

```json
{
  "data": {
    "transportId": "transport id",
    "dtlsParameters": DtlsParameters,
    "direction": StreamSendDirection,
  }
}
```

##### `"send-track"`

Will send a signal over the api to the media-server to instruct the mediasoup router to receive audio and video streams

**Payload**

```json
{
  "data": {
    "transportId": "tranport id",
    "direction": StreamSendDirection, // "send" or "recv"
    "paused": boolean,
    "kind": MediaKind,
    "rtpParameters": RtpParameters,
    "rtpCapabilities": RtpCapabilities,
    "appData": AppData
  }
}
```

##### `"get-recv-tracks"`

Will send a signal over the api to the media-server to instruct the mediasoup router to send audio and video streams

**Payload**

```json
{
  "data": {
    "rtpCapabilities": RtpCapabilities
  }
}
```

##### `"resume-consumers"`

Will send a signal over the api to the media-server to instruct the mediasoup router to unpause the video stream

**Payload**

```json
{}
```

##### `"join_stream"`

Allows a client to join a stream. When a new peer requests to join, the API signals the media server. The media server then initiates the signaling process to connect the peer with the router. Additionally, the API adds the client to the WebSocket room, enabling interaction with specific WebSocket events related to the stream.

If the client is a viewer the API will broadcast a `"user_joined"` event to all clients in the stream.

**Payload**

```json
{
  "data": {
    "streamId": "stream id"
  }
}
```

**Acknowledgment:** Yes

Acknowledgment Data:

```json
data: null
```

##### `"leave_stream"`

Allows a client to leave a stream. API will send a event to the media-server to cleanup the websocket tranports, producers, and consumers of the peer.
If the client is the host of the stream the stream will end and the API will broadcast the `"stream-ended"` event.
If the client was a viewer the API will broadcast a `"user_leaved"` event to all clients in the stream.

**Payload**

```json
{
  "data": {
    "streamId": "stream id"
  }
}
```

##### `"send_msg"`

Allows a client to send a message in the stream chat

Message Types that are supported are:

- Text
- GIF
- Sticker
- Emojis

**Payload**

```json
{
  "data": {
    // only one is required (msg or gif)
    "msg": "message",
    "gif": {
      "height": "100",
      "width": "100",
      "url": "gif url"
    }
  }
}
```

##### `"send_reward"`

Allows a client to send a reward to the streamer

**Payload**

```json
{
  "data": {
    "msg": "message",
    "reward": {
      "type": "" // RewardType (see prisma schema),
    }
  }
}
```

**Acknowledgment:** Yes

Acknowledgment Data:

```json
data: null
```

#### Server to Client

##### `"you-joined-as-streamer"`

Informs client that he joined a stream as streamer

**Payload**

```json
{
  "data": {
    "streamId": "stream id",
    "routerRtpCapabilities": RtpCapabilities,
    "recvTransportOptions": TransportOptions,
    "sendTransportOptions": TransportOptions,
  }
}
```

##### `"you-joined-as-streamer"`

Informs client that he joined a stream as streamer

**Payload**

```json
{
  "data": {
    "streamId": "stream id",
    "routerRtpCapabilities": RtpCapabilities,
    "recvTransportOptions": TransportOptions,
  }
}
```

##### `"get-recv-tracks-res"`

Returns a list of consumer parameters as results of `"get-recv-tracks"`

**Payload**

```json
{
  "data": {
     "consumerParametersArr": Consumer[],
  }
}
```

##### `"send-track-send-res"`

Returns the results of `"send-track"` type: send

**Payload**

```json
{
  "data": {
    "id": "server-side transport id",
    "error": "error msg" // or empty
  }
}
```

##### `"send-track-recv-res"`

Returns the results of `"send-track"` type: recv

**Payload**

```json
{
  "data": {
    "id": "server-side transport id",
    "error": "error msg" // or empty
  }
}
```

##### `"connect-transport-send-res"`

Returns the results of `"connect-transport"` type: send

**Payload**

```json
{
  "data": {
    "error": "error msg" // or empty
  }
}
```

##### `"connect-transport-recv-res"`

Returns the results of `"connect-transport"` type: recv

**Payload**

```json
{
  "data": {
    "error": "error msg" // or empty
  }
}
```

##### `"you-left-stream"`

Informs the clients that `"leave_stream"` was successful

**Payload**

```json
{}
```

##### `"resume-consumers-done"`

Returns the results of `"resume-consumers"`

**Payload**

```json
{
  "data": {
    "error": "error msg" // or empty
  }
}
```

##### `"user_joined"`

Informs all users in the stream that a new user has joined

**Payload**

```json
{
  "data": {
    "user": {
      "id": "user id",
      "username": "username",
      "dispname": "dispname",
      "avatar_url": "url" // or null
    }
  }
}
```

##### `"user_leaved"`

Informs all users in the stream that a new user has leaved

**Payload**

```json
{
  "data": {
    "user": {
      "id": "user id",
      "username": "username",
      "dispname": "dispname",
      "avatar_url": "url" // or null
    }
  }
}
```

##### `"viewer_count"`

Sends the current viewer count of a stream. Will be send every time a user joined or leaved

**Payload**

```json
{
  "data": {
    "viewerCount": 100
  }
}
```

##### `"stream_ended"`

Informs all viewer that the current stream ended. Will be send if the streamer ends the stream.

**Payload**

```json
{
  "data": {
    "ended_at": Date, // as string
    "duration": 100, // duration of the stream in seconds
    }
}
```

##### `"new_msg"`

Broadcasts message to all users in the stream

**Payload**

```json
{
  "data": {
    "id": "", // msg id
    // either msg or gif
    "msg": "",
    "gif": {
      "height": "100",
      "width": "100",
      "url": "gif url"
    },
    "sender": {
      "id": "user id",
      "username": "username",
      "dispname": "dispname",
      "avatar_url": "url"
    },
    "created_at": "date time" // as string
  }
}
```

##### `"resv_reward"`

Broadcasts that a viewer gifted a reward to a streamer

**Receiving Payload**

```json
{
  "data": {
    "msg": "",
    "reward": {
      "id": "",
      "type": "",
      "points": "" // the promotion points one receives for receiving the reward
    },
    "sender": {
      "id": "user id",
      "username": "username",
      "dispname": "dispname",
      "avatar_url": "url"
    },
    "receiver": {
      "id": "user id",
      "username": "username",
      "dispname": "dispname",
      "avatar_url": "url"
    }
  }
}
```
