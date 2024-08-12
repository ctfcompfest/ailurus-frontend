import { getUser } from "@/components/fetcher/user";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface DocsInterface {
  label: string;
  content: string;
}

function useDocs() {
  const { data: apiDoc } = useQuery({
    queryKey: ["apiDoc"],
    queryFn: () => getUser<string>("docs/api"),
  });
  const { data: vpnDoc } = useQuery({
    queryKey: ["vpnDoc"],
    queryFn: () => getUser<string>("docs/vpn"),
  });
  const { data: scoreDoc } = useQuery({
    queryKey: ["scoreDoc"],
    queryFn: () => getUser<string>("docs/scoring"),
  });
  return { apiDoc, vpnDoc, scoreDoc };
}

export default function DocsPage() {
  const { apiDoc, vpnDoc, scoreDoc } = useDocs();

  const docsMenu: { [index: string]: DocsInterface } = useMemo(
    () => ({
      api: { label: "API", content: apiDoc?.data ?? "" },
      patching: { label: "VPN", content: vpnDoc?.data ?? "" },
      scoring: { label: "Scoring", content: scoreDoc?.data ?? "" },
    }),
    [apiDoc, vpnDoc, scoreDoc]
  );

  const [menuActive, setMenuActive] = useState("api");
  const [docsContent, setDocsContent] = useState(docsMenu["api"].content);

  useEffect(() => {
    // Replace $$ expressions with KaTeX rendering
    const htmlWithMath = docsMenu[menuActive].content;
    const renderedHtml = htmlWithMath.replace(
      /(?<!\\)\$\$(.*?)\$\$/g,
      (_, mathExpression) => {
        return katex.renderToString(mathExpression);
      }
    );

    // Replace $ expressions with KaTeX rendering
    const secondRenderedHtml = renderedHtml.replace(
      /(?<!\\)\$(.*?)\$/g,
      (_, mathExpression) => {
        return katex.renderToString(mathExpression, { displayMode: false });
      }
    );
    const finalRenderedHtml = secondRenderedHtml.replaceAll("\\$", "$");
    setDocsContent(finalRenderedHtml);
  }, [menuActive, docsMenu]);

  return (
    <div className="gap-4 px-4">
      <div className="tabs w-full justify-center">
        {Object.keys(docsMenu).map((key) => (
          <a
            key={`tab-docs-${key}`}
            onClick={() => setMenuActive(key)}
            className={
              "tab tab-lg tab-bordered" +
              (menuActive == key ? " tab-active" : "")
            }
          >
            {docsMenu[key].label}
          </a>
        ))}
      </div>
      <div className="p-4 rounded-md m-4">
        <article
          className="prose dark:prose-invert max-w-none"
          style={{ color: "white" }}
          dangerouslySetInnerHTML={{ __html: docsContent ?? "" }}
        ></article>
      </div>
    </div>
  );
}
