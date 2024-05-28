import dotenv from "dotenv";
import path from "path";
import Joi from "joi";
import {
  RtpCodecCapability,
  TransportListenInfo,
  WorkerLogTag
} from "mediasoup/node/lib/types";

dotenv.config({
  path: path.resolve(__dirname, "../../../.env")
});

const envSchema = Joi.object().keys({
  NODE_ENV: Joi.string().valid("production", "development", "test").required(),
  CORS_ORIGIN: Joi.string().required().default("*"),
  RABBITMQ_URL: Joi.string().required(),
  WEBRTC_LISTEN_IP: Joi.string().ip({
    version: ["ipv4", "ipv6"]
  }),
  A_IP: Joi.string()
    .ip({
      version: ["ipv4", "ipv6"]
    })
    .empty("")
});

const { value: validatedEnv, error } = envSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env, { abortEarly: false, stripUnknown: true });

if (error) {
  throw new Error(
    `Environment variable validation error: \n${error.details
      .map((detail) => detail.message)
      .join("\n")}`
  );
}

console.log(validatedEnv.A_IP, validatedEnv.WEBRTC_LISTEN_IP);

const config = {
  node_env: validatedEnv.NODE_ENV,
  cors: {
    origin: validatedEnv.CORS_ORIGIN
  },
  rabbitmq: {
    url: validatedEnv.RABBITMQ_URL,
    queues: {
      api_server_queue: "api_server_queue",
      media_server_queue: "media_server_queue"
    },
    retryInterval: 5000
  },
  mediasoup: {
    worker: {
      rtcMinPort: 40000,
      rtcMaxPort: 49999,
      logLevel: "debug",
      logTags: [
        "info",
        "ice",
        "dtls",
        "rtp",
        "srtp",
        "rtcp"
        // 'rtx',
        // 'bwe',
        // 'score',
        // 'simulcast',
        // 'svc'
      ] as WorkerLogTag[]
    },
    router: {
      mediaCodecs: [
        {
          kind: "audio",
          mimeType: "audio/opus",
          clockRate: 48000,
          channels: 2
        },
        {
          kind: "video",
          mimeType: "video/VP8",
          clockRate: 90000,
          parameters: {
            "x-google-start-bitrate": 1000
          }
        }
      ] as RtpCodecCapability[]
    },
    webRtcTransportOptions: {
      listenInfos: [
        {
          protocol: "udp",
          ip: validatedEnv.WEBRTC_LISTEN_IP,
          announcedAddress: validatedEnv.A_IP || undefined
        }
      ] as TransportListenInfo[],
      initialAvailableOutgoingBitrate: 800000
    }
  }
} as const;

export default config;
