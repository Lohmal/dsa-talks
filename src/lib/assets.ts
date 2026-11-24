import "server-only";
import { cache } from "react";
import { db } from "./db";

// Files uploaded in the admin panel, served at /media/<id> (see app/media/[id]/route.ts).
export const readAsset = cache(async (id: string) =>
  /^[a-f0-9]{24}$/.test(id) ? db.asset.findUnique({ where: { id } }) : null,
);
