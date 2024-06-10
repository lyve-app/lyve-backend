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

### Live Chat

#### Client to Server

##### `"join"`

Lets the user join the chat room

**Payload**

```json
{}
```

**Acknowledgment:** Yes

```json
{
  "data": {
    "viewerCount": 0
  }
}
```

##### `"leave"`

Lets the user leave the chat room

**Payload**

```json
{}
```

**Acknowledgment:** No

##### `"sendMsg"`

Broadcasts a message to all users in the same room

**Payload**

```json
{
  "data": {
    "msg": "..."
  }
}
```

**Acknowledgment:** No

#### Server to Client

##### `"streamEnded"`

Informs all users in the room that the stream has ended

**Payload**

```json
{
  "data": {
    "ended_at": ""
  }
}
```

**Acknowledgment:** No

##### `"userJoined"`

Informs all users in the room that a new user has joined

**Receiving Payload**

```json
{
  "data": {
    "viewerCount": 100 // for updating the viewer count
  }
}
```

**Acknowledgment:** No

##### `"userLeaved"`

Informs all users in the room that a user leaved

**Receiving Payload**

```json
{
  "data": {
    "viewerCount": 100 // for updating the viewer count
  }
}
```

**Acknowledgment:** No

##### `"newChatMsg"`

Broadcasts message to all users in the room that a new user has joined

**Receiving Payload**

```json
{
  "data": {
    "id": "", // msg id
    "msg": "" // maybe this is later updated to tokens: MessageToken[]
    "sender": {
      "id": "",
      "username": "",
      "avatar_url": ""
    }
  }
}
```

**Acknowledgment:** No

##### `"receivedReward"`

Broadcasts to all users in the room user gifted a reward

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
      "id": "",
      "username": "",
      "avatar_url": ""
    }
  }
}
```

**Acknowledgment:** No
