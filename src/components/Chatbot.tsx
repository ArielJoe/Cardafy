"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Loader2, MessageCircleQuestion, Bot } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ShimmerButton from "@/components/ui/shimmer-button";

export default function Chatbot() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatIconRef = useRef<HTMLButtonElement>(null);
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    reload,
    error,
  } = useChat({ api: "/api/gemini" });
  const scrollRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <Popover open={isChatOpen}>
      <PopoverTrigger asChild>
        <ShimmerButton
          ref={chatIconRef}
          onClick={toggleChat}
          className="rounded-full size-14 p-2 shadow-lg"
        >
          {isChatOpen ? (
            <Bot color="white" />
          ) : (
            <MessageCircleQuestion color="white" />
          )}
        </ShimmerButton>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] sm:w-[500px] m-5 p-0 rounded-none">
        <Card className="rounded-none">
          <CardHeader className="flex flex-row items-center justify-between pt-3">
            <CardTitle className="text-lg font-bold">Ask Our AI</CardTitle>
            <Button
              onClick={toggleChat}
              size="sm"
              variant="ghost"
              className="px-2 py-0"
            >
              <X className="size-4" />
              <span className="sr-only">Close Chat</span>
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              {messages.length === 0 && (
                <div className="w-full mt-32 text-gray-500 flex justify-center items-center gap-3">
                  No Message
                </div>
              )}
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-4 ${
                    msg.role === "user" ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block rounded-md p-2 ${
                      msg.role === "user"
                        ? "bg-primary text-white"
                        : "bg-white text-black"
                    }`}
                  >
                    <ReactMarkdown
                      children={msg.content}
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, className, children, ...props }) {
                          return (
                            <code
                              {...props}
                              className="bg-gray-200 px-1 rounded"
                            >
                              {children}
                            </code>
                          );
                        },
                        ul: ({ children }) => (
                          <ul className="list-disc ml-4">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <li className="list-decimal ml-4">{children}</li>
                        ),
                      }}
                    />
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-center items-center gap-3 w-full">
                  <Loader2 className="animate-spin h-5 w-5" />
                  <Button
                    className="underline text-white"
                    type="button"
                    onClick={() => stop()}
                  >
                    Abort
                  </Button>
                </div>
              )}
              {error && (
                <div className="flex justify-center items-center gap-3 w-full">
                  <div>An error occurred.</div>
                  <Button
                    className="underline text-white"
                    type="button"
                    onClick={() => {
                      reload();
                    }}
                  >
                    Retry
                  </Button>
                </div>
              )}
              <div ref={scrollRef}></div>
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <form
              onSubmit={handleSubmit}
              className="flex items-center space-x-2 w-full"
            >
              <Input
                value={input}
                onChange={handleInputChange}
                className="flex-1"
                placeholder="Message"
              />
              <Button
                type="submit"
                className="size-9"
                disabled={isLoading}
                size="icon"
              >
                <Send color="white" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
