import type { JSX } from "preact/jsx-runtime";
import styles from "./PageLayout.module.css";

export interface PageLayoutProps {
  children: JSX.Element;
}

function PageLayoutRoot({ children }: PageLayoutProps) {
  return <div className={styles.pageLayout}>{children}</div>;
}

export interface PageLayoutContentProps {
  children: JSX.Element | JSX.Element[];
}

function Content({ children }: PageLayoutContentProps) {
  return <div className={styles.content}>{children}</div>;
}

export interface PageLayoutHeroProps {
  children: JSX.Element | JSX.Element[];
}

function Hero({ children }: PageLayoutHeroProps) {
  return <section className={styles.hero}>{children}</section>;
}

export const PageLayout = Object.assign(PageLayoutRoot, {
  Hero,
  Content,
});
