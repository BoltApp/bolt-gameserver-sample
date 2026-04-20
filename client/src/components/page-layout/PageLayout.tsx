import type { JSX } from "preact/jsx-runtime";
import styles from "./PageLayout.module.css";

export interface PageLayoutProps {
  children: JSX.Element | JSX.Element[];
}

function PageLayoutRoot({ children }: PageLayoutProps) {
  return <div className={styles.pageLayout}>{children}</div>;
}

export interface PageLayoutContentProps {
  children: JSX.Element | JSX.Element[];
  noMarginTop?: boolean;
}

function Content({ children, noMarginTop }: PageLayoutContentProps) {
  return (
    <div
      className={`${styles.content} ${noMarginTop ? styles.noMarginTop : ""}`}>
      {children}
    </div>
  );
}

export interface PageLayoutHeroProps {
  children: JSX.Element | JSX.Element[];
}

function Intro({ children }: PageLayoutHeroProps) {
  return <section className={styles.intro}>{children}</section>;
}

export const PageLayout = Object.assign(PageLayoutRoot, {
  Intro,
  Content,
});
