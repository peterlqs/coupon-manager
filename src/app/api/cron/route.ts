import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import {
  getAllDayCouponsUsers,
  getAllCouponsByDays,
} from "@/lib/api/coupons/queries";
import { Coupon } from "@/lib/db/schema/coupons";

async function handler(request: Request) {
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? `https://savecoupon.vercel.app`
      : "http://localhost:3000";
  const userCoupons: Record<string, { day: number; coupon: Coupon }[]> = {};
  for (let day of [1, 7]) {
    const coupons = await getAllCouponsByDays(day);
    for (const coupon of coupons.coupons) {
      const users = await getAllDayCouponsUsers(coupon.id);
      // console.log(`Current coupon: ${coupon.code}`);
      for (const user of users.user_groups) {
        if (!user.user_email) {
          continue;
        }
        if (!userCoupons[user.user_email]) {
          userCoupons[user.user_email] = [];
        }
        userCoupons[user.user_email].push({ day: day, coupon: coupon });
      }
    }
  }
  for (const userEmail in userCoupons) {
    const coupons = userCoupons[userEmail];

    // Group coupons by expiring day for better organization
    const groupedCoupons: Record<string, Coupon[]> = {};
    for (const { day: i, coupon } of coupons) {
      if (!groupedCoupons[i]) {
        groupedCoupons[i] = [];
      }
      groupedCoupons[i].push(coupon);
    }

    // Compose the email message
    let message = `Here are your coupons expiring in the next 7 days: \n\n`;
    for (const day in groupedCoupons) {
      message += `**Expiring in ${day} day(s):**\n`;
      for (const coupon of groupedCoupons[day]) {
        message += `- Code: ${coupon.code} - Store: ${coupon.store} - Discount: ${coupon.discount_amount} - Group: ${coupon.groupId} \n`;
      }
      message += "\n";
    }

    const payload = {
      email: userEmail,
      subject: `Your coupons are expiring soon!`,
      message: message,
    };

    const req = await fetch(baseUrl + "/api/email", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  console.log(userCoupons);

  return Response.json({ success: true });
}

export const POST = verifySignatureAppRouter(handler);
