export default {
  name: 'item',
  type: 'document',
  title: 'Item',
  fields: [
    {name: 'membership', type: 'string', title: 'Membership'},
    {
      name: 'title',
      type: 'string',
      title: 'Title of item',
    },
    {
      name: 'slug',
      type: 'slug',
      title: 'Slug of your item article',
      options: {
        source: 'title',
      },
    },
    {
      name: 'image',
      type: 'image',
      title: 'Item Image',
    },
    {
      name: 'price',
      type: 'number',
      title: 'Item Price',
    },
    {
      name: 'description',
      type: 'text',
      title: 'Small Description',
    },
    {
      name: 'content',
      type: 'array',
      title: 'Content',
      of: [
        {
          type: 'block',
        },
      ],
    },
  ],
}
