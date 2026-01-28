"use client";

import React from "react";
import { Streamdown } from "streamdown";
import { PaperSource } from "@/types/paper.type";
import { Citation } from "./Citation";
import { convertCitationsToElements } from "@/lib/markdown-utils";
import { BundledTheme } from "shiki";
import { useTheme } from "next-themes";

interface StreamdownRenderProps {
  message: string;
  sources?: PaperSource[];
  isStatic?: boolean;
}

export function StreamdownRender({
  message,
  sources,
  isStatic = false,
}: StreamdownRenderProps) {
  const getSourceById = (id: string): PaperSource | undefined => {
    if (!Array.isArray(sources)) return undefined;
    return sources.find((src) => src.paper_id === id);
  };

  const processedMessage = React.useMemo(() => {
    const result = convertCitationsToElements(message, sources);
    return result;
  }, [message, sources]);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const CitationComponent = React.useCallback((props: { [key: string]: string }) => {
    const number = props["data-number"];
    const paperId = props["data-id"];
    const source = getSourceById(paperId);

    return <Citation number={number} paperId={paperId} source={source} />;
  }, [sources]); 

  return (
    <div className="markdown-content">
      <Streamdown
        mode={"streaming"}
        shikiTheme={["github-light", "github-dark"]}
        components={{
          citation: CitationComponent,
        }}
      >
        {processedMessage}
      </Streamdown>
    </div>
  );
}
