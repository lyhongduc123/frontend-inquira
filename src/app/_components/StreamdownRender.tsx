"use client";

import React from "react";
import { Streamdown } from "streamdown";
import type { PaperMetadata } from "@/types/paper.type";
import { Citation } from "./Citation";
import { convertCitationsToElements } from "@/lib/markdown-utils";

interface StreamdownRenderProps {
  message: string;
  sources?: PaperMetadata[];
  isStatic?: boolean;
}

export function StreamdownRender({
  message,
  sources,
}: StreamdownRenderProps) {
  const processedMessage = React.useMemo(() => {
    const result = convertCitationsToElements(message, sources);
    return result;
  }, [message, sources]);

  // Memoize CitationComponent with sources to avoid stale closures
  const CitationComponent = React.useCallback(
    (props: { [key: string]: string }) => {
      const number = props["data-number"];
      const paperId = props["data-id"];
      const source = Array.isArray(sources)
        ? sources.find((src) => src.paperId === paperId)
        : undefined;

      return <Citation number={number} paperId={paperId} source={source} />;
    },
    [sources]
  ); 

  return (
    <div className="markdown-content min-w-0 w-full">
      <Streamdown
        mode={"streaming"}
        shikiTheme={["github-light", "github-dark"]}
        components={{
          // @ts-expect-error - Custom citation component not in Streamdown types
          citation: CitationComponent,
          
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          table: (props: any) => (
            <div className="w-full overflow-x-auto my-4 scrollbar-thin scrollbar-thumb-border/50">
              <table className="w-full min-w-[600px] m-0 text-sm" {...props} />
            </div>
          ),
        }}
      >
        {processedMessage}
      </Streamdown>
    </div>
  );
}
