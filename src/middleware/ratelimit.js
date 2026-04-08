import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import dotenv from "dotenv"


dotenv.config()

 const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

export async function ratelim(req, res, next) {
  const { success } = await ratelimit.limit(req.ip);

  if (!success) {
    return res.status(429).json({ message: "Too many req" });
  }

  next();
}
