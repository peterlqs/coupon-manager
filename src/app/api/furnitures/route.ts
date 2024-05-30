import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createFurniture,
  deleteFurniture,
  updateFurniture,
} from "@/lib/api/furnitures/mutations";
import { 
  furnitureIdSchema,
  insertFurnitureParams,
  updateFurnitureParams 
} from "@/lib/db/schema/furnitures";

export async function POST(req: Request) {
  try {
    const validatedData = insertFurnitureParams.parse(await req.json());
    const { furniture } = await createFurniture(validatedData);

    revalidatePath("/furnitures"); // optional - assumes you will have named route same as entity

    return NextResponse.json(furniture, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      return NextResponse.json({ error: err }, { status: 500 });
    }
  }
}


export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const validatedData = updateFurnitureParams.parse(await req.json());
    const validatedParams = furnitureIdSchema.parse({ id });

    const { furniture } = await updateFurniture(validatedParams.id, validatedData);

    return NextResponse.json(furniture, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      return NextResponse.json(err, { status: 500 });
    }
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const validatedParams = furnitureIdSchema.parse({ id });
    const { furniture } = await deleteFurniture(validatedParams.id);

    return NextResponse.json(furniture, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      return NextResponse.json(err, { status: 500 });
    }
  }
}
