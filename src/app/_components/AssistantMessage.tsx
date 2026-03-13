"use client";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import type { PaperMetadata } from "@/types/paper.type";
import { AssistantMessageBody } from "./AssistantMessageBody";
import { Box } from "@/components/layout/box";
import { getCitedPapers } from "@/lib/citation-utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VStack } from "@/components/layout/vstack";
import { PaperCard } from "./PaperCard";
import { useDetailSidebar } from "@/hooks/use-detail-sidebar";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface AssistantMessageProps {
  text: string;
  sources?: PaperMetadata[];
  showDivider?: boolean;
  isVisible?: boolean;
  isDone?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function AssistantMessage({
  text,
  sources,
  showDivider = false,
  isDone = false,
  isError = false,
  onRetry,
}: AssistantMessageProps) {
  const citedPapers = getCitedPapers(text, sources);
  const { openPaper, content, contentType } = useDetailSidebar();
  const [tabsValue, setTabsValue] = useState<string | null>(null);

  const handleTabChange = (value: string) => {
    setTabsValue((prev) => (prev === value ? null : value));
  };
  return (
    <Box className="min-w-0">
      <AssistantMessageBody text={text} sources={sources} isDone={isDone} />

      {isError && onRetry && (
        <Box className="mt-4">
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </Box>
      )}

      {sources && sources.length > 0 && (
        <Tabs defaultValue="results" className="w-full mt-4">
          {/* <HStack> */}
          <TabsList variant={"line"}>
            <TabsTrigger
              value="results"
              onClick={() => handleTabChange("results")}
            >
              Results
              {tabsValue === "results" ? (
                <ChevronDown className="ml-1 h-3 w-3" />
              ) : <ChevronUp className="ml-1 h-3 w-3" />}
            </TabsTrigger>
            <TabsTrigger
              value="references"
              onClick={() => handleTabChange("references")}
            >
              References
              {tabsValue === "references" ? (
                <ChevronDown className="ml-1 h-3 w-3" />
              ) : (
                <ChevronUp className="ml-1 h-3 w-3" />
              )}
            </TabsTrigger>
          </TabsList>

          {/* <ExportButton sources={sources} /> */}
          {/* </HStack> */}
          <AnimatePresence mode="wait">
            {tabsValue === "results" && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="results" className="">
                  {Array.isArray(sources) && sources.length > 0 && (
                    <VStack className="mt-2 space-y-2 min-w-0">
                      {sources.map((source, j) => (
                        <PaperCard
                          key={source.paperId || j}
                          idx={j}
                          paperMetadata={source}
                          isViewing={
                            !!content &&
                            contentType === "paper" &&
                            content.paperId === source.paperId
                          }
                          onView={openPaper}
                        />
                      ))}
                    </VStack>
                  )}
                </TabsContent>
              </motion.div>
            )}
            {tabsValue === "references" && (
              <motion.div
                key="references"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="references">
                  {citedPapers.length > 0 ? (
                    <VStack className="mt-2 space-y-2 min-w-0">
                      {citedPapers.map((source, j) => (
                        <PaperCard
                          key={source.paperId || j}
                          idx={j}
                          paperMetadata={source}
                          isViewing={
                            !!content &&
                            contentType === "paper" &&
                            content.paperId === source.paperId
                          }
                          onView={openPaper}
                        />
                      ))}
                    </VStack>
                  ) : null}
                </TabsContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Tabs>
      )}

      {showDivider && <Separator className="my-8" />}
    </Box>
  );
}
