export interface TransactionData {
  tx_id: string;
  name: string;
  address: string;
  item_name: string;
  qty: number;
  price: number;
  date_ordered: string;
  status: string;
}

export async function addToTransaction(data: TransactionData) {
  try {
    const response = await fetch("/api/transaction/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tx_id: data.tx_id,
        name: data.name,
        address: data.address,
        item_name: data.item_name,
        qty: data.qty,
        price: data.price,
        date_ordered: new Date(data.date_ordered),
        status: data.status,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to add to transaction");
    }

    return response.json();
  } catch (error) {
    console.error("Error in addToTransaction:", error);
    throw error;
  }
}

export async function getTransaction() {
  try {
    const response = await fetch("/api/transaction/get", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed getting transaction");
    }

    return response.json();
  } catch (error) {
    console.error("Error in getTransaction:", error);
    throw error;
  }
}

export async function updateTransactionStatus(tx_id: string) {
  try {
    const response = await fetch("/api/transaction/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tx_id: tx_id,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed updating transaction");
    }

    return response.json();
  } catch (error) {
    console.error("Error in updateTransactionStatus:", error);
    throw error;
  }
}
