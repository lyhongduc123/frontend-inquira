"use client";

import dynamic from "next/dynamic"
import React, { useState, useRef } from "react";
import { useParams } from "next/navigation";


import { VStack } from "@/components/layout/vstack";
import { HStack } from "@/components/layout/hstack";
import { Box } from "@/components/layout/box";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarTrigger,
  useSidebar,
  SidebarInset,
  SidebarRail,
} from "@/components/ui/sidebar";
import { TypographyH2 } from "@/components/global/typography";
import { ChatInput } from "@/app/_components/ChatInput";
import { MessageArea, MessageAreaRef } from "@/app/_components/MessageArea";

import {
  PaperMetadataSection,
  PaperActionBar,
  PaperAbstractSection,
  PaperCitationsView,
} from "@/app/works/_components";

import { Message } from "@/types/message.type";
import { ProgressState } from "@/hooks/use-progress-tracking";

const PaperPDFViewer = dynamic(
  () => import("../../_components/PaperPDFViewer").then((mod) => mod.PaperPDFViewer),
  { ssr: false }
)

export default function WorksDetailsPage() {
  return (
    <SidebarProvider>
      <WorksDetailsPageContent />
    </SidebarProvider>
  );
}

function WorksDetailsPageContent() {
  const params = useParams();
  const paperId = params.id as string;
  const { open: isPeekOpen, toggleSidebar } = useSidebar();

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState("abstract");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(40); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const messageAreaRef = useRef<MessageAreaRef>(null);

  // Handle resize
  const handleMouseDown = () => {
    setIsResizing(true);
  };

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    const windowWidth = window.innerWidth;
    const newWidth = ((windowWidth - e.clientX) / windowWidth) * 100;
    const clampedWidth = Math.min(Math.max(newWidth, 20), 50);
    setSidebarWidth(Math.round(clampedWidth));
  }, []);

  const handleMouseUp = React.useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add/remove mouse event listeners
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

  const [progress] = useState<ProgressState>({
    currentPhase: null,
    phaseMessage: null,
    progress: 0,
    steps: [],
    subtopics: [],
    thoughts: [],
    analysisStats: null,
  });

  // Mock data - replace with actual API call
  const mockPaper = {
    paper_id: paperId,
    title: "Attention Is All You Need",
    authors: [
      {
        authorId: "1",
        name: "Ashish Vaswani",
        hIndex: 45,
        paperCount: 120,
        citationCount: 50000,
      },
      {
        authorId: "2",
        name: "Noam Shazeer",
        hIndex: 38,
        paperCount: 95,
        citationCount: 40000,
      },
      {
        authorId: "3",
        name: "Niki Parmar",
        hIndex: 25,
        paperCount: 60,
        citationCount: 25000,
      },
    ],
    year: 2017,
    venue: "NeurIPS",
    abstract:
      "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.",
    url: "https://arxiv.org/abs/1706.03762",
    pdf_url: "https://arxiv.org/pdf/1706.03762.pdf",
    citation_count: 95000,
    source: "arxiv",
    relevance_score: 0.95,
    sjr_data: {
      journal_title: "Neural Information Processing Systems",
      issn: "1049-5258",
      sjr_score: 8.5,
      quartile: "Q1" as const,
      h_index: 240,
      impact_factor: 12.5,
      rank: 1,
      percentile: 99.5,
      is_open_access: true,
      publisher: "MIT Press",
      country: "United States",
      data_year: 2023,
    },
  };

  const mockCitations = [
    {
      paper_id: "2",
      title:
        "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
      authors: [
        {
          authorId: "4",
          name: "Jacob Devlin",
          hIndex: 50,
          paperCount: 80,
          citationCount: 60000,
        },
      ],
      year: 2018,
      citation_count: 75000,
    },
    {
      paper_id: "3",
      title: "GPT-3: Language Models are Few-Shot Learners",
      authors: [
        {
          authorId: "5",
          name: "Tom Brown",
          hIndex: 35,
          paperCount: 50,
          citationCount: 30000,
        },
      ],
      year: 2020,
      citation_count: 50000,
    },
  ];

  const handleFulltext = () => {
    if (mockPaper.pdf_url) {
      window.open(mockPaper.pdf_url, "_blank");
    }
  };

  const handlePeek = () => {
    toggleSidebar();
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleCite = () => {
    setActiveTab("citations");
  };

  const handleSendMessage = (msg: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      text: msg,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);

    // Simulate AI response about the paper
    setTimeout(() => {
      const aiMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        text: `Based on the paper "${mockPaper.title}", ${msg.toLowerCase().includes("method") ? "the authors introduce the Transformer architecture, which relies entirely on self-attention mechanisms without recurrence or convolution." : msg.toLowerCase().includes("result") ? "the paper demonstrates state-of-the-art performance on machine translation tasks with improved parallelization and efficiency." : "this is a groundbreaking work that has fundamentally changed natural language processing. Feel free to ask more specific questions about the methodology, results, or impact."}`,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsStreaming(false);
    }, 1000);
  };

  return (
    <HStack className="h-screen w-full">
      {/* Main Content Area */}
      <SidebarInset className="flex-1 overflow-hidden p-0">
        <ScrollArea
          className="h-full transition-[width] duration-200 ease-out"
          style={{
            width: isPeekOpen
              ? `${100 - sidebarWidth + (10 * 50) / sidebarWidth}%`
              : "100%",
          }}
        >
          <VStack className="p-4 sm:p-6 lg:p-8">
            <Box className="max-w-3xl w-full mx-auto space-y-6">
              {/* Metadata Section */}
              <PaperMetadataSection paper={mockPaper} />

              {/* Action Bar */}
              <PaperActionBar
                paper={mockPaper}
                isBookmarked={isBookmarked}
                onFulltext={handleFulltext}
                onPeek={handlePeek}
                onBookmark={handleBookmark}
                onCite={handleCite}
              />

              <Separator />

              {/* Tabs for Abstract and Citations */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList variant="line">
                  <TabsTrigger value="abstract">Abstract</TabsTrigger>
                  <TabsTrigger value="citations">
                    Citations ({mockCitations.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="abstract" className="mt-4">
                  <PaperAbstractSection abstract={mockPaper.abstract} />
                </TabsContent>

                <TabsContent value="citations" className="mt-4">
                  <PaperCitationsView
                    paper={mockPaper}
                    citations={mockCitations}
                  />
                </TabsContent>
              </Tabs>

              <Separator />

              {/* Chat Interface */}
              <VStack className="gap-4">
                {messages.length > 0 && (
                  <Box className="min-h-[300px] max-h-[500px]">
                    <MessageArea
                      ref={messageAreaRef}
                      messages={messages}
                      progress={progress}
                      isStreaming={isStreaming}
                    />
                  </Box>
                )}

                <ChatInput
                  onSend={handleSendMessage}
                  isDisabled={isStreaming}
                  isAtBottom={messages.length === 0}
                />
              </VStack>
            </Box>
          </VStack>
        </ScrollArea>
      </SidebarInset>

      {/* PDF Sidebar */}
      <Sidebar
        side="right"
        className="border-l"
        style={
          {
            "--sidebar-width": `${sidebarWidth}vw`,
          } as React.CSSProperties
        }
      >
        <SidebarRail />
        <SidebarContent>
          <HStack className="h-full">
            {/* PDF Content */}
            <Box className="flex-1 overflow-hidden">
              <PaperPDFViewer pdfUrl={mockPaper.pdf_url} />
            </Box>
          </HStack>
        </SidebarContent>
      </Sidebar>
    </HStack>
  );
}
