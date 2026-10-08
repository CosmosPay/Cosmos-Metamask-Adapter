import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { credits } from '@/content/credits';
import { privacy } from '@/content/privacy';
import { terms } from '@/content/terms';
import { DocumentPage } from '@/pages/DocumentPage';
import '@/styles/global.css';

/** Entry for the text pages: each page's HTML names its document on <body data-doc>. */
const DOCS = { privacy, terms, credits };

const isDoc = (name: string | undefined): name is keyof typeof DOCS => name !== undefined && name in DOCS;

const root = document.getElementById('root');
const name = document.body.dataset.doc;
if (!root) throw new Error('Missing #root element');
if (!isDoc(name)) throw new Error(`Unknown document: ${name}`);

createRoot(root).render(
  <StrictMode>
    <DocumentPage docs={DOCS[name]} />
  </StrictMode>,
);
