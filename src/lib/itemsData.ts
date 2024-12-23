import { client } from "./sanity";

export async function getItemsData() {
  const query = `*[_type == 'item'] | order(_createdAt asc) {
    membership,
    title,
    price,
    description,
    "slug": slug.current,
    image,
    content,
  }`;

  const data = await client.fetch(query);
  return data;
}

export async function getSlugData(slug: string) {
  const query = `
    *[_type == "item" && slug.current == '${slug}'] {
        "currentSlug": slug.current,
        title,
        content,
        image,
        price,
    }[0]`;

  const data = await client.fetch(query);
  return data;
}
