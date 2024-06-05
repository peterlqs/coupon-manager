"use client";

import { UseFormReturn, UseFormSetValue, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NewCouponParams } from "@/lib/db/schema/coupons";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const FormSchema = z.object({
  picture: z
    .instanceof(File)
    .refine((file) => file.size < 7000000, {
      message: "Your picture must be less than 7MB.",
    })
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only these types are allowed .jpg, .jpeg, .png and .webp"
    ),
});

export default function ImageInput({
  couponForm,
}: {
  couponForm: UseFormReturn<NewCouponParams>;
}) {
  const form = useForm({
    resolver: zodResolver(FormSchema),
  });

  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(formData: any) {
    setIsLoading(true);
    const response = await fetch("/api/imageocr", {
      method: "POST",
      body: formData.picture,
    })
      .then((response) => response.json())
      .then((data) => {
        setIsLoading(false);
        console.log(data);
        if (data.error) {
          // alert("Error processing image. Please try again.");
          toast.error("Error processing image. Please try again.");
          return;
        }
        toast.success("Coupon scanned successfully.");
        // TODO clear the form
        couponForm.setValue("code", data.coupon_code);
        couponForm.setValue("store", data.store);
        couponForm.setValue("discount_amount", data.discount_amount);
        couponForm.setValue(
          "expiration_date",
          data.expiration_date as unknown as Date
        );
      });
  }

  return (
    <Form {...form}>
      <FormLabel>Scan your coupon</FormLabel>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex gap-2 items-start mt-1"
      >
        <FormField
          control={form.control}
          name="picture"
          render={({ field: { value, onChange, ...fieldProps } }) => (
            <FormItem className="w-full">
              <FormControl>
                <Input
                  {...fieldProps}
                  placeholder="Picture"
                  type="file"
                  accept="image/*"
                  disabled={isLoading}
                  onChange={(event) =>
                    onChange(event.target.files && event.target.files[0])
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Processing..." : "Scan"}
        </Button>
      </form>
    </Form>
  );
}
