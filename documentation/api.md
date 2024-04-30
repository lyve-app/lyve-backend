# API

## Types

```ts
type TypedResponse = {
  success: boolean;
  data: Record<string, string> | Record<string, string>[] | null;
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
      "level": 0
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
          "followed": true,
          "created_at": ""
        },
        {
          "user": {
            "id": "user2 id",
            "username": "",
            "avatar_url": "",
            "followerCount": 0
          },
          "followed": false,
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
          "followed": false,
          "created_at": ""
        },
        {
          "user": {
            "id": "user2 id",
            "username": "",
            "avatar_url": "",
            "followerCount": 1736
          },
          "followed": true,
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

##### `"chat:join"`

##### `"chat:leave"`

##### `"chat:sendMsg"`

#### Server to Client

##### `"chat:joined"`

##### `"chat:userLeaved"`

##### `"chat:msg"`
