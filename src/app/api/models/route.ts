import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createModel,
  deleteModel,
  updateModel,
} from "@/lib/api/models/mutations";
import { 
  modelIdSchema,
  insertModelParams,
  updateModelParams 
} from "@/lib/db/schema/models";

export async function POST(req: Request) {
  try {
    const validatedData = insertModelParams.parse(await req.json());
    const { model } = await createModel(validatedData);

    revalidatePath("/models"); // optional - assumes you will have named route same as entity

    return NextResponse.json(model, { status: 201 });
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

    const validatedData = updateModelParams.parse(await req.json());
    const validatedParams = modelIdSchema.parse({ id });

    const { model } = await updateModel(validatedParams.id, validatedData);

    return NextResponse.json(model, { status: 200 });
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

    const validatedParams = modelIdSchema.parse({ id });
    const { model } = await deleteModel(validatedParams.id);

    return NextResponse.json(model, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      return NextResponse.json(err, { status: 500 });
    }
  }
}
