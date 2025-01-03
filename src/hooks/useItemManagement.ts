import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  createItem,
  deleteItem,
  fetchContentById,
  fetchItems,
  generateSlug,
  Item,
  NewItem,
  updateItem,
  uploadFile,
} from "@/lib/sanity/sanityAction";

export default function useItemManagement() {
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [membershipFilter, setMembershipFilter] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<
    Omit<Item, "_id"> & { image: File | null }
  >({
    title: "",
    description: "",
    membership: "Silver",
    slug: { current: "" },
    price: 0,
    image: null,
  });

  const filteredItems = items.filter((item) => {
    const matchesMembership =
      membershipFilter === "All" || item.membership === membershipFilter;
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesMembership && matchesSearch;
  });

  const itemsPerPage = 8;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  useEffect(() => {
    const getItems = async () => {
      try {
        const itemsData = await fetchItems();
        setItems(itemsData);
      } catch (error) {
        console.log(error);
        toast({
          variant: "destructive",
          description: "Failed to fetch items",
        });
      } finally {
        setLoading(false);
      }
    };

    getItems();
  }, []);

  const handleAdd = async () => {
    setLoading(true);
    try {
      let imageAssetId: string | null = null;
      if (newItem.image) {
        imageAssetId = (await uploadFile(newItem.image)) as string;
      }

      const newItemData: NewItem = {
        title: newItem.title,
        description: newItem.description,
        membership: newItem.membership,
        price: newItem.price,
        slug: { current: generateSlug(newItem.title) },
        image: {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: imageAssetId || "",
          },
        },
      };

      const createdItem = await createItem(newItemData);
      setItems([...items, createdItem]);
      toast({
        className: "bg-green-900",
        description: `${newItem.title} added successfully`,
      });

      setNewItem({
        title: "",
        description: "",
        membership: "Gold",
        slug: { current: "" },
        price: 0,
        image: null,
      });
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        description: `Failed to add item ${newItem.title}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: Item) => {
    setLoading(true);
    try {
      const id = item._id;
      await deleteItem(id);
      setItems(items.filter((item) => item._id !== id));
      toast({
        className: "bg-green-900",
        description: `${item.title} deleted successfully`,
      });
    } catch (error) {
      console.log(error);
      toast({
        className: "bg-red-900",
        description: `Failed to delete item ${item.title}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (item: Item) => {
    const _formattedItem = {
      ...item,
      image: null,
    };
    const _content = await fetchContentById(item._id);
    setEditingItem(_formattedItem);
    setContent(_content);
  };

  const handleSave = async () => {
    setLoading(true);
    if (editingItem) {
      const id = editingItem._id;
      const updatedData: Partial<Item> = {
        title: editingItem.title,
        description: editingItem.description,
        slug: { current: generateSlug(editingItem.title) },
        membership: editingItem.membership,
        price: editingItem.price,
      };

      if (editingItem.image instanceof File) {
        try {
          const uploadedImageId = await uploadFile(editingItem.image);
          updatedData.image = {
            _type: "image",
            asset: {
              _type: "reference",
              _ref: uploadedImageId!,
            },
          };
        } catch (error) {
          console.log(error);
          toast({
            variant: "destructive",
            description: `Failed to upload new image for ${editingItem.title}`,
          });
          return;
        }
      }

      try {
        await updateItem(id, updatedData);
        setItems(
          items.map((item) =>
            item._id === id ? { ...item, ...updatedData } : item
          )
        );
        toast({
          className: "bg-green-900",
          description: `${editingItem.title} updated successfully`,
        });
      } catch (error) {
        console.log(error);
        toast({
          variant: "destructive",
          description: `Failed to update ${editingItem.title}`,
        });
      }
    }
    setLoading(false);
  };

  return {
    items,
    loading,
    membershipFilter,
    setMembershipFilter,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    editingItem,
    setEditingItem,
    newItem,
    setNewItem,
    content,
    currentItems,
    totalPages,
    handleAdd,
    handleDelete,
    handleEdit,
    handleSave,
  };
}
