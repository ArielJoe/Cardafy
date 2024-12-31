export interface itemCard {
  membership: string;
  title: string;
  description: string;
  price: number;
  slug: string;
  content: string;
  image: any;
}

export interface fullItemPage {
  _id: string;
  slug: string;
  title: string;
  membership: string;
  price: number;
  content: any;
  image: any;
}
