import { Params } from "@based/server";

export default async ({ based, payload }: Params) => {
  for (let i = 0; i < 1000; i++) {
    based.set({
      type: "event",
      relativehumidity: Math.random() * 100,
    });
  }
};
