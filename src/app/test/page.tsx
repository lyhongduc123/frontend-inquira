"use client";

import { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PaperCard } from "../_components/PaperCard";

export default function TestPage() {
  const [selected, setSelected] = useState<string>("paper");

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-60 border-r p-4 space-y-4 bg-muted/20">
        <h2 className="font-semibold text-lg mb-4">Component Preview</h2>

        <div className="space-y-2">
          <Button
            variant={selected === "paper" ? "default" : "outline"}
            className="w-full"
            onClick={() => setSelected("paper")}
          >
            PaperCard
          </Button>

          <Button
            variant={selected === "card" ? "default" : "outline"}
            className="w-full"
            onClick={() => setSelected("card")}
          >
            Basic Card
          </Button>

          <Button
            variant={selected === "button" ? "default" : "outline"}
            className="w-full"
            onClick={() => setSelected("button")}
          >
            Buttons
          </Button>
        </div>
      </aside>

      {/* Preview Area */}
      <div className="flex-1 p-4">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={70}>
            <div className="h-full p-4 overflow-auto bg-background rounded border">
              <h3 className="text-xl font-semibold mb-4">Preview</h3>

              {selected === "paper" && (
                <PaperCard
                  title="Sample Paper Title"
                  authors={[
                    {
                      name: "Author One",
                      hIndex: 25,
                      citationCount: 1500,
                      authorId: "A1",
                      paperCount: 50,
                    },
                    {
                      name: "Author Two",
                      hIndex: 30,
                      citationCount: 2000,
                      authorId: "A2",
                      paperCount: 70,
                    },
                    {
                      name: "Author Three",
                      hIndex: 20,
                      citationCount: 1000,
                      authorId: "A3",
                      paperCount: 40,
                    },
                    {
                      name: "Author Four",
                      hIndex: 15,
                      citationCount: 800,
                      authorId: "A4",
                      paperCount: 30,
                    },
                  ]}
                  year={2023}
                  venue="Sample Venue Name Conference 2023 And Journal of Examples"
                  abstract="This is a sample abstract for previewing this component. It provides a brief summary of the paper's content and key findings. The abstract should be concise and informative, giving readers an overview of what to expect in the full paper. This is a sample abstract for previewing this component. It provides a brief summary of the paper's content and key findings."
                  url="https://example.com/sample-paper"
                  citation_count={123}
                //   relevance_rank={0.85}
                //   reputation_rank={0.9}
                  influential_citation_count={100}
                />
              )}

              {selected === "card" && (
                <Card className="p-6">
                  <h4 className="font-semibold text-lg">Basic Card</h4>
                  <p className="text-muted-foreground text-sm mt-2">
                    This is a sample Card component from shadcn. 
                  </p>
                </Card>
              )}

              {selected === "button" && (
                <div className="space-x-2">
                  <Button>Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="outline">Outline</Button>
                </div>
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Right side panel (optional for code preview) */}
          <ResizablePanel defaultSize={30}>
            <div className="h-full border rounded p-4 bg-muted/10">
              <h3 className="text-xl font-semibold mb-4">Code (optional)</h3>
              <p className="text-sm text-muted-foreground">
                Here you can render code snippets or props if you want.
              </p>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
