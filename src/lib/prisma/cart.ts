export interface CartData {
  id: number;
  address: string;
  title: string;
  image?: string;
  qty: number;
  price: number;
  membership: string;
  slug: string;
}

export type AddCartData = Omit<CartData, "id">;

export async function addToCart(data: AddCartData) {
  try {
    const response = await fetch("/api/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: data.address,
        title: data.title,
        image: data.image,
        qty: Number(data.qty),
        price: data.price,
        membership: data.membership,
        slug: data.slug,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to add to cart");
    }

    return response.json();
  } catch (error) {
    console.error("Error in addToCart:", error);
    throw error;
  }
}

export async function getCartByAddress(addr: string) {
  try {
    const response = await fetch("/api/cart/get", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: addr,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to get data");
    }

    return response.json();
  } catch (error) {
    console.error("Error in getCartByAddress:", error);
    throw error;
  }
}

export async function deleteCartById(id: number) {
  try {
    const response = await fetch("/api/cart/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete data");
    }

    return response.json();
  } catch (error) {
    console.error("Error in deleteCartById:", error);
    throw error;
  }
}
