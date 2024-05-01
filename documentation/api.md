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
      "email": "email",
      "created_at": "YYYY-MM-DD hh:mm:ss"
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
      "name": "Forbidden",
      "code": 403,
      "msg": "reason" // can also be empty later, bc off safety issues
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
      "bio": "",
      "avatar_url": "",
      "followingCount": 0,
      "followerCount": 0,
      "level": 0,
      "achievements": [
        {
          "id": "achievement id",
          "type": "",
          "name": "",
          "level": 0,
          "bannerUrl": "",
          "condition": 10,
          "progress": 5,
          "promotionPoints": 10
        }
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
      "following": [
        {
          "user": {
            "id": "user1 id",
            "username": "",
            "avatar_url": "",
            "followerCount": 200
          },
          "created_at": ""
        },
        {
          "user": {
            "id": "user2 id",
            "username": "",
            "avatar_url": "",
            "followerCount": 0
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
{
  "success": false,
  "data": null,
  "error": [
    {
      "name": "Forbidden",
      "code": 403,
      "msg": "No access token defined"
    }
  ]
}

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

#### `/api/user/:id/follower`

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
      "follows": [
        {
          "user": {
            "id": "user1 id",
            "username": "",
            "avatar_url": "",
            "followerCount": 0
          },
          "subscribed": false,
          "created_at": ""
        },
        {
          "user": {
            "id": "user2 id",
            "username": "",
            "avatar_url": "",
            "followerCount": 1736
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
{
    {
  "success": false,
  "data": null,
  "error": [
    {
      "name": "Forbidden",
      "code": 403,
      "msg": "No access token defined"
    }
  ]
}

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
}
```

#### `/api/users/:userId/following-active-streams`

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
    "activeStreams": [
      {
        "id": "stream id",
        "serverId": "server id",
        "active": true,
        "streamer": {
          "id": "streamer id",
          "username": "streamer username",
          "promotionPoints": 0,
          "level": 0
        },
        "previewImgUrl": "",
        "viewerCount": 0,
        "genre": "",
        "created_at": "YYYY-MM-DD hh:mm:ss"
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

#### `/api/user/:id/achievements`

Gets all the Achievements of the specified user

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
      "achievements": [
        {
          "id": "achievement id",
          "type": "",
          "name": "",
          "level": 0,
          "bannerUrl": "",
          "condition": 10,
          "progress": 5,
          "promotionPoints": 10
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
      "mostStreamedGenre": [
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

#### `/api/user/:id/streams`

Get all the streams a user created

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
    "user": {
      "id": "id",
      "username": "username",
      "streams": [
        {
          "id": "stream id",
          "serverId": "server id",
          "active": false,
          "streamer": {
            "id": "streamer id",
            "username": "streamer username",
            "promotionPoints": 0,
            "level": 0
          },
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
    "user": {
        ...
    }
}
```

**Response**
Success:

```json
{
  "success": true,
  "data": {
    "user": {}
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

#### `/api/user/:id/delete`

Deletes the specified user from the database

**Method**: DELETE

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
    "user": {}
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
    "active": true,
    "streamer": {
      "id": "streamer id",
      "username": "streamer username",
      "promotionPoints": 0,
      "level": 0,
      "avatar_url": "",
      "followerCount": 0,
      "followed": false
    },
    "previewImgUrl": "",
    "viewerCount": 0,
    "genre": "Chatting,Beauty,Fashion",
    "created_at": "YYYY-MM-DD hh:mm:ss"
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

// Bad Request
{
  "success": false,
  "data": null,
  "error": [
    {
      "name": "Bad Request",
      "code": 404,
      "msg": "... needs to be defined"
    }
  ]
}
```

#### `/api/stream/:id/join`

Lets a user join a stream and updates the stream record in the database

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
    "rtcCapabilities": {},
    "stream": {
      "id": "stream id",
      "serverId": "server id",
      "active": true,
      "streamer": {
        "id": "streamer id",
        "username": "streamer username",
        "promotionPoints": 0,
        "level": 0,
        "avatar_url": "",
        "followerCount": 0,
        "followed": false
      },
      "previewImgUrl": "",
      "viewerCount": 0,
      "genre": "Chatting,Beauty,Fashion",
      "created_at": "YYYY-MM-DD hh:mm:ss"
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

// Bad Request
{
  "success": false,
  "data": null,
  "error": [
    {
      "name": "Bad Request",
      "code": 404,
      "msg": "There was an error"
    }
  ]
}
```

#### `/api/stream/:id/leave`

Lets a user leave a stream and updates the stream record in the database

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
  "data": {},
  "error": []
}
```

Error:

```json
// Bad Request
{
  "success": false,
  "data": null,
  "error": [
    {
      "name": "Bad Request",
      "code": 404,
      "msg": "There was an error"
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
      "active": true,
      "streamer": {
        "id": "streamer id",
        "username": "streamer username",
        "avatar_url": "",
        "followerCount": 0,
        "followed": false,
        "promotionPoints": 0,
        "level": 0
      },
      "previewImgUrl": "",
      "viewerCount": 0,
      "genre": "Chatting,Beauty,Fashion",
      "created_at": "YYYY-MM-DD hh:mm:ss"
    }
  },
  "error": []
}
```

Error:

```json
{}
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
    "streams": [
      {
        "id": "stream id",
        "serverId": "server id",
        "active": true,
        "streamer": {
          "id": "streamer id",
          "username": "streamer username",
          "promotionPoints": 0,
          "level": 0
        },
        "previewImgUrl": "",
        "viewerCount": 0,
        "genre": "",
        "created_at": "YYYY-MM-DD hh:mm:ss"
      },
      ....
    ]
  },
  "error": []
}
```

Error:

```json
{}
```

#### `/api/stream/:id/end`

Updates a stream and produces a remove-stream event that will be send to the media server

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
      "active": true,
      "streamer": {
        "id": "streamer id",
        "username": "streamer username",
        "promotionPoints": 0,
        "level": 0
      },
      "previewImgUrl": "",
      "viewerCount": 0,
      "genre": "Chatting,Beauty,Fashion",
      "created_at": "YYYY-MM-DD hh:mm:ss",
      "ended_at": "YYYY-MM-DD hh:mm:ss",
      "duration": 840 // in seconds
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
      "name": "Bad Request",
      "code": 404,
      "msg": "There was an error"
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
