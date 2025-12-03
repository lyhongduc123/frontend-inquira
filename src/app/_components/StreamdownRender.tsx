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
  // const { theme } = useTheme();

  // const shiki = React.useMemo(() => {
  //   const themes: [BundledTheme, BundledTheme] = ["github-light", "dracula"];
  //   return themes;
  // }, []);

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
    // <div className="markdown-content">
    <Streamdown
      mode={isStatic ? "static" : "streaming"}
      shikiTheme={["github-light", "github-dark"]}
      components={{
        citation: CitationComponent,
      }}
    >
      {processedMessage}
    </Streamdown>
    // </div>
  );
}
