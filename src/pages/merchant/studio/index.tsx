"use client";

import Navbar from "@/components/Navbar";
import { urlFor } from "@/lib/sanity";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  Trash2,
  Pencil,
  Inbox,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createItem,
  deleteItem,
  fetchItems,
  generateSlug,
  Item,
  NewItem,
  updateItem,
  uploadFile,
} from "@/lib/sanityAction";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { useRouter } from "next/router";

export default function Studio() {
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [membershipFilter, setMembershipFilter] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
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

  const handleEdit = (item: Item) => {
    const formattedItem = {
      ...item,
      image: null,
    };
    setEditingItem(formattedItem);
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

  return (
    <div className="m-8 grid gap-8">
      <div className="pb-4 border-b flex justify-between">
        <Navbar title="Displayed Items" />
        <ModeToggle />
      </div>
      <div className="flex gap-3">
        <div className="flex items-center border px-3 rounded-md">
          <Search />
          <input
            type="text"
            placeholder="Search by item name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded-md border-none focus:outline-none bg-transparent"
          />
        </div>
        <div className="flex items-center border rounded-md">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-full">
                {membershipFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-60 mt-3">
              <DropdownMenuLabel className="text-lg">
                Membership
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white" />
              <DropdownMenuRadioGroup
                value={membershipFilter}
                onValueChange={setMembershipFilter}
              >
                <DropdownMenuRadioItem value="All" className="text-base">
                  All
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Gold" className="text-base">
                  Gold
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Silver" className="text-base">
                  Silver
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Platinum" className="text-base">
                  Platinum
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {loading && !editingItem ? (
          <Loader2
            className="animate-spin absolute top-1/2 left-1/2"
            size={40}
          />
        ) : currentItems.length === 0 ? (
          <p className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-bold">
            No Items Found
          </p>
        ) : (
          currentItems.map((item) => (
            <div
              key={item._id}
              className="border p-6 rounded-md flex flex-col items-center justify-between"
            >
              <Image
                src={urlFor(item.image).url()}
                alt={item.title}
                width={150}
                height={150}
                className="my-2"
              />
              <h2 className="text-xl font-semibold max-w-full overflow-hidden whitespace-nowrap text-ellipsis">
                {item.title}
              </h2>
              <div className="flex gap-3 mt-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      onClick={() => handleEdit(item)}
                      variant="ghost"
                      className="size-10 rounded-md bg-yellow-600 hover:bg-yellow-500 border-none"
                    >
                      <Pencil color="white" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle className="text-2xl overflow-clip">
                        Edit {item.title}
                      </SheetTitle>
                      <SheetDescription>
                        Click Save Changes when you're done!
                      </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                          Title
                        </Label>
                        <Input
                          id="title"
                          value={editingItem?.title || ""}
                          onChange={(e) =>
                            setEditingItem((prev) => ({
                              ...prev!,
                              title: e.target.value,
                            }))
                          }
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          value={editingItem?.description || ""}
                          onChange={(e) =>
                            setEditingItem((prev) => ({
                              ...prev!,
                              description: e.target.value,
                            }))
                          }
                          className="col-span-3 h-[100px] rounded-none"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="membership" className="text-right">
                          Membership
                        </Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="col-span-3">
                              {editingItem?.membership || "Select Membership"}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>Membership</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white" />
                            <DropdownMenuRadioGroup
                              value={editingItem?.membership}
                              onValueChange={(value) =>
                                setEditingItem((prev) => ({
                                  ...prev!,
                                  membership: value,
                                }))
                              }
                            >
                              <DropdownMenuRadioItem
                                value="Silver"
                                className="text-base"
                              >
                                Silver
                              </DropdownMenuRadioItem>
                              <DropdownMenuRadioItem
                                value="Gold"
                                className="text-base"
                              >
                                Gold
                              </DropdownMenuRadioItem>
                              <DropdownMenuRadioItem
                                value="Platinum"
                                className="text-base"
                              >
                                Platinum
                              </DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">
                          Price
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          value={editingItem?.price || ""}
                          onChange={(e) =>
                            setEditingItem((prev) => ({
                              ...prev!,
                              price: parseFloat(e.target.value),
                            }))
                          }
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="image" className="text-right">
                          Image
                        </Label>
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files) {
                              const file = e.target.files[0];
                              setEditingItem((prev) => ({
                                ...prev!,
                                image: file,
                              }));
                            }
                          }}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <SheetFooter>
                      <Button
                        type="button"
                        onClick={handleSave}
                        className="text-white"
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="animate-spin" />
                            Saving
                          </span>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="size-10 rounded-md bg-red-600 hover:bg-red-500 border-none"
                    >
                      <Trash2 color="white" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-2xl overflow-clip">
                        Delete {item.title}?
                      </DialogTitle>
                      <DialogDescription>
                        <div className="grid gap-2">
                          <p className="text-base">
                            This action cannot be undone!
                          </p>
                        </div>
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        className="rounded-md bg-red-600 hover:bg-red-500 border-none text-white w-fit"
                        onClick={() => handleDelete(item)}
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="animate-spin" />
                            Deleting
                          </span>
                        ) : (
                          "Delete"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))
        )}
      </div>
      <div>
        {currentItems.length !== 0 && (
          <div className="flex justify-center items-center gap-4">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="border size-10 rounded-md"
            >
              <ChevronLeft color="white" />
            </Button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="border size-10 rounded-md"
            >
              <ChevronRight color="white" />
            </Button>
          </div>
        )}
      </div>
      <div className="fixed left-5 bottom-5">
        <Button
          variant="outline"
          size="icon"
          className="size-14 rounded-full light:border-black dark:border-white"
          onClick={() => {
            router.push("/merchant");
          }}
        >
          <Inbox strokeWidth={2} />
        </Button>
      </div>
      <div className="fixed right-5 bottom-5">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="size-14 rounded-full light:border-black dark:border-white bg-primary"
            >
              <Plus strokeWidth={2} />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] md:max-w-[750px]">
            <DialogHeader>
              <DialogTitle className="text-2xl">Add New Item</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new item.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-title" className="text-right">
                  Title
                </Label>
                <Input
                  id="new-title"
                  value={newItem.title}
                  onChange={(e) =>
                    setNewItem({ ...newItem, title: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="new-description"
                  value={newItem.description}
                  onChange={(e) =>
                    setNewItem({ ...newItem, description: e.target.value })
                  }
                  className="col-span-3 h-[100px] rounded-none"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-membership" className="text-right">
                  Membership
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="col-span-3">
                      {newItem.membership}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Membership</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white" />
                    <DropdownMenuRadioGroup
                      value={newItem.membership}
                      onValueChange={(value) =>
                        setNewItem({ ...newItem, membership: value })
                      }
                    >
                      <DropdownMenuRadioItem
                        value="Silver"
                        className="text-base"
                      >
                        Silver
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="Gold" className="text-base">
                        Gold
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem
                        value="Platinum"
                        className="text-base"
                      >
                        Platinum
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-price" className="text-right">
                  Price
                </Label>
                <Input
                  id="new-price"
                  type="number"
                  value={newItem.price}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      price: parseFloat(e.target.value),
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-image" className="text-right">
                  Image
                </Label>
                <Input
                  id="new-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) {
                      const file = e.target.files[0];
                      setNewItem({ ...newItem, image: file });
                    }
                  }}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                className="text-white"
                onClick={async () => {
                  await handleAdd();
                }}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" />
                    Adding
                  </span>
                ) : (
                  "Add Item"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
