// // src/inngest/functions/imageProcessing.ts
import { inngest } from "../client.js";
import cloudinary from "../../config/cloudinary.js";
 import productModel from "../../models/productModel.js";

// export const onProductCreated = inngest.createFunction(
//   { id: "on-product-created" },
//   { event: "product/created" },
//   async ({ event, step }) => {
//     const { productId, userId, images } = event.data;

//     // For each image, fetch metadata from Cloudinary (safe to call)
//     const metaResults: any[] = [];
//     for (const img of images) {
//       const info = await step.run(`fetch-${img.public_id}`, async () => {
//         try {
//           const res = await cloudinary.api.resource(img.public_id);
//           return {
//             public_id: img.public_id,
//             url: res.secure_url,
//             width: res.width,
//             height: res.height,
//             format: res.format,
//             size: res.bytes,
//           };
//         } catch (err) {
//           return { public_id: img.public_id, error: true };
//         }
//       });
//       metaResults.push(info);
//     }

//     // Push audit entries into product.imageAudit and optionally augment images with metadata
//     await step.run("update-product-audit", async () => {
//       const auditEntries = metaResults.map((m: any) => ({
//         public_id: m.public_id,
//         action: "upload",
//         userId,
//         timestamp: new Date(),
//         meta: m,
//       }));

//       // push audit
//       await productModel.findByIdAndUpdate(productId, {
//         $push: { imageAudit: { $each: auditEntries } },
//         // optionally update images metadata (width/height/format/size) if needed:
//       });
//     });

//     // Optionally: create transformed thumbnails (via Cloudinary URL patterns) and update product thumbnails
//     // (left as an exercise: use cloudinary.url(public_id, { transformation... }))
//     return { ok: true, processed: images.length };
//   }
// );




export const onProductCreated = inngest.createFunction(
  {
    id: "on-product-created",
    triggers: [{ event: "product/created" }],
  },
  async ({ event, step }) => {
    const { productId, userId, images } = event.data;

    const metaResults: any[] = [];

    for (const img of images) {
      const info = await step.run(`fetch-${img.public_id}`, async () => {
        try {
          const res = await cloudinary.api.resource(img.public_id);
          return {
            public_id: img.public_id,
            url: res.secure_url,
            width: res.width,
            height: res.height,
            format: res.format,
            size: res.bytes,
          };
        } catch (err) {
          return { public_id: img.public_id, error: true };
        }
      });

      metaResults.push(info);
    }

    await step.run("update-product-audit", async () => {
      const auditEntries = metaResults.map((m: any) => ({
        public_id: m.public_id,
        action: "upload",
        userId,
        timestamp: new Date(),
        meta: m,
      }));

      await productModel.findByIdAndUpdate(productId, {
        $push: { imageAudit: { $each: auditEntries } },
      });
    });

    return { ok: true, processed: images.length };
  }
);