import { client } from "./sanity";

export interface Item {
  _id: string;
  title: string;
  description: string;
  membership: string;
  slug: { current: string };
  price: number;
  image:
    | {
        _type: string;
        asset: {
          _type: string;
          _ref: string;
        };
      }
    | null
    | any;
}

export type NewItem = Omit<Item, "_id">;

export async function deleteItem(itemId: string) {
  await client.delete(itemId);
}

export async function updateItem(itemId: string, updatedData: Partial<Item>) {
  const patch = client.patch(itemId).set(updatedData);
  await patch.commit();
}

export async function createItem(item: Omit<Item, "_id">) {
  const createdItem = await client.create({
    _type: "item",
    ...item,
  });
  return createdItem;
}

export async function fetchItems() {
  const query = '*[_type == "item"]';
  const items = await client.fetch(query);
  return items;
}

export async function uploadFile(file: File) {
  try {
    const result = await client.assets.upload("image", file, {
      contentType: file.type,
      filename: file.name,
    });
    return result._id;
  } catch (error) {
    console.log(error);
  }
}

export function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .trim();
}
