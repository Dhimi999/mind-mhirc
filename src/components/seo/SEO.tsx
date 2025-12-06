import { Helmet } from "react-helmet-async";
import { getSiteBaseUrl } from "@/lib/utils";
import React from "react";

interface SEOProps {
  title: string;
  description: string;
  canonicalPath?: string; // e.g. '/blog/slug'
  type?: "website" | "article";
  image?: string;
  publishedTime?: string; // ISO
  modifiedTime?: string; // ISO
  tags?: string[];
  noIndex?: boolean;
  locale?: string; // default id_ID
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonicalPath = "/",
  type = "website",
  image = `${getSiteBaseUrl()}/og-image.png`,
  publishedTime,
  modifiedTime,
  tags = [],
  noIndex = false,
  locale = "id_ID"
}) => {
  const base = getSiteBaseUrl();
  const canonical = `${base}${canonicalPath}`.replace(/\/$/, canonicalPath.endsWith("/") ? canonicalPath : canonicalPath);
  const keywords = tags.join(", ");

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonical} />
      {/* FORCE NOINDEX FOR ALL PAGES */}
      <meta name="robots" content="noindex, nofollow" />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content={locale} />
      <meta property="og:site_name" content="Mind MHIRC" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Article specific */}
      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === "article" && (modifiedTime || publishedTime) && (
        <meta property="article:modified_time" content={modifiedTime || publishedTime} />
      )}
      {type === "article" && tags.map(t => (
        <meta property="article:tag" content={t} key={t} />
      ))}
    </Helmet>
  );
};

export default SEO;
