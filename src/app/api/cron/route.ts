import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import {
  getAll1DayCoupons,
  getAll1DayCouponsUsers,
} from "@/lib/api/coupons/queries";

async function handler(request: Request) {
  const coupons = await getAll1DayCoupons();
  for (const coupon of coupons.coupons) {
    const users = await getAll1DayCouponsUsers(coupon.id);
    console.log("Current coupon: ", coupon.code);
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? // ? "https://" + process.env.NEXT_PUBLIC_VERCEL_URL
          "https://savecoupon.vercel.app"
        : "http://localhost:3000";

    for (const user of users.user_groups) {
      // Make a post request to send email to user
      const payload = {
        email: user.user_email,
        subject: "Your coupon expires in < 1 day. Use it now!",
        message: `Your coupon ${coupon.code} is about to expire in < 1 day. Please use it before it expires.`,
      };
      const req = await fetch(baseUrl + "/api/email", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  }

  return Response.json({ success: true });
}

export const POST = verifySignatureAppRouter(handler);
