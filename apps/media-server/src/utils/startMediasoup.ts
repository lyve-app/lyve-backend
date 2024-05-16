import * as mediasoup from "mediasoup";
import os from "os";
import config from "../config/config";
import { Router, Worker } from "mediasoup/node/lib/types";

export async function startMediasoup() {
  const workers: Array<{
    worker: Worker;
    router: Router;
  }> = [];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const _cpu of Object.keys(os.cpus())) {
    const worker = await mediasoup.createWorker({
      logLevel: config.mediasoup.worker.logLevel,
      logTags: config.mediasoup.worker.logTags,
      rtcMinPort: config.mediasoup.worker.rtcMinPort,
      rtcMaxPort: config.mediasoup.worker.rtcMaxPort
    });

    worker.on("died", () => {
      console.error("mediasoup worker died (this should never happen)");
      // eslint-disable-next-line no-process-exit
      process.exit(1);
    });

    const mediaCodecs = config.mediasoup.router.mediaCodecs;
    const router = await worker.createRouter({ mediaCodecs });

    workers.push({ worker, router });
  }

  return workers;
}
