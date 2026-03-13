"use client";

import React, { useState, useRef } from "react";
import { notFound, useParams } from "next/navigation";
import {
  usePaperDetail,
  usePaperCitations,
  usePaperReferences,
  usePaperChat,
} from "../hooks";

import { VStack } from "@/components/layout/vstack";
import { HStack } from "@/components/layout/hstack";
import { Box } from "@/components/layout/box";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { MessageArea, MessageAreaRef } from "@/app/_components/MessageArea";

import {
  PaperMetadataSection,
  PaperActionBar,
  PaperAbstractSection,
  PaperCitationsView,
  PaperReferenceView,
  PaperChatInput,
} from "@/app/(protected)/papers/_components";

import { PaperAbstractSectionSkeleton } from "../_components/PaperAbstractSection";
import { PaperActionBarSkeleton } from "../_components/PaperActionBar";
import { PaperMetadataSectionSkeleton } from "../_components/PaperMetadataSection";
import { TypographyP } from "@/components/global/typography";


export function PaperPageClient() {
  const params = useParams();
  const paperId = params.id as string;
  const { toggleSidebar } = useSidebar();

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState("abstract");
  const [chatActive, setChatActive] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const messageAreaRef = useRef<MessageAreaRef>(null);

  const { data: paper, isLoading, isError, error } = usePaperDetail(paperId);

  // Initialize paper chat hook
  const {
    messages,
    isStreaming,
    sendMessage: sendChatMessage,
  } = usePaperChat({
    paperId,
    onConversationCreated: (conversationId) => {
      console.log("Paper conversation created:", conversationId);
    },
    onError: () => {
      console.error("Chat error occurred");
    },
  });

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    // Reserved for future resize functionality
    console.log("Resize event:", e.clientX);
  }, []);

  const handleMouseUp = React.useCallback(() => {
    setIsResizing(false);
  }, []);

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const { data: citationsData, isLoading: citationsLoading } =
    usePaperCitations(paperId, activeTab === "citations");

  const { data: referencesData, isLoading: referencesLoading } =
    usePaperReferences(paperId, activeTab === "references");

  const citations = citationsData?.data || [];
  const references = referencesData?.data || [];

  console.log("PaperDetailsPageContent rendered with paper:", paper);
  console.log("Citations:", citations);
  console.log("References:", references);

  const handleFulltext = () => {
    if (paper?.pdfUrl) {
      window.open(paper.pdfUrl, "_blank");
    }
  };

  const handlePeek = () => {
    toggleSidebar();
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleSendMessage = (msg: string) => {
    if (!chatActive) {
      setChatActive(true);
    }
    sendChatMessage(msg);
  };

  if (isError) {
    throw error;
  }

  if (!paper && !isLoading) {
    notFound();
  }

  return (
    <HStack className="h-full w-full relative overflow-hidden">
      {/* Main Paper Content */}
      <Box
        className={`h-full transition-all duration-500 ease-in-out ${
          chatActive ? "w-[60%]" : "w-full"
        }`}
      >
        <ScrollArea className="h-full w-full">
          <VStack className="p-4 sm:p-6 lg:p-8 pb-32">
            <Box className="max-w-3xl w-full mx-auto space-y-6">
              {isLoading ? (
                <>
                  <PaperMetadataSectionSkeleton />
                  <PaperActionBarSkeleton />
                  <Separator />
                  <PaperAbstractSectionSkeleton />
                </>
              ) : paper ? (
                <>
                  <PaperMetadataSection paper={paper} />
                  <PaperActionBar
                    paper={paper}
                    isBookmarked={isBookmarked}
                    onFulltext={handleFulltext}
                    onPeek={handlePeek}
                    onBookmark={handleBookmark}
                  />

                  <Separator />
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList variant="line">
                      <TabsTrigger value="abstract">Abstract</TabsTrigger>
                      <TabsTrigger value="citations">
                        Citations ({paper.citationCount || 0})
                      </TabsTrigger>
                      <TabsTrigger value="references">
                        References ({paper.referenceCount || 0})
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="abstract" className="mt-4">
                      <PaperAbstractSection abstract={paper.abstract} />
                    </TabsContent>
                    <TabsContent value="citations" className="mt-4">
                      <PaperCitationsView
                        paper={paper}
                        citations={citations}
                        isLoading={citationsLoading}
                      />
                    </TabsContent>
                    <TabsContent value="references" className="mt-4">
                      <PaperReferenceView
                        references={references}
                        isLoading={referencesLoading}
                      />
                    </TabsContent>
                  </Tabs>
                  <Separator />
                </>
              ) : null}
            </Box>
          </VStack>
        </ScrollArea>

        {/* Chat Input - Fixed at bottom when chat not active */}
        {!chatActive && (
          <Box className="absolute bottom-0 left-0 right-0 p-4">
            <Box className="max-w-3xl mx-auto">
              <PaperChatInput
                paperTitle={paper?.title || ""}
                onSend={handleSendMessage}
                isDisabled={isStreaming || !paper}
              />
            </Box>
          </Box>
        )}
      </Box>

      {/* Chat Thread Panel - Slides in from right */}
      <Box
        className={`h-full border-l transition-all duration-500 ease-in-out overflow-hidden ${
          chatActive ? "w-[40%] opacity-100" : "w-0 opacity-0"
        }`}
      >
        <VStack className="h-full">
          {/* Chat Messages */}
          <Box className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <Box className="p-4">
                {messages.length > 0 ? (
                  <MessageArea
                    ref={messageAreaRef}
                    messages={messages}
                    isStreaming={isStreaming}
                  />
                ) : (
                  <VStack className="h-full items-center justify-center text-center p-8">
                    <TypographyP variant="muted" size="sm">
                      Ask me anything about this paper
                    </TypographyP>
                  </VStack>
                )}
              </Box>
            </ScrollArea>
          </Box>
          
          <Box className="border-t p-4 bg-background">
            <PaperChatInput
              paperTitle={paper?.title || ""}
              onSend={handleSendMessage}
              isDisabled={isStreaming || !paper}
            />
          </Box>
        </VStack>
      </Box>
    </HStack>
  );
}

