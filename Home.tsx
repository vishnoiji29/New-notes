import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * Design Philosophy: Executive Elegance
 * - Systematic precision with mathematical spacing (8px base unit)
 * - Typographic hierarchy using Mukta (display) + Poppins (headings) + Hind (body)
 * - Deep navy (#1a2a6c) for authority, accent red (#b21f1f) for energy
 * - Functional elegance: every element serves content clarity
 * - Asymmetric editorial layout with generous whitespace
 * - Full-page notebook style with watermark
 */

interface Block {
  type: "section" | "news" | "qa" | "para";
  content: string | { title?: string; bullets?: string[]; q?: string; a?: string };
}

export default function Home() {
  const [subtitle, setSubtitle] = useState("Current Affairs • July 2026");
  const [footer, setFooter] = useState("EXAM PREP ACADEMY • BY KULDEEP BISHNOI");
  const [rawInput, setRawInput] = useState(
    `SECTION: महत्वपूर्ण समाचार
NEWS: राजस्थान की नई पहल
- जल संरक्षण के लिए नया अभियान शुरू
- 500 गाँवों को मिलेगा सीधा लाभ
- बजट में 200 करोड़ का प्रावधान

NEWS: डिजिटल इंडिया अपडेट
- 5G विस्तार अब ग्रामीण क्षेत्रों में भी
- शिक्षा के लिए मुफ्त इंटरनेट योजना

SECTION: अभ्यास प्रश्न
Q: राजस्थान के वर्तमान मुख्यमंत्री कौन हैं?
A: माननीय भजनलाल शर्मा

Q: भारत की राजधानी क्या है?
A: नई दिल्ली

यह एक सामान्य पैराग्राफ है जो बिना किसी टैग के भी व्यवस्थित तरीके से पेज पर दिखाई देगा। आप जितना चाहें उतना कंटेंट लिख सकते हैं, यह अपने आप अगले पेज पर चला जाएगा।`
  );

  const [pages, setPages] = useState<Block[][]>([]);
  const measurerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const boldify = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
  };

  const createBlockHTML = (block: Block): string => {
    if (block.type === "section") {
      return `<div class="section-title">${block.content}</div>`;
    }
    if (block.type === "news") {
      const content = block.content as { title?: string; bullets?: string[] };
      const bullets = (content.bullets || [])
        .map((b) => `<li>${boldify(b)}</li>`)
        .join("");
      return `<div class="news-item"><h3>${content.title}</h3><ul class="news-list">${bullets}</ul></div>`;
    }
    if (block.type === "qa") {
      const content = block.content as { q?: string; a?: string };
      return `<div class="qa-block"><div class="q-text">Q: ${boldify(content.q || "")}</div><div class="a-text"><b>Ans:</b> ${boldify(content.a || "")}</div></div>`;
    }
    if (block.type === "para") {
      return `<p style="line-height:1.8; font-size:18px; margin-bottom:12px; font-weight:500;">${boldify(block.content as string)}</p>`;
    }
    return "";
  };

  const parseContent = (): Block[] => {
    const lines = rawInput.split("\n");
    const blocks: Block[] = [];
    let currentNews: { title?: string; bullets?: string[] } | null = null;
    let currentQA: { q?: string; a?: string } | null = null;

    lines.forEach((line) => {
      const t = line.trim();
      if (!t) return;

      if (t.startsWith("SECTION:")) {
        blocks.push({
          type: "section",
          content: t.replace("SECTION:", "").trim(),
        });
        currentNews = null;
        currentQA = null;
      } else if (t.startsWith("NEWS:")) {
        currentNews = { title: t.replace("NEWS:", "").trim(), bullets: [] };
        blocks.push({ type: "news", content: currentNews });
        currentQA = null;
      } else if (t.startsWith("-") && currentNews) {
        currentNews.bullets!.push(t.substring(1).trim());
      } else if (t.startsWith("Q:")) {
        currentQA = { q: t.replace("Q:", "").trim(), a: "" };
        blocks.push({ type: "qa", content: currentQA });
        currentNews = null;
      } else if (t.startsWith("A:") && currentQA) {
        currentQA.a = t.replace("A:", "").trim();
      } else {
        blocks.push({ type: "para", content: t });
        currentNews = null;
        currentQA = null;
      }
    });

    return blocks;
  };

  const paginateContent = (blocks: Block[]): Block[][] => {
    const PAGE_HEIGHT_LIMIT = 800;
    const paginatedPages: Block[][] = [];
    let currentPage: Block[] = [];
    let currentHeight = 0;

    blocks.forEach((block) => {
      const blockHTML = createBlockHTML(block);
      if (measurerRef.current) {
        measurerRef.current.innerHTML = blockHTML;
        const blockHeight = measurerRef.current.offsetHeight + 15;

        if (currentHeight + blockHeight > PAGE_HEIGHT_LIMIT && currentPage.length > 0) {
          paginatedPages.push(currentPage);
          currentPage = [block];
          currentHeight = blockHeight;
        } else {
          currentPage.push(block);
          currentHeight += blockHeight;
        }
      }
    });

    if (currentPage.length > 0) {
      paginatedPages.push(currentPage);
    }

    return paginatedPages.length > 0
      ? paginatedPages
      : [[{ type: "para", content: "No content yet. Start typing above..." }]];
  };

  const render = () => {
    const blocks = parseContent();
    const paginatedPages = paginateContent(blocks);
    setPages(paginatedPages);
  };

  useEffect(() => {
    render();
  }, [rawInput, subtitle, footer]);

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setRawInput("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Hidden measurer */}
      <div
        ref={measurerRef}
        className="absolute invisible pointer-events-none"
        style={{ width: "180mm" }}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-lg">
              <img 
                src="/manus-storage/kd-logo_e722d8a9.png" 
                alt="KD Logo" 
                className="w-10 h-10"
              />
            </div>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-3 tracking-tight">
            Premium Notes Generator
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">
            Transform your notes into publication-ready documents with professional formatting
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Editor Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden sticky top-8">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>✏️</span> Editor
                </h2>
              </div>

              <div className="p-6 space-y-5">
                {/* Subtitle Input */}
                <div>
                  <label className="block text-base font-bold text-slate-700 mb-2 uppercase tracking-wide">
                    📌 Header Subtitle
                  </label>
                  <Input
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="text-base font-semibold border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* Footer Input */}
                <div>
                  <label className="block text-base font-bold text-slate-700 mb-2 uppercase tracking-wide">
                    📌 Footer Branding
                  </label>
                  <Input
                    value={footer}
                    onChange={(e) => setFooter(e.target.value)}
                    className="text-base font-semibold border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* Content Textarea */}
                <div>
                  <label className="block text-base font-bold text-slate-700 mb-2 uppercase tracking-wide">
                    📝 Content
                  </label>
                  <p className="text-sm text-slate-600 mb-2 font-medium">
                    Use <b>SECTION:</b>, <b>NEWS:</b>, <b>Q:</b>, <b>A:</b> or paragraphs
                  </p>
                  <Textarea
                    value={rawInput}
                    onChange={(e) => setRawInput(e.target.value)}
                    placeholder="Start typing your notes here..."
                    className="text-base font-medium border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none h-64"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handlePrint}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 shadow-md py-6"
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    Save as PDF
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-lg rounded-lg transition-all duration-300 py-6"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <div ref={previewRef} className="space-y-8">
              {pages.map((pageBlocks, pageIndex) => (
                <div
                  key={pageIndex}
                  className="bg-white shadow-2xl relative"
                  style={{
                    width: "210mm",
                    height: "297mm",
                    margin: "0 auto",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow:
                      "0 20px 60px rgba(0, 0, 0, 0.15), 0 0 1px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {/* Watermark */}
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%) rotate(-45deg)",
                      fontSize: "120px",
                      fontWeight: "bold",
                      color: "rgba(26, 42, 108, 0.08)",
                      fontFamily: "'Poppins', sans-serif",
                      zIndex: 0,
                      pointerEvents: "none",
                      whiteSpace: "nowrap",
                      letterSpacing: "20px",
                    }}
                  >
                    KD Bishnoi
                  </div>

                  {/* Page Border */}
                  <div
                    style={{
                      position: "absolute",
                      top: "10mm",
                      left: "10mm",
                      right: "10mm",
                      bottom: "10mm",
                      border: "3px solid #1a2a6c",
                      pointerEvents: "none",
                      zIndex: 1,
                    }}
                  />

                  {/* Page Content */}
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      padding: "15mm 12mm 20mm 12mm",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      fontFamily: "'Hind', sans-serif",
                      color: "#2c3e50",
                      zIndex: 2,
                    }}
                  >
                    {/* Header with Logo */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "15px",
                        marginBottom: "12px",
                        borderBottom: "3px double #1a2a6c",
                        paddingBottom: "12px",
                        flexShrink: 0,
                      }}
                    >
                      <img 
                        src="/manus-storage/kd-logo_e722d8a9.png" 
                        alt="KD Logo" 
                        style={{
                          width: "50px",
                          height: "50px",
                          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                        }}
                      />
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            fontFamily: "'Mukta', sans-serif",
                            fontSize: "40px",
                            fontWeight: 800,
                            color: "#1a2a6c",
                            lineHeight: 1,
                          }}
                        >
                          समसामयिकी
                        </div>
                        <div
                          style={{
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: "16px",
                            color: "#b21f1f",
                            fontWeight: 700,
                            letterSpacing: "2px",
                            marginTop: "4px",
                            textTransform: "uppercase",
                          }}
                        >
                          {subtitle}
                        </div>
                      </div>
                    </div>

                    {/* Body */}
                    <div
                      style={{
                        flexGrow: 1,
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        gap: "14px",
                        zIndex: 2,
                      }}
                    >
                      {pageBlocks.map((block, blockIndex) => (
                        <div
                          key={blockIndex}
                          dangerouslySetInnerHTML={{
                            __html: createBlockHTML(block),
                          }}
                        />
                      ))}
                    </div>

                    {/* Footer */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "10mm",
                        left: "12mm",
                        right: "12mm",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: "2px solid #d1d9e6",
                        paddingTop: "8px",
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: "13px",
                        color: "#5d6d7e",
                        fontWeight: 700,
                        zIndex: 2,
                      }}
                    >
                      <span>{footer}</span>
                      <span
                        style={{
                          background: "#1a2a6c",
                          color: "white",
                          padding: "4px 14px",
                          borderRadius: "12px",
                          fontWeight: 800,
                        }}
                      >
                        Page {pageIndex + 1}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white;
            padding: 0;
          }
          .sticky {
            position: static;
          }
          .max-w-7xl {
            max-width: 100%;
          }
          .grid {
            display: block;
          }
          .lg\\:col-span-1,
          .lg\\:col-span-2 {
            grid-column: auto;
          }
          .mb-12,
          .gap-8 {
            display: none;
          }
          .shadow-lg,
          .shadow-2xl,
          .border {
            box-shadow: none;
            border: none;
          }
          .bg-gradient-to-br,
          .bg-gradient-to-r {
            background: white !important;
          }
        }

        .section-title {
          font-family: 'Mukta', sans-serif;
          font-size: 26px;
          font-weight: 800;
          background: #1a2a6c;
          color: white;
          padding: 8px 18px;
          border-radius: 6px;
          margin-top: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .news-item {
          border-left: 5px solid #b21f1f;
          padding-left: 16px;
          margin-bottom: 8px;
        }

        .news-item h3 {
          font-family: 'Mukta', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #1a2a6c;
          margin-bottom: 6px;
          text-transform: uppercase;
        }

        .news-list {
          list-style: none;
          font-size: 18px;
          line-height: 1.8;
          font-weight: 500;
        }

        .news-list li::before {
          content: "▸";
          color: #b21f1f;
          font-weight: bold;
          display: inline-block;
          width: 1.2em;
          margin-left: -1.2em;
          font-size: 20px;
        }

        .qa-block {
          background: #f8f9fa;
          padding: 14px;
          border-radius: 8px;
          border: 2px solid #e9ecef;
          border-left: 5px solid #b21f1f;
        }

        .q-text {
          font-weight: 800;
          font-size: 19px;
          color: #1a2a6c;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .a-text {
          font-size: 18px;
          color: #2c3e50;
          font-weight: 500;
          line-height: 1.7;
        }

        .a-text b {
          color: #b21f1f;
          font-weight: 800;
        }
      `}</style>
    </div>
  );
}
