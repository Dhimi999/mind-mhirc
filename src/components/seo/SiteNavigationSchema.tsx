/**
 * SiteNavigationSchema
 *
 * Merender dua blok JSON-LD via react-helmet-async ke <head>:
 *
 * 1. SiteNavigationElement (ItemList)
 *    Memberi tahu Google semua link navigasi utama → membantu Google
 *    menampilkan Sitelinks di bawah hasil pencarian utama.
 *
 * 2. Organization
 *    Memperkuat entitas "Mind MHIRC" di Knowledge Graph Google
 *    (nama, URL, logo, deskripsi, kontak).
 *
 * Komponen ini dirender GLOBAL di App.tsx sehingga ada di setiap halaman.
 */

import React from "react";
import { Helmet } from "react-helmet-async";

const SITE = "https://mind-mhirc.my.id";

/** Daftar navigasi utama — sesuai dengan Navbar */
const NAV_ITEMS = [
  {
    name: "Beranda",
    url: `${SITE}/`,
    description: "Halaman utama Mind MHIRC – informasi layanan dan program kesehatan mental",
  },
  {
    name: "Tes Psikologis",
    url: `${SITE}/tests`,
    description: "Tes kesehatan mental tervalidasi untuk mengevaluasi kondisi psikologis Anda",
  },
  {
    name: "Layanan",
    url: `${SITE}/services`,
    description: "Konsultasi psikologis, program edukasi, dan pendampingan kelompok",
  },
  {
    name: "Blog",
    url: `${SITE}/blog`,
    description: "Artikel edukasi kesehatan mental dari tim peneliti dan psikolog Mind MHIRC",
  },
  {
    name: "Tentang Kami",
    url: `${SITE}/about`,
    description: "Profil, misi, tim, dan nilai-nilai Mind MHIRC dalam kesehatan mental",
  },
  {
    name: "Safe Mother",
    url: `${SITE}/safe-mother`,
    description: "Program kesehatan mental maternal untuk ibu hamil dan pasca-nifas",
  },
  {
    name: "Spiritual & Budaya",
    url: `${SITE}/spiritual-budaya`,
    description: "Intervensi berbasis kearifan spiritual dan budaya lokal Indonesia",
  },
  {
    name: "Hibrida Naratif CBT",
    url: `${SITE}/hibrida-cbt`,
    description: "Program terapi kognitif-perilaku berbasis naratif hibrida",
  },
];

const siteNavigationSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Navigasi Utama Mind MHIRC",
  "description": "Daftar halaman utama platform kesehatan mental Mind MHIRC",
  "itemListElement": NAV_ITEMS.map((item, index) => ({
    "@type": "SiteNavigationElement",
    "position": index + 1,
    "name": item.name,
    "description": item.description,
    "url": item.url,
  })),
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Mind MHIRC",
  "alternateName": "Mental Health Innovation Research Centre",
  "url": SITE,
  "logo": {
    "@type": "ImageObject",
    "url": `${SITE}/og-image.png`,
    "width": 512,
    "height": 512,
  },
  "description":
    "Pusat inovasi dan riset kesehatan mental berbasis bukti dan peka budaya untuk masyarakat Indonesia. Menyediakan layanan konsultasi, edukasi, dan program intervensi digital.",
  "foundingLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "ID",
    },
  },
  "knowsAbout": [
    "Kesehatan Mental",
    "Psikologi Klinis",
    "Cognitive Behavioral Therapy",
    "Maternal Mental Health",
    "Intervensi Digital",
    "Psikoedukasi",
  ],
  "sameAs": [],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "availableLanguage": "Indonesian",
  },
};

const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Mind MHIRC",
  "url": SITE,
  "description":
    "Platform kesehatan mental berbasis bukti dan budaya — tes psikologis, layanan konsultasi, dan program intervensi digital.",
  "inLanguage": "id-ID",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${SITE}/blog?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const SiteNavigationSchema: React.FC = () => {
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(siteNavigationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(webSiteSchema)}
      </script>
    </Helmet>
  );
};

export default SiteNavigationSchema;
