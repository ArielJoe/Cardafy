"use client";

import Navbar from "@/components/Navbar";
import { urlFor } from "@/lib/sanity/sanity";
import { useRef, useState } from "react";
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
import { ModeToggle } from "@/components/ui/ModeToggle";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { MerchantVerification } from "@/components/validator/MerchantVerification";
import useItemManagement from "@/hooks/useItemManagement";
const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

export default function Studio() {
  const router = useRouter();
  const {
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
    currentItems,
    totalPages,
    handleAdd,
    handleDelete,
    handleEdit,
    handleSave,
  } = useItemManagement();
  const [content, setContent] = useState<string | null>(null);
  const editor = useRef(null);

  const extractRichText = (richText: any) => {
    if (!richText || !richText.content) {
      return "";
    }

    return richText.content
      .map((block: { children: any[]; style: any }) => {
        const childrenHTML = block.children
          .map((child: { text: any }) => {
            return `<span>${child.text}</span>`;
          })
          .join("");

        return `<div class="${block.style}">${childrenHTML}</div>`;
      })
      .join("");
  };

  return (
    <MerchantVerification>
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
                  <DropdownMenuRadioItem value="Archive" className="text-base">
                    Archive
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {loading && !editingItem ? (
            <div className="col-span-full flex justify-center items-center">
              <Loader2 className="animate-spin" size={40} />
            </div>
          ) : currentItems.length === 0 ? (
            <div className="col-span-full flex justify-center items-center">
              <p className="text-xl">No Items Found</p>
            </div>
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
                        <div className="grid grid-cols-6 items-center gap-4">
                          <Label htmlFor="title" className="text-left">
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
                            className="col-span-5"
                          />
                        </div>
                        <div className="grid grid-cols-6 items-center gap-4">
                          <Label htmlFor="description" className="text-left">
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
                            className="col-span-5 h-[50px] rounded-none"
                          />
                        </div>
                        <div className="grid grid-cols-6 items-center gap-4">
                          <Label htmlFor="membership">Membership</Label>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" className="col-span-5">
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
                                <DropdownMenuRadioItem
                                  value="Archive"
                                  className="text-base"
                                >
                                  Archive
                                </DropdownMenuRadioItem>
                              </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="grid grid-cols-6 items-center gap-4">
                          <Label htmlFor="price" className="text-left">
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
                            className="col-span-5"
                          />
                        </div>
                        <div className="grid grid-cols-6 items-center gap-4">
                          <Label htmlFor="image" className="text-left">
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
                            className="col-span-5"
                          />
                        </div>
                        {/* <Label>Content</Label>
                    <JoditEditor
                      ref={editor}
                      value={extractRichText(content)}
                      config={{
                        buttons: [
                          "bold",
                          "italic",
                          "underline",
                          "link",
                          "ul",
                          "ol",
                        ],
                      }}
                      className="text-black"
                      onChange={handleEditorChange}
                    /> */}
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
            size="icon"
            className="size-14 rounded-full bg-black text-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white"
            onClick={() => {
              router.push("/merchant");
            }}
          >
            <Inbox strokeWidth={2} className="scale-150" />
          </Button>
        </div>
        <div className="fixed right-5 bottom-5">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="icon"
                className="size-14 rounded-full bg-primary text-white hover:bg-white hover:text-primary"
              >
                <Plus strokeWidth={2} className="scale-150" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] md:max-w-[500px]">
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
                        <DropdownMenuRadioItem
                          value="Archive"
                          className="text-base"
                        >
                          Archive
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
    </MerchantVerification>
  );
}
