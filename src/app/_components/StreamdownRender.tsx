"use client";

import React from "react";
import { Streamdown } from "streamdown";
import { PaperSource } from "@/types/paper.type";
import rehypeRaw from "rehype-raw";
import { Citation } from "./Citation";
import { convertCitationsToElements } from "@/lib/markdown-utils";

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
    const sourceExists = (id: string) => {
      if (!Array.isArray(sources)) return false;
      return sources.some((src) => src.paper_id === id);
    };
    return convertCitationsToElements(message, sourceExists);
  }, [message, sources]);

  const CitationComponent = (props: { [key: string]: string }) => {
    const number = props["data-number"];
    const paperId = props["data-id"];
    const source = getSourceById(paperId);

    return <Citation number={number} paperId={paperId} source={source} />;
  };

  return (
    <div className="markdown-content">
      <Streamdown
        mode={isStatic ? "static" : "streaming"}
        rehypePlugins={[rehypeRaw]}
        components={{
          citation: CitationComponent,
        }}
      >
        {processedMessage}
      </Streamdown>
    </div>
  );
}
